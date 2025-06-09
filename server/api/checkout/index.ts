import { H3Event } from "h3";
import { serverSupabaseUser } from "#supabase/server";
import checkoutConfig from "@/config/checkout";
import { getZPayCheckoutUrl } from "./providers/zpay/url";
import { getYiPayCheckoutBody } from "./providers/yipay/body";
import { getStripeCheckoutUrl } from "./providers/stripe/url";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const user = await serverSupabaseUser(event);
    const body = await readBody(event);
    const { id, price, priceId } = body;

    if (!id) {
      throw createError({
        statusCode: 400,
        message: "Order ID is required",
      });
    }

    const uid = user?.id as string;

    switch (checkoutConfig.provider) {
      case "zpay":
        return getZPayCheckoutUrl(id, price, uid);
      case "yipay":
        return getYiPayCheckoutBody(id, price, uid);
      case "stripe":
        return getStripeCheckoutUrl(id, priceId, uid);
      default:
        throw createError({
          statusCode: 400,
          message: "Invalid payment provider",
        });
    }
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
