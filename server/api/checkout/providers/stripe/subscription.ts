import type { H3Event } from "h3";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import Stripe from "stripe";
import { getProductById } from "@/modules/billing/utils";
import { serverSupabaseServiceRole } from "#supabase/server";
import type { Database } from "@/modules/shared/types/database.types";
import { DB_TABLES } from "@/config/db/tables";
import { insertPaymentHistory } from "@/server/api/checkout/utils";
import { handleTokens } from "./utils";

// 修改 subscription.ts 中的 handleCheckoutSessionSubscription 函数
export async function handleCheckoutSessionSubscription(
  session: Stripe.Checkout.Session,
  event: H3Event
) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  );

  // 1. 先获取客户信息
  const customer = await getStripeCustomer(
    stripe,
    subscription.customer as string
  );

  // 2. 先创建/更新订阅记录
  const subscriptionRecord = await upsertSubscriptionRecord(
    await serverSupabaseServiceRole<Database>(event),
    { subscription, customer }
  );

  // 3. 再处理支付相关
  const paymentData = await handleSubscriptionUpdate(
    subscription,
    event,
    "checkout.session.completed"
  );
  if (!paymentData) {
    throw createError({
      statusCode: 400,
      message: "Failed to handle subscription payment",
    });
  }

  // 4. 插入支付历史
  await insertPaymentHistory(paymentData, event);

  // 5. 最后处理token，确保使用正确的subscription记录
  const product = getProductById(customer.metadata.product_id);
  if (product?.token_limit && subscriptionRecord) {
    await handleSubscriptionTokens({
      event,
      subscription: subscriptionRecord, // 使用数据库中的订阅记录
      product,
      customer,
    });
  }

  return paymentData;
}

// Handle subscription update events (create/update/delete)
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription,
  event: H3Event,
  eventType: string
): Promise<PaymentHistory | null> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const client = await serverSupabaseServiceRole<Database>(event);

  // 1. Get customer information
  const customer = await getStripeCustomer(
    stripe,
    subscription.customer as string
  );

  // 2. Check if this subscription update has already been processed
  const { data: existingPayment } = await client
    .from(DB_TABLES.PAYMENT_HISTORY)
    .select()
    .eq("out_trade_no", subscription.id)
    .eq("payment_mode", "subscription")
    .single();

  if (existingPayment) {
    return null; // Already processed, return directly
  }

  // 3. Update subscription record
  const subscriptionData = await upsertSubscriptionRecord(client, {
    subscription,
    customer,
  });

  // 4. If it's a deletion event, return directly
  if (eventType === "customer.subscription.deleted") {
    return null;
  }

  // 5. Validate product and create payment record
  const product = await validateAndGetProduct(customer.metadata.product_id);
  const paymentData = createSubscriptionPayment(
    subscription,
    customer,
    product
  );

  // 6. Handle tokens (if needed)
  if (product.token_limit && subscriptionData) {
    await handleSubscriptionTokens({
      event,
      subscription: subscriptionData,
      product,
      customer,
    });
  }

  return paymentData;
}

// Handle invoice payment event
export async function handleInvoicePayment(
  invoice: Stripe.Invoice,
  event: H3Event
): Promise<PaymentHistory | null> {
  const client = await serverSupabaseServiceRole<Database>(event);

  // Check if this invoice has already been processed
  const { data: existingPayment } = await client
    .from(DB_TABLES.PAYMENT_HISTORY)
    .select()
    .eq("out_trade_no", invoice.id)
    .single();

  if (existingPayment) {
    return null; // Already processed, return directly
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const customer = await getStripeCustomer(stripe, invoice.customer as string);
  const product = await validateAndGetProduct(customer.metadata.product_id);

  // If there's a subscription_id, only update subscription status, don't create new payment record
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string
    );
    await upsertSubscriptionRecord(client, { subscription, customer });
  }

  return createInvoicePayment(invoice, customer, product);
}

// Helper functions
async function getStripeCustomer(stripe: Stripe, customerId: string) {
  const customer = await stripe.customers.retrieve(customerId);
  if (typeof customer === "string" || customer.deleted) {
    throw createError({
      statusCode: 400,
      message: "Customer not found or deleted",
    });
  }
  return customer;
}

async function validateAndGetProduct(productId: string) {
  const product = getProductById(productId);
  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
    });
  }
  return product;
}

async function upsertSubscriptionRecord(
  client: any,
  { subscription, customer }: any
) {
  const { data: subscriptionData, error: subscriptionError } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION)
    .upsert(
      {
        uid: customer.metadata.uid,
        product_id: customer.metadata.product_id,
        status: subscription.status === "active" ? "active" : "cancelled",
        payment_provider: "stripe",
        start_time: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        expire_time: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        out_trade_no: subscription.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "out_trade_no",
      }
    )
    .select()
    .single();

  if (subscriptionError) {
    throw createError({
      statusCode: 500,
      message: `Failed to update subscription: ${subscriptionError.message}`,
    });
  }

  return subscriptionData;
}

// Handle subscription tokens
async function handleSubscriptionTokens({
  event,
  subscription,  // 这里的subscription是数据库中的记录
  product,
  customer,
}: {
  event: H3Event;
  subscription: any;
  product: any;
  customer: Stripe.Customer;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  // 使用数据库中的订阅记录ID
  const { error: tokenError } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
    .upsert(
      {
        uid: customer.metadata.uid,
        subscription_id: subscription.id,  // 使用数据库中的订阅记录ID
        total_tokens: product.token_limit,
        used_tokens: 0,
      },
      {
        onConflict: "subscription_id",
        ignoreDuplicates: true,
      }
    );

  if (tokenError) {
    console.error('Token error:', tokenError);  // 添加错误日志
    throw createError({
      statusCode: 500,
      message: `Failed to handle subscription tokens: ${tokenError.message}`,
    });
  }
}

// Create invoice payment record
function createInvoicePayment(
  invoice: Stripe.Invoice,
  customer: Stripe.Customer,
  product: any
): PaymentHistory {
  return {
    product_id: customer.metadata.product_id,
    uid: customer.metadata.uid,
    product_name: product.name,
    payment_mode: "subscription",
    payment_provider: "stripe",
    amount: invoice.total / 100,
    currency: product.price_currency,
    status: "success",
    out_trade_no: invoice.id,
    meta: invoice,
  };
}

// Create subscription payment record
function createSubscriptionPayment(
  subscription: Stripe.Subscription,
  customer: Stripe.Customer,
  product: any
): PaymentHistory {
  return {
    product_id: customer.metadata.product_id,
    uid: customer.metadata.uid,
    product_name: product.name,
    payment_mode: "subscription",
    payment_provider: "stripe",
    amount: (subscription.items.data[0]?.price?.unit_amount || 0) / 100,
    currency: product.price_currency,
    status: "success",
    out_trade_no: subscription.id,
    meta: subscription,
  };
}
