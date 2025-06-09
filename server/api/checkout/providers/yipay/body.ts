import { generateSign } from "./utils";
import checkoutConfig from "@/config/checkout";
import { generateOrderNo, getProductById } from "@/modules/billing/utils";
import type {
  YiPayRequestBody,
  YiPayParams,
} from "@/modules/billing/types/provider.type";

export const getYiPayCheckoutBody = async (
  id: string,
  price: number,
  uid: string
): Promise<YiPayRequestBody> => {
  const { successUrl, yipay } = checkoutConfig;
  const { pid, type, webhookUrl } = yipay as {
    pid: string;
    type: string;
    webhookUrl: string;
  };

  const out_trade_no = generateOrderNo();
  const product = getProductById(id);
  const param = {
    id,
    uid,
  };

  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
    });
  }

  const params: YiPayParams = {
    pid,
    type,
    out_trade_no,
    notify_url: webhookUrl as string,
    return_url: successUrl as string,
    name: product.name,
    money: price.toFixed(2),
    param: encodeURIComponent(JSON.stringify(param)),
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  const sign = generateSign(params, process.env.YIPAY_PRIVATE_KEY as string);

  const body: YiPayRequestBody = {
    ...params,
    sign,
    sign_type: "RSA",
  };

  return body;
};
