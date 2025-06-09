// zpay的订单返回值
export type ZPayOrderResponse = {
  code: string;
  msg: string;
  status: string;
  name: string;
  money: string;
  out_trade_no: string;
  trade_no: string;
  type: string;
  param: string;
  addtime: string;
  endtime: string;
  pid: string;
  buyer: string;
};
// zpay的支付自定义参数（param字段）
export type ZPayPaymentParam = {
  id: string;
  uid: string;
};

// 易支付的订单返回值
export type YiPayOrderResponse = {
  code: number;
  trade_no: string;
  out_trade_no: string;
  api_trade_no: string;
  type: string;
  pid: string;
  addtime: string;
  endtime: string;
  name: string;
  money: string;
  param: string;
  buyer: string;
  clientip: string;
  status: string;
  timestamp: string;
  sign_type: string;
  sign: string;
};

// 易支付回调参数参数
export type YiPayWebhookParams = {
  pid: number;
  trade_no: string;
  out_trade_no: string;
  api_trade_no: string;
  type: string;
  trade_status: string;
  addtime: string;
  endtime?: string;
  name: string;
  money: string;
  param: string;
  buyer: string;
  timestamp: string;
  sign: string;
  sign_type: string;
};

// 易支付请求参数接口
export type YiPayParams = {
  pid: string;
  type: string;
  out_trade_no: string;
  notify_url: string;
  return_url: string;
  name: string;
  money: string;
  param: string;
  timestamp: string;
};

// 完整请求体接口
export type YiPayRequestBody = YiPayParams & {
  sign: string;
  sign_type: "RSA";
};

// 易支付的支付自定义参数（param字段）
export type YiPayPaymentParam = {
  id: string;
  uid: string;
};
