// 定义请求体类型
export type EmailSignInBody = {
  type: "email";
  email: string;
  password: string;
};

export type PhoneSignInBody = {
  type: "phone";
  phone: string;
  code: string;
};

export type SignInBody = EmailSignInBody | PhoneSignInBody;
