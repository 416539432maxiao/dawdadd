import { serverSupabaseServiceRole } from "#supabase/server";
import { H3Event } from "h3"; // 添加这行
import { PaymentHistory } from "@/modules/billing/types/payment.type";
import { DB_TABLES } from "@/config/db/tables";
import type { Database } from "@/modules/shared/types/database.types";

/**
 * Insert a new payment history record into database
 * @param payment Payment history data to insert
 * @param event H3Event for server supabase client
 * @returns The inserted payment history record
 */
export async function insertPaymentHistory(
  payment: PaymentHistory,
  event: H3Event
) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { data, error } = await client
    .from(DB_TABLES.PAYMENT_HISTORY)
    .insert(payment)
    .select()
    .single();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to create payment history" + JSON.stringify(error),
      cause: error,
    });
  }

  return data;
}

/**
 * Get user's active subscription status and expiry date
 * @param uid User ID to check subscription for
 * @param event H3Event for server supabase client
 * @returns Object containing subscription status and expiry date
 */
export async function getUserSubscriptionStatus(uid: string, event: H3Event) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { data, error } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION)
    .select("*")
    .eq("uid", uid)
    .gte("expire_time", new Date().toISOString())
    .order("expire_time", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Failed to get subscription status",
      cause: error,
    });
  }

  return {
    isSubscribed: !!data?.product_id,
    expireTime: data?.expire_time || null
  };
}

