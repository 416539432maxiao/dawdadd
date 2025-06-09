import type { YiPayRequestBody } from "@/modules/billing/types/provider.type";

export const redirectToYiPay = async (body: YiPayRequestBody) => {
  // Create form element
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://yi-pay.com/api/pay/submit";

  // Add input fields for each parameter
  Object.entries(body).forEach(([key, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = value;
    form.appendChild(input);
  });

  // Add form to document and submit
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};
