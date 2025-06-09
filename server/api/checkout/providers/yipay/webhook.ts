import { H3Event } from "h3";
import { verifySign, queryOrder, createPaymentHistoryData } from "./utils";
import { getProductById } from "@/modules/billing/utils";
import type {
  YiPayOrderResponse,
  YiPayWebhookParams,
  YiPayPaymentParam,
} from "@/modules/billing/types/provider.type";
import { insertPaymentHistory } from "@/server/api/checkout/utils";
import { createSubscription } from "./utils";
import aiConfig from "@/config/ai";
import { addSubscriptionToken, addOnetimeToken } from "@/server/utils/ai-tools";

export default defineEventHandler(async (event: H3Event) => {
  const query: YiPayWebhookParams = getQuery(event);
  const { trade_status, out_trade_no, param, money } = query;

  const isValidSign = verifySign(query);

  if (!isValidSign) {
    throw createError({
      statusCode: 400,
      message: "Invalid signature",
    });
  }

  // 验证交易状态
  if (trade_status !== "TRADE_SUCCESS") {
    throw createError({
      statusCode: 400,
      message: "Trade not successful",
    });
  }

  // 验证订单金额是否和订单金额一致
  const decodedParam = decodeURIComponent(param as string);
  const { id, uid } = JSON.parse(decodedParam) as YiPayPaymentParam;
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

  // 查询订单
  const order: YiPayOrderResponse = await queryOrder({
    out_trade_no: out_trade_no as string,
  });
  if (Number(order.status) !== 1) {
    throw createError({
      statusCode: 400,
      message: "Order not paid",
    });
  }

  // 创建支付历史记录的入库数据
  const payment = createPaymentHistoryData({
    id,
    uid,
    order,
    product,
  });

  const insertedPayment = await insertPaymentHistory(payment, event);

  if (product.mode === "subscription" && product.subscription_duration) {
    const subscription = await createSubscription(
      insertedPayment,
      product.subscription_duration,
      event
    );

    // 添加订阅token逻辑
    if (aiConfig.enable && product.token_limit) {
      await addSubscriptionToken({
        event,
        subscriptionId: subscription.id,
        totalTokens: product.token_limit as number,
        uid,
      });
    }
  }

  // 添加一次性token逻辑
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
