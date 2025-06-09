import { serverSupabaseUser, serverSupabaseClient } from "#supabase/server";
import { DB_TABLES } from "@/config/db/tables";
import checkConfig from "@/config/checkout/index";
import Stripe from "stripe";
import type { H3Event } from "h3";
import type { UserSubscription } from "@/modules/shared/types/database.types";

// 从Stripe获取订阅信息
async function getStripeSubscription(userId: string) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

  // 查找用户对应的 stripe customer
  const customers = await stripe.customers.search({
    query: `metadata['uid']:'${userId}'`,
    limit: 1,
  });

  if (customers.data.length === 0) {
    return null;
  }

  // 获取用户的所有订阅
  const subscriptions = await stripe.subscriptions.list({
    customer: customers.data[0].id,
    status: "active",
    limit: 1,
    expand: ["data.items.data.price"],
  });

  if (subscriptions.data.length === 0) {
    return null;
  }

  const subscription = subscriptions.data[0];

  // format to database format
  return {
    uid: userId,
    product_id: customers.data[0].metadata.product_id,
    status: subscription.status,
    payment_provider: "stripe",
    start_time: new Date(
      subscription.current_period_start * 1000
    ).toISOString(),
    expire_time: new Date(subscription.current_period_end * 1000).toISOString(),
    out_trade_no: subscription.id,
  };
}

// 从数据库获取订阅信息
async function getDatabaseSubscription(userId: string, event: H3Event) {
  const now = new Date().toISOString();
  const client = await serverSupabaseClient(event);

  // 获取所有订阅记录，包括未来的订阅
  const { data: subscriptions, error } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION)
    .select("*")
    .eq("uid", userId)
    .or(`and(start_time.lte.${now},expire_time.gte.${now}),expire_time.gte.${now}`)
    .order("start_time", { ascending: true });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "获取订阅信息失败",
    });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return null;
  }

  const typedSubscriptions = subscriptions as UserSubscription[];

  // 获取当前有效的第一个订阅
  const currentSubscription = typedSubscriptions.find(
    sub => sub.start_time <= now && sub.expire_time >= now
  );

  if (!currentSubscription) {
    return null;
  }

  // 获取最后一个订阅的过期时间（可能是未来的订阅）
  const latestExpireTime = typedSubscriptions[typedSubscriptions.length - 1].expire_time;

  // 返回合并后的结果
  return {
    ...currentSubscription,
    last_expire_time: latestExpireTime,
  };
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event);
  if (!user) {
    throw createError({
      statusCode: 401,
      message: "AUTH_REQUIRED",
    });
  }

  if (checkConfig.provider === "stripe") {
    return await getStripeSubscription(user.id);
  } else {
    return await getDatabaseSubscription(user.id, event);
  }
});
