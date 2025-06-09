import api from "@/config/api";
import checkoutConfig from "@/config/checkout";
import { redirectToYiPay } from "../providers/yipay";
import type { YiPayRequestBody } from "@/modules/billing/types/provider.type";
interface createCheckoutBody {
  id: string;
  price: number;
  priceId?: string;
}

export default function useCheckout() {
  const { user } = useUser();

  const createCheckout = async (body: createCheckoutBody) => {
    if (!user.value) {
      return navigateTo("/auth/signin");
    }

    const data = await $fetch<string | YiPayRequestBody>(api.checkout, {
      method: "POST",
      body,
    });

    const { provider } = checkoutConfig;

    switch (provider) {
      case "zpay":
        navigateTo(data, { external: true });
        break;
      case "yipay":
        await redirectToYiPay(data as YiPayRequestBody);
        break;
      case "stripe":
        navigateTo(data, { external: true });
        break;
    }
  };

  return {
    createCheckout,
  };
}
