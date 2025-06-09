import crypto from "crypto";
import type { H3Event } from "h3";
import { createError } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import checkoutConfig from "@/config/checkout";
import type {
  YiPayOrderResponse,
  YiPayWebhookParams,
} from "@/modules/billing/types/provider.type";
import type { Product } from "@/modules/billing/types/product.type";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import { getUserSubscriptionStatus } from "@/server/api/checkout/utils/index";
import type { Database } from "@/modules/shared/types/database.types";
// 生成签名
export const generateSign = (
  params: Record<string, any>,
  key: string
): string => {
  if (!key) {
    throw createError({
      statusCode: 500,
      message: "yipay private key is required",
    });
  }

  const formattedKey = key.includes("-----BEGIN PRIVATE KEY-----")
    ? key
    : `-----BEGIN PRIVATE KEY-----\n${key}\n-----END PRIVATE KEY-----`;

  // 1. Filter out empty values, sign and sign_type fields
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "sign" &&
        key !== "sign_type" &&
        !Array.isArray(value)
      );
    })
  );

  // 2. Sort by ASCII code and create signature string
  const signatureStr = Object.keys(filteredParams)
    .sort((a, b) => {
      // Compare each character until different
      for (let i = 0; i < Math.min(a.length, b.length); i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
          return a.charCodeAt(i) - b.charCodeAt(i);
        }
      }
      return a.length - b.length;
    })
    .map((key) => `${key}=${filteredParams[key]}`)
    .join("&");

  // 3. Use RSA private key to sign with SHA256WithRSA
  const sign = crypto
    .createSign("RSA-SHA256")
    .update(signatureStr)
    .sign(formattedKey, "base64");

  return sign;
};

// 验证签名
export const verifySign = (params: YiPayWebhookParams): boolean => {
  const { sign } = params;
  const publicKey = process.env.YIPAY_PUBLIC_KEY;

  // 格式化公钥
  const formattedPublicKey = publicKey?.includes("-----BEGIN PUBLIC KEY-----")
    ? publicKey
    : `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;

  // 1. 过滤参数
  const filteredParams = Object.fromEntries(
    Object.entries(params).filter(([key, value]) => {
      return (
        value !== null &&
        value !== undefined &&
        value !== "" &&
        key !== "sign" &&
        key !== "sign_type" &&
        !Array.isArray(value)
      );
    })
  );

  // 2. 按ASCII码排序并创建签名字符串
  const signatureStr = Object.keys(filteredParams)
    .sort()
    .map((key) => `${key}=${filteredParams[key]}`)
    .join("&");

  // 3. 使用公钥验证签名
  try {
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(signatureStr);
    return verify.verify(formattedPublicKey, sign, "base64");
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
};

// 查询订单
export const queryOrder = async (params: {
  trade_no?: string;
  out_trade_no?: string;
}) => {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const privateKey = process.env.YIPAY_PRIVATE_KEY;
  const requestParams = {
    pid: checkoutConfig.yipay.pid as string,
    trade_no: params.trade_no || "",
    out_trade_no: params.out_trade_no || "",
    timestamp,
    sign_type: "RSA",
  };

  // Generate signature
  const sign = generateSign(requestParams, privateKey as string);

  const finalParams = {
    ...requestParams,
    sign,
  };

  // Make POST request
  const response = await $fetch<YiPayOrderResponse>(
    "https://yi-pay.com/api/pay/query",
    {
      method: "POST",
      // 使用 URLSearchParams 格式化参数
      body: new URLSearchParams(finalParams).toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  return response;
};

// 创建支付历史记录的入库数据
export function createPaymentHistoryData({
  id,
  uid,
  order,
  product,
}: {
  id: string;
  uid: string;
  order: YiPayOrderResponse;
  product: Product;
}): PaymentHistory {
  return {
    uid,
    product_id: id,
    product_name: product.name,
    payment_mode: product.mode,
    payment_provider: "yipay",
    amount: Number(order.money),
    currency: product.price_currency,
    status: order.status === "1" ? "success" : "pending",
    out_trade_no: order.out_trade_no,
  };
}

export async function createSubscription(
  payment: PaymentHistory,
  duration: number,
  event: H3Event
) {
  if (payment.payment_mode !== "subscription") {
    return null;
  }

  const client = await serverSupabaseServiceRole<Database>(event);
  // 获取用户当前订阅状态
  const { expireTime: currentExpireTime } = await getUserSubscriptionStatus(
    payment.uid,
    event
  );

  // 如果用户有当前订阅，使用当前订阅的到期时间作为新订阅的开始时间，否则使用当前时间作为开始时间
  const startTime = currentExpireTime
    ? new Date(currentExpireTime)
    : new Date();
  const expireTime = new Date(startTime);
  expireTime.setDate(expireTime.getDate() + duration);

  const { data, error } = await client
    .from("nuxtbase_user_subscription")
    .insert({
      uid: payment.uid,
      product_id: payment.product_id,
      status: "active",
      payment_provider: "yipay",
      start_time: startTime.toISOString(),
      expire_time: expireTime.toISOString(),
      out_trade_no: payment.out_trade_no,
    })
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to create subscription: ${error.message}`,
    });
  }

  return data;
}
