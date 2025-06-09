import { serverSupabaseServiceRole } from "#supabase/server";
import { DB_TABLES } from "@/config/db/tables";
import type { Database } from "@/modules/shared/types/database.types";

// 1. 增加一条订阅token记录
export async function addSubscriptionToken({
  event,
  subscriptionId,
  totalTokens,
  uid,
}: {
  event: any;
  subscriptionId: number;
  totalTokens: number;
  uid: string;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { error } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
    .insert({
      uid: uid,
      subscription_id: subscriptionId,
      total_tokens: totalTokens,
      used_tokens: 0,
    });

  if (error) throw createError({ statusCode: 400, message: error.message });
}

// 2. 增加用户的一次性购买token
export async function addOnetimeToken({
  event,
  paymentId,
  totalTokens,
  uid,
}: {
  event: any;
  paymentId: number;
  totalTokens: number;
  uid: string;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  // 检查用户是否已有一次性token记录
  const { data: userToken } = await client
    .from(DB_TABLES.USER_ONETIME_TOKEN)
    .select()
    .eq("uid", uid)
    .single();

  if (userToken) {
    // 更新用户的token数量和支付ID
    const { error } = await client
      .from(DB_TABLES.USER_ONETIME_TOKEN)
      .update({
        total_tokens: userToken.total_tokens + totalTokens,
        payment_id: paymentId, // 更新为最新的支付ID
      })
      .eq("uid", uid);

    if (error) throw createError({ statusCode: 400, message: error.message });
  } else {
    // 创建新用户的token记录
    const { error } = await client.from(DB_TABLES.USER_ONETIME_TOKEN).insert({
      uid: uid,
      payment_id: paymentId,
      total_tokens: totalTokens,
      used_tokens: 0,
    });

    if (error) throw createError({ statusCode: 400, message: error.message });
  }
}

// 3. 减少用户的订阅token
export async function decreaseSubscriptionToken({
  event,
  subscriptionTokenId,
  tokensToUse,
}: {
  event: any;
  subscriptionTokenId: number;
  tokensToUse: number;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { data: token } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
    .select()
    .eq("id", subscriptionTokenId)
    .single();

  if (!token)
    throw createError({
      statusCode: 404,
      message: "Subscription token record not found",
    });

  const remainingTokens = token.total_tokens - token.used_tokens;
  if (remainingTokens < tokensToUse) {
    throw createError({
      statusCode: 400,
      message: "Insufficient subscription tokens",
    });
  }

  const { error } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
    .update({
      used_tokens: token.used_tokens + tokensToUse,
    })
    .eq("id", subscriptionTokenId);

  if (error) throw createError({ statusCode: 400, message: error.message });
}

// 4. 减少用户的一次性购买token
export async function decreaseOnetimeToken({
  event,
  onetimeTokenId,
  tokensToUse,
}: {
  event: any;
  onetimeTokenId: number;
  tokensToUse: number;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { data: token } = await client
    .from(DB_TABLES.USER_ONETIME_TOKEN)
    .select()
    .eq("id", onetimeTokenId)
    .maybeSingle();

  if (!token)
    throw createError({
      statusCode: 404,
      message: "未找到一次性购买token记录",
    });

  const remainingTokens = token.total_tokens - token.used_tokens;
  if (remainingTokens < tokensToUse) {
    throw createError({
      statusCode: 400,
      message: "Token不足",
    });
  }

  const { error } = await client
    .from(DB_TABLES.USER_ONETIME_TOKEN)
    .update({
      used_tokens: token.used_tokens + tokensToUse,
    })
    .eq("id", onetimeTokenId);

  if (error) throw createError({ statusCode: 400, message: error.message });
}

// 获取用户的token信息
// 获取用户的token信息
async function getUserTokens({ event, uid }: { event: any; uid: string }) {
  const client = await serverSupabaseServiceRole<Database>(event);
  const now = new Date().toISOString();

  // 检查是否有有效的订阅
  const { data: subscriptionTokens } = await client
    .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
    .select("*, subscription:nuxtbase_user_subscription(*)")
    .eq("uid", uid)
    .eq("subscription.status", "active")
    .lte("subscription.start_time", now) // 开始时间早于当前时间
    .gte("subscription.expire_time", now) // 过期时间晚于当前时间
    .order("subscription(start_time)", { ascending: true }); // 修改排序语法

  // 取第一个有效的订阅token
  const subscriptionToken = subscriptionTokens?.[0] || null;

  // 检查一次性购买token
  const { data: onetimeTokens } = await client
    .from(DB_TABLES.USER_ONETIME_TOKEN)
    .select()
    .eq("uid", uid)
    .order("created_at", { ascending: false });

  return {
    subscriptionToken,
    onetimeTokens,
  };
}

// 添加token使用历史记录
async function addTokenHistory({
  event,
  uid,
  subscriptionTokenId,
  onetimeTokenId,
  tokensUsed,
  model,
}: {
  event: any;
  uid: string;
  subscriptionTokenId?: number;
  onetimeTokenId?: number;
  tokensUsed: number;
  model: string;
}) {
  const client = await serverSupabaseServiceRole<Database>(event);

  const { error } = await client.from(DB_TABLES.USER_TOKEN_HISTORY).insert({
    uid,
    subscription_token_id: subscriptionTokenId,
    onetime_token_id: onetimeTokenId,
    tokens_used: tokensUsed,
    model,
  });

  if (error) throw createError({ statusCode: 400, message: error.message });
}

// 5. 判断用户token类型并扣减
export async function decreaseUserTokens({
  event,
  tokensToUse,
  model,
  uid,
}: {
  event: any;
  tokensToUse: number;
  model: string;
  uid: string;
}) {
  const { subscriptionToken, onetimeTokens } = await getUserTokens({
    event,
    uid,
  });

  if (subscriptionToken) {
    // 用户是订阅用户，使用订阅token
    await decreaseSubscriptionToken({
      event,
      subscriptionTokenId: subscriptionToken.id,
      tokensToUse,
    });
    // 记录使用历史
    await addTokenHistory({
      event,
      uid,
      subscriptionTokenId: subscriptionToken.id,
      tokensUsed: tokensToUse,
      model,
    });
    return;
  }

  const validOnetimeToken = onetimeTokens?.find(
    (token) => token.total_tokens - token.used_tokens >= tokensToUse
  );

  if (validOnetimeToken) {
    await decreaseOnetimeToken({
      event,
      onetimeTokenId: validOnetimeToken.id,
      tokensToUse,
    });
    // 记录使用历史
    await addTokenHistory({
      event,
      uid,
      onetimeTokenId: validOnetimeToken.id,
      tokensUsed: tokensToUse,
      model,
    });
    return;
  }

  throw createError({
    statusCode: 400,
    message: "Token不足，请先购买",
  });
}

// 6. 检查用户是否有足够的token
export async function hasEnoughTokens({
  event,
  tokensToUse,
  uid,
}: {
  event: any;
  tokensToUse: number;
  uid: string;
}) {
  const { subscriptionToken, onetimeTokens } = await getUserTokens({
    event,
    uid,
  });

  if (subscriptionToken) {
    const remainingTokens =
      subscriptionToken.total_tokens - subscriptionToken.used_tokens;
    return remainingTokens >= tokensToUse;
  }

  const validOnetimeToken = onetimeTokens?.find(
    (token) => token.total_tokens - token.used_tokens >= tokensToUse
  );

  return !!validOnetimeToken;
}
