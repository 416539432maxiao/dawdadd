// 支付历史记录
export type PaymentHistory = {
  id?: number;
  uid: string;
  product_id: string;
  product_name: string;
  payment_mode: "subscription" | "one_time";
  payment_provider: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed" | "refunded";
  out_trade_no: string;
  meta?: Record<string, any>;
  created_at?: Date;
  updated_at?: Date;
};
