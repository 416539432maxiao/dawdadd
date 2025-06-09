import type { H3Event } from "h3";
import Stripe from "stripe";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import {
  handleCheckoutSessionOneTimePayment,
} from "./onetime";
import {
  handleCheckoutSessionSubscription,
  handleSubscriptionUpdate,
  handleInvoicePayment,
} from "./subscription";
import { sendLarkNotification } from "./utils";

const relevantEvents = new Set([
  // Payment completed
  "checkout.session.completed",
  // Subscription created
  "customer.subscription.created",
  // Subscription updated
  "customer.subscription.updated",
  // Subscription deleted
  "customer.subscription.deleted",
  // Subscription invoice payment (including first payment and subsequent payments)
  "invoice.paid",
]);

export default defineEventHandler(async (event: H3Event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const body = await readRawBody(event);
  const signature = getHeader(event, "stripe-signature");

  if (!body || !signature) {
    throw createError({
      statusCode: 400,
      message: "Missing body or stripe signature",
    });
  }

  let stripeEvent: Stripe.Event;

  // Verify Stripe webhook event
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    throw createError({
      statusCode: 400,
      message: `Webhook Error: ${(err as Error).message}`,
    });
  }

  // Handle Stripe webhook event
  if (relevantEvents.has(stripeEvent.type)) {
    let paymentData: PaymentHistory | null = null;

    switch (stripeEvent.type) {
      // Payment completed
      case "checkout.session.completed":
        const session = stripeEvent.data.object as Stripe.Checkout.Session;
        if (session.mode === "payment") {
          // One-time payment
          paymentData = await handleCheckoutSessionOneTimePayment(
            session,
            event
          );
        } else if (session.mode === "subscription") {
          // Subscription payment
          paymentData = await handleCheckoutSessionSubscription(session, event);
        }
        break;
      // Subscription created, updated, deleted
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        paymentData = await handleSubscriptionUpdate(
          subscription,
          event,
          stripeEvent.type
        );
        break;
      // Subscription invoice payment
      case "invoice.paid":
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        paymentData = await handleInvoicePayment(invoice, event);
        break;
    }

    if (paymentData) {
      await sendLarkNotification(paymentData);
    }

    setResponseStatus(event, 200);
    return "success";
  }
});
