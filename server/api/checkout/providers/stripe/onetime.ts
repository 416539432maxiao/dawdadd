import type { H3Event } from "h3";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import Stripe from "stripe";
import { getProductById } from "@/modules/billing/utils";
import { insertPaymentHistory } from "@/server/api/checkout/utils";
import { handleTokens } from "./utils";

// 处理 Stripe Checkout Session 完成事件 (一次性支付)
export async function handleCheckoutSessionOneTimePayment(
  session: Stripe.Checkout.Session,
  event: H3Event
) {
  try {
    // 验证 session 状态
    if (session.status !== "complete") {
      throw createError({
        statusCode: 400,
        message: "Session is not complete",
      });
    }

    // 验证支付状态
    if (session.payment_status !== "paid") {
      throw createError({
        statusCode: 400,
        message: "Payment is not completed",
      });
    }

    const insertPayment = await createOneTimePayment(session);
    const paymentData = await insertPaymentHistory(insertPayment, event);
    await handleTokens(paymentData, event, session);
    return paymentData;
  } catch (error) {
    console.error("One-time payment handling error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to handle one-time payment",
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
}

// 创建一次性支付记录
export async function createOneTimePayment(
  session: Stripe.Checkout.Session
): Promise<PaymentHistory> {
  // 更严格的空值检查
  if (!session?.metadata?.product_id || !session?.metadata?.uid) {
    throw createError({
      statusCode: 400,
      message: "Missing required metadata in checkout session",
      data: { required: ["product_id", "uid"], received: session.metadata },
    });
  }

  // 验证产品
  const product = getProductById(session.metadata.product_id);
  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
      data: { product_id: session.metadata.product_id },
    });
  }

  // 确保金额存在且为正数
  if (!session.amount_total || session.amount_total <= 0) {
    throw createError({
      statusCode: 400,
      message: "Invalid payment amount",
      data: { amount: session.amount_total },
    });
  }

  return {
    product_id: session.metadata.product_id,
    uid: session.metadata.uid,
    product_name: product.name,
    payment_mode: "one_time",
    payment_provider: "stripe",
    amount: (session.amount_total || 0) / 100,
    currency: product.price_currency,
    status: "success",
    out_trade_no: session.id,
    created_at: new Date(),
    meta: session,
  };
}
