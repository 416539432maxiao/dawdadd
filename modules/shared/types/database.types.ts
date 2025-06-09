import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import type { SavedCompletion, SavedCompletionInsert } from "@/modules/ai/types/dify.type";

export interface Note {
  id: number;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface UserSubscription {
  id: number;
  uid: string;
  product_id: string;
  status: string;
  payment_provider: string;
  start_time: string;
  expire_time: string;
  out_trade_no: string;
  created_at: string;
  updated_at: string;
  last_expire_time?: string;
}

export interface UserSubscriptionToken {
  id: number;
  uid: string;
  subscription_id: number;
  total_tokens: number;
  used_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface UserOnetimeToken {
  id: number;
  uid: string;
  payment_id: number;
  total_tokens: number;
  used_tokens: number;
  created_at: string;
  updated_at: string;
}

export interface UserTokenHistory {
  id: number;
  uid: string;
  subscription_token_id?: number;
  onetime_token_id?: number;
  tokens_used: number;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  request_id: string;
  prompt: string;
  completion?: string;
  status: "success" | "error";
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      nuxtbase_demo_notes: {
        Row: Note;
        Insert: Omit<Note, "id" | "created_at" | "updated_at" | "user_id">;
        Update: Partial<
          Omit<Note, "id" | "created_at" | "updated_at" | "user_id">
        >;
      };
      nuxtbase_payment_history: {
        Row: PaymentHistory;
        Insert: Omit<PaymentHistory, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<PaymentHistory, "id" | "created_at" | "updated_at">
        >;
      };
      nuxtbase_user_subscription: {
        Row: UserSubscription;
        Insert: Omit<UserSubscription, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserSubscription, "id" | "created_at" | "updated_at">
        >;
      };
      nuxtbase_user_subscription_token: {
        Row: UserSubscriptionToken;
        Insert: Omit<UserSubscriptionToken, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserSubscriptionToken, "id" | "created_at" | "updated_at">
        >;
      };
      nuxtbase_user_onetime_token: {
        Row: UserOnetimeToken;
        Insert: Omit<UserOnetimeToken, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserOnetimeToken, "id" | "created_at" | "updated_at">
        >;
      };
      nuxtbase_user_token_history: {
        Row: UserTokenHistory;
        Insert: Omit<UserTokenHistory, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<UserTokenHistory, "id" | "created_at" | "updated_at">
        >;
      };
      dify_text_completion_saved: {
        Row: SavedCompletion;
        Insert: SavedCompletionInsert;
        Update: Partial<SavedCompletionInsert>;
      };
    };
  };
}
