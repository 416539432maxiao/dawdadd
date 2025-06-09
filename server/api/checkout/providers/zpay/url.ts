import { generateOrderNo, getProductById } from "@/modules/billing/utils";
import checkoutConfig from "@/config/checkout";
import { getSign } from "./utils";
import qs from "qs";
import type { ZPayPaymentParam } from "@/modules/billing/types/provider.type";

export const getZPayCheckoutUrl = async (
  id: string,
  price: number,
  uid: string
) => {
  const url = "https://z-pay.cn/submit.php";
  const out_trade_no = generateOrderNo();
  const product = getProductById(id);

  if (!product) {
    throw createError({
      statusCode: 400,
      message: "Product not found",
    });
  }

  const { name } = product;
  const { successUrl } = checkoutConfig;
  const param: ZPayPaymentParam = {
    id,
    uid,
  };

  const query = {
    name,
    money: price,
    out_trade_no,
    param: encodeURIComponent(JSON.stringify(param)),
    type: checkoutConfig.zpay.type,
    pid: checkoutConfig.zpay.pid,
    notify_url: checkoutConfig.zpay.webhookUrl,
    return_url: successUrl,
  };

  const sign = getSign(query);

  const extraQuery = {
    // 签名
    sign,
    // 签名方法
    sign_type: "MD5",
  };

  const finalQuery = {
    ...query,
    ...extraQuery,
  };

  const finalUrl = `${url}?${qs.stringify(finalQuery)}`;

  return finalUrl;
};
