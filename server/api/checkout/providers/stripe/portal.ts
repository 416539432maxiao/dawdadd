import { serverSupabaseUser } from "#supabase/server";
import Stripe from "stripe";
import checkConfig from "@/config/checkout/index";

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "AUTH_REQUIRED",
    });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  const customers = await stripe.customers.search({
    query: `metadata['uid']:'${user.id}'`,
    limit: 1,
  });

  if (customers.data.length === 0) {
    throw createError({
      statusCode: 404,
      message: "No stripe customer found",
    });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customers.data[0].id,
    return_url: checkConfig.successUrl,
  });

  return { url: session.url };
});
