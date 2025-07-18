import type { Product } from "@/modules/billing/types/product.type";

// 产品ID
export const PRODUCTS_IDS = {
  TEST_BASIC_MONTHLY: "test-basic-monthly",
  TEST_PRO_MONTHLY: "test-pro-monthly",
  TEST_ULTIMATE_MONTHLY: "test-ultimate-monthly",
  TEST_BASIC_YEARLY: "test-basic-yearly",
  TEST_PRO_YEARLY: "test-pro-yearly",
  TEST_ULTIMATE_YEARLY: "test-ultimate-yearly",
  TEST_ONE_TIME: "test-one-time",
};

// 月度订阅
export const MONTHLY_SUBSCRIPTION_PRODUCTS: Product[] = [
  {
    id: PRODUCTS_IDS.TEST_BASIC_MONTHLY,
    name: "Basic Plan",
    description: "满足基本需求，适合个人和小型团队起步使用",
    price: 0.1,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "月",
    mode: "subscription",
    subscription_duration: 30,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QML88Gr5dzKVilAXFGcviQk",
    features: ["基础技术支持", "核心功能访问", "每月1,000 tokens"],
    token_limit: 1000,
  },
  {
    id: PRODUCTS_IDS.TEST_PRO_MONTHLY,
    name: "Pro Plan",
    description: "提供进阶功能，满足专业用户和成长型企业需求",
    price: 0.2,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "月",
    mode: "subscription",
    subscription_duration: 30,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QMLoyGr5dzKVilAMlZIBlFB",
    features: [
      "优先技术支持",
      "高级功能访问",
      "API完整访问权限",
      "自定义数据导出",
      "每月2,000 tokens",
    ],
    token_limit: 2000,
  },
  {
    id: PRODUCTS_IDS.TEST_ULTIMATE_MONTHLY,
    name: "Ultimate Plan",
    description: "完整功能解决方案，为大型企业提供最佳体验",
    price: 0.3,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "月",
    mode: "subscription",
    subscription_duration: 30,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QMLDYGr5dzKVilAInhhrBIt",
    features: [
      "24/7专属技术支持",
      "全部高级功能",
      "优先API访问权限",
      "定制化集成方案",
      "专属客户经理",
      "每月3,000 tokens",
    ],
    token_limit: 3000,
  },
];
// 年度订阅
export const YEARLY_SUBSCRIPTION_PRODUCTS: Product[] = [
  {
    id: PRODUCTS_IDS.TEST_BASIC_YEARLY,
    name: "Basic Plan",
    description: "满足基本需求，适合个人和小型团队起步使用",
    price: 1,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "年",
    mode: "subscription",
    subscription_duration: 365,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QMLA5Gr5dzKVilAgIunjh4C",
    features: [
      "基础技术支持",
      "核心功能访问",
      "年付享8.3折优惠",
      "每年12,000 tokens",
    ],
    token_limit: 12000,
  },
  {
    id: PRODUCTS_IDS.TEST_PRO_YEARLY,
    name: "Pro Plan",
    description: "提供进阶功能，满足专业用户和成长型企业需求",
    price: 2,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "年",
    mode: "subscription",
    subscription_duration: 365,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QMLCCGr5dzKVilAGI40WTBG",
    features: [
      "优先技术支持",
      "高级功能访问",
      "API完整访问权限",
      "自定义数据导出",
      "年付享8.3折优惠",
      "每年24,000 tokens",
    ],
    token_limit: 24000,
  },
  {
    id: PRODUCTS_IDS.TEST_ULTIMATE_YEARLY,
    name: "Ultimate Plan",
    description: "完整功能解决方案，为大型企业提供最佳体验",
    price: 3,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "年",
    mode: "subscription",
    subscription_duration: 365,
    stripe_mode: "subscription",
    stripe_price_id: "price_1QMLDxGr5dzKVilA7evVjxai",
    features: [
      "24/7专属技术支持",
      "全部高级功能",
      "优先API访问权限",
      "定制化集成方案",
      "专属客户经理",
      "年付享8.3折优惠",
      "每年36,000 tokens",
    ],
    token_limit: 36000,
  },
];
// 一次性购买
export const ONE_TIME_PRODUCTS: Product[] = [
  {
    id: PRODUCTS_IDS.TEST_ONE_TIME,
    name: "Basic One-Time",
    description: "基础功能包，一次性购买永久使用",
    price: 0.3,
    price_currency: "CNY",
    price_symbol: "¥",
    interval_unit: "次",
    mode: "one_time",
    stripe_mode: "payment",
    stripe_price_id: "price_1QMNBQGr5dzKVilATZT0KZIW",
    features: [
      "永久使用授权",
      "基础技术支持",
      "核心功能永久访问",
      "3,000 tokens",
    ],
    token_limit: 3000,
  },
];

// 所有产品
export const ALL_PRODUCTS = [
  ...MONTHLY_SUBSCRIPTION_PRODUCTS,
  ...YEARLY_SUBSCRIPTION_PRODUCTS,
  ...ONE_TIME_PRODUCTS,
];
