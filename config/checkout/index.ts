export default {
  provider: "zpay", // 支付提供商: zpay | yipay | stripe

  // 支付成功后跳转的URL
  successUrl: process.env.PAYMENT_SUCCESS_URL,

  // zpay支付
  zpay: {
    pid: process.env.ZPAY_PAY_PID,
    webhookUrl: process.env.ZPAY_WEBHOOK_URL,
    type: process.env.ZPAY_PAY_TYPE,
  },

  // 易支付
  yipay: {
    pid: process.env.YIPAY_PID,
    type: process.env.YIPAY_PAY_TYPE,
    webhookUrl: process.env.YIPAY_WEBHOOK_URL,
  },

  // stripe支付
  stripe: {},
};
