import Stripe from "stripe";
import { getProductById } from "@/modules/billing/utils";
import checkoutConfig from "@/config/checkout";

// Create or get customer
const getOrCreateCustomer = async (
  stripe: Stripe,
  uid: string,
  productId: string
) => {
  let customer = await stripe.customers.search({
    query: `metadata['uid']:'${uid}'`,
    limit: 1,
  });

  if (customer.data.length > 0) {
    return customer.data[0].id;
  }

  const newCustomer = await stripe.customers.create({
    metadata: {
      uid,
      product_id: productId,
    },
  });
  return newCustomer.id;
};

// Create subscription mode session
const createSubscriptionSession = async (
  stripe: Stripe,
  customerId: string,
  priceId: string,
  productId: string,
  uid: string,
  successUrl: string
) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    subscription_data: {
      metadata: {
        product_id: productId,
        uid,
      },
      trial_end: undefined,
    },
    metadata: {
      product_id: productId,
      uid,
    },
  });
};

// Create one-time payment mode session
const createPaymentSession = async (
  stripe: Stripe,
  customerId: string,
  priceId: string,
  productId: string,
  uid: string,
  successUrl: string
) => {
  return await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: successUrl,
    metadata: {
      product_id: productId,
      uid,
    },
  });
};

export const getStripeCheckoutUrl = async (
  id: string,
  priceId: string,
  uid: string
) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
  const { successUrl } = checkoutConfig;

  const product = getProductById(id);

  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
    });
  }

  const customerId = await getOrCreateCustomer(stripe, uid, id);

  let session;
  if (product.stripe_mode === "subscription") {
    session = await createSubscriptionSession(
      stripe,
      customerId,
      priceId,
      id,
      uid,
      successUrl as string
    );
  } else {
    session = await createPaymentSession(
      stripe,
      customerId,
      priceId,
      id,
      uid,
      successUrl as string
    );
  }

  return session.url;
};
