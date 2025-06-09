export type Product = {
  id: string; // 产品ID
  name: string; // 产品名称
  description: string; // 产品描述
  price: number; // 产品价格
  price_currency: string; // 价格所对应的货币 (如: CNY, USD)
  price_symbol: string; // 价格符号 (如: ¥, $)
  interval_unit?: string; // 订阅间隔单位 (如: month, year)
  mode: "subscription" | "one_time"; // 付款模式: subscription(订阅) 或 one_time(一次性)
  subscription_duration?: number; // 订阅时长，单位天，仅在订阅模式下有效
  stripe_price_id?: string; // Stripe价格ID
  stripe_mode?: "subscription" | "payment"; // Stripe支付模式
  features: string[]; // 产品特性列表
  token_limit?: number; // 令牌限制，仅在AI模式下有效(需配置config/ai.ts)
};
