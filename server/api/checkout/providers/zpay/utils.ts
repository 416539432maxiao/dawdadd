import _ from "lodash";
import qs from "qs";
import crypto from "crypto";
import type { H3Event } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import checkoutConfig from "@/config/checkout";
import type { ZPayOrderResponse } from "@/modules/billing/types/provider.type";
import type { Product } from "@/modules/billing/types/product.type";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import { getUserSubscriptionStatus } from "@/server/api/checkout/utils/index";
import type { Database } from "@/modules/shared/types/database.types";
// 获取签名
export function getSign(query: Record<string, any>) {
  const filteredQuery = _.omit(query, ["sign", "sign_type"]);
  const obj = _.fromPairs(_.sortBy(_.toPairs(filteredQuery), 0));
  const str = qs.stringify(obj, { encode: false });
  const sign = crypto
    .createHash("md5")
    .update(str + process.env.ZPAY_PAY_KEY)
    .digest("hex");

  return sign;
}

// 查询单个订单
export async function queryOrder(
  outTradeNo: string
): Promise<ZPayOrderResponse> {
  const params = {
    act: "order",
    pid: checkoutConfig.zpay.pid,
    key: process.env.ZPAY_PAY_KEY,
    out_trade_no: outTradeNo,
  };

  const queryString = qs.stringify(params);
  const url = `https://zpayz.cn/api.php?${queryString}`;
  const data = await $fetch<string>(url);

  try {
    return JSON.parse(data) as ZPayOrderResponse;
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: "Failed to query order",
    });
  }
}

// 创建支付历史记录的入库数据
export function createPaymentHistoryData({
  id,
  uid,
  order,
  product,
}: {
  id: string;
  uid: string;
  order: ZPayOrderResponse;
  product: Product;
}): PaymentHistory {
  return {
    uid,
    product_id: id,
    product_name: product.name,
    payment_mode: product.mode,
    payment_provider: "zpay",
    amount: Number(order.money),
    currency: product.price_currency,
    status: "success",
    meta: order,
    out_trade_no: order.out_trade_no,
  };
}

export async function createSubscription(
  payment: PaymentHistory,
  duration: number,
  event: H3Event
) {
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
      payment_provider: "zpay",
      start_time: startTime.toISOString(),
      expire_time: expireTime.toISOString(),
      out_trade_no: payment.out_trade_no,
    })
    .select()
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Failed to create subscription: ${error.message}`,
    });
  }

  return data;
}
