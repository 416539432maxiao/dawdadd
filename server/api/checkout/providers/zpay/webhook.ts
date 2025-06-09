import { H3Event } from "h3";
import { getSign, queryOrder, createPaymentHistoryData } from "./utils";
import { getProductById } from "@/modules/billing/utils";
import { insertPaymentHistory } from "@/server/api/checkout/utils";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import type {
  ZPayOrderResponse,
  ZPayPaymentParam,
} from "@/modules/billing/types/provider.type";
import { createSubscription } from "./utils";
import { addSubscriptionToken, addOnetimeToken } from "@/server/utils/ai-tools";
import aiConfig from "@/config/ai";

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const {
    name,
    money,
    out_trade_no,
    param,
    type,
    pid,
    trade_no,
    sign,
    trade_status,
  } = query;

  // 验证签名
  const params = {
    pid,
    name,
    money,
    out_trade_no,
    trade_no,
    param,
    trade_status,
    type,
  };

  // 计算签名
  const calculatedSign = getSign(params);

  // 验证签名是否一致
  if (calculatedSign !== sign) {
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }

  // 验证订单金额是否和订单金额一致
  const decodedParam = decodeURIComponent(param as string);
  const { id, uid } = JSON.parse(decodedParam) as ZPayPaymentParam;
  const product = getProductById(id);
  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
    });
  }

  // 验证订单金额
  if (Number(money).toFixed(2) !== Number(product.price).toFixed(2)) {
    throw createError({
      statusCode: 400,
      message: "Invalid order price",
    });
  }

  // 验证订单是否支付成功（和平台二次验证）
  const order: ZPayOrderResponse = await queryOrder(out_trade_no as string);
  if (order?.status !== "1") {
    throw createError({
      statusCode: 400,
      message: "Order not paid",
    });
  }

  // 创建支付历史记录
  const payment: PaymentHistory = createPaymentHistoryData({
    id,
    uid,
    order,
    product,
  });
  const insertedPayment = await insertPaymentHistory(payment, event);

  // 订阅模式下，创建用户订阅记录
  if (product.mode === "subscription" && product.subscription_duration) {
    const subscription = await createSubscription(
      insertedPayment,
      product.subscription_duration,
      event
    );
    // 如果AI模式开启，则增加订阅token
    if (aiConfig.enable && product.token_limit) {
      await addSubscriptionToken({
        event,
        subscriptionId: subscription.id,
        totalTokens: product.token_limit as number,
        uid,
      });
    }
  }

  // 如果AI模式开启，则增加一次性token
  if (product.mode === "one_time" && product.token_limit && aiConfig.enable) {
    await addOnetimeToken({
      event,
      paymentId: insertedPayment.id,
      totalTokens: product.token_limit as number,
      uid,
    });
  }

  /**
   * TODO:
   * 1. 验证该订单是否入库，根据out_trade_no
   * 2. 如果入库，则是重复的webhook，返回success
   * 3. 如果未入库，则创建订单入库
   */
  // 发送飞书webhook通知（测试使用）
  const webhookUrl = process.env.LARK_BOT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await $fetch(webhookUrl, {
        method: "POST",
        body: {
          msg_type: "text",
          content: {
            text: `收到新的支付订单通知\n订单号: 
            query: ${JSON.stringify(query)}
            order: ${JSON.stringify(order)}
            payment: ${JSON.stringify(insertedPayment)}
            `,
          },
        },
      });
    } catch (err) {
      console.error("Failed to send Lark webhook:", err);
    }
  }

  // 验证通过，返回success
  setResponseStatus(event, 200);

  return "success";
});
