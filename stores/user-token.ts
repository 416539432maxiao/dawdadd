import { defineStore } from "pinia";
import type { Database } from "@/modules/shared/types/database.types";
import { DB_TABLES } from "@/config/db/tables";

type UserSubscriptionToken =
  Database["public"]["Tables"]["nuxtbase_user_subscription_token"]["Row"] & {
    subscription: Database["public"]["Tables"]["nuxtbase_user_subscription"]["Row"];
  };
type UserOnetimeToken =
  Database["public"]["Tables"]["nuxtbase_user_onetime_token"]["Row"];

export const useUserTokenStore = defineStore("user-token", () => {
  // 状态
  const loading = ref(false);
  const subscriptionToken = ref<UserSubscriptionToken | null>(null);
  const onetimeToken = ref<UserOnetimeToken | null>(null);

  // 新增 token 历史记录相关状态
  const tokenHistory = ref<any[]>([]);
  const historyLoading = ref(false);
  const historyLoadingMore = ref(false);
  const hasMoreHistory = ref(false);
  const currentHistoryPage = ref(0);
  const historyPageSize = 5;

  // 获取 Supabase 客户端和用户信息
  const client = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const { userPlan } = useUser();

  const totalOnetimeTokens = computed(() => {
    return onetimeToken.value?.total_tokens || 0;
  });

  const usedOnetimeTokens = computed(() => {
    return onetimeToken.value?.used_tokens || 0;
  });

  const remainingOnetimeTokens = computed(() => {
    return totalOnetimeTokens.value - usedOnetimeTokens.value;
  });

  const remainingSubscriptionTokens = computed(() => {
    if (!subscriptionToken.value) return 0;
    return (
      subscriptionToken.value.total_tokens - subscriptionToken.value.used_tokens
    );
  });

  // 加载订阅token数据
  async function loadSubscriptionTokens(userId: string) {
    if (!userPlan.value?.out_trade_no && !userPlan.value?.id) return null;

    let subscriptionId = userPlan.value?.id;

    if (userPlan.value.payment_provider === "stripe") {
      // 先通过 out_trade_no 获取订阅 ID
      const { data: subscription } = await client
        .from(DB_TABLES.USER_SUBSCRIPTION)
        .select("id")
        .eq("out_trade_no", userPlan.value.out_trade_no)
        .single();

      subscriptionId = subscription?.id;
    }

    const { data, error } = await client
      .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
      .select("*, subscription:nuxtbase_user_subscription(*)")
      .eq("uid", userId)
      .eq("subscription_id", subscriptionId)
      .single();

    if (error) {
      console.error("Error loading subscription tokens:", error);
      return null;
    }

    subscriptionToken.value = data;

    return data;
  }

  // 加载一次性token数据
  async function loadOnetimeTokens(userId: string) {
    const { data, error } = await client
      .from(DB_TABLES.USER_ONETIME_TOKEN)
      .select()
      .eq("uid", userId)
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (error) {
      console.error("Error loading onetime tokens:", error);
      return null;
    }

    onetimeToken.value = data;

    return data;
  }

  // 加载用户所有token数据
  async function loadUserTokens() {
    if (!user.value) return;

    loading.value = true;
    try {
      await Promise.all([
        loadSubscriptionTokens(user.value.id),
        loadOnetimeTokens(user.value.id),
      ]);
    } catch (error) {
      console.error("Error loading user tokens:", error);
    } finally {
      loading.value = false;
    }
  }

  // 从订阅中扣减token并记录历史
  async function deductFromSubscription(
    token: UserSubscriptionToken,
    amount: number,
    model: string
  ) {
    const { error: deductError } = await client
      .from(DB_TABLES.USER_SUBSCRIPTION_TOKEN)
      .update({ used_tokens: token.used_tokens + amount })
      .eq("id", token.id);

    if (deductError) {
      console.error("Error deducting subscription tokens:", deductError);
      return false;
    }

    // 添加使用记录
    const { error: historyError } = await client
      .from(DB_TABLES.USER_TOKEN_HISTORY)
      .insert({
        uid: user.value?.id,
        subscription_token_id: token.id,
        tokens_used: amount,
        model,
      });

    if (historyError) {
      console.error("Error adding token history:", historyError);
    }

    return true;
  }

  // 从一次性token中扣减并记录历史
  async function deductFromOnetime(
    token: UserOnetimeToken,
    amount: number,
    model: string
  ) {
    const { error: deductError } = await client
      .from(DB_TABLES.USER_ONETIME_TOKEN)
      .update({ used_tokens: token.used_tokens + amount })
      .eq("id", token.id);

    if (deductError) {
      console.error("Error deducting onetime tokens:", deductError);
      return false;
    }

    // 添加使用记录
    const { error: historyError } = await client
      .from(DB_TABLES.USER_TOKEN_HISTORY)
      .insert({
        uid: user.value?.id,
        onetime_token_id: token.id,
        tokens_used: amount,
        model,
      });

    if (historyError) {
      console.error("Error adding token history:", historyError);
    }

    return true;
  }

  // 扣减token的主方法
  async function deductTokens(amount: number, model: string) {
    if (!user.value) return false;

    if (remainingSubscriptionTokens.value > 0) {
      // 从订阅中扣减
      if (!subscriptionToken.value) return false;

      const success = await deductFromSubscription(
        subscriptionToken.value,
        amount,
        model
      );
      if (success) {
        await loadSubscriptionTokens(user.value.id);
        return true;
      }
    } else if (remainingOnetimeTokens.value > 0) {
      // 从一次性token中扣减
      if (!onetimeToken.value) return false;

      const success = await deductFromOnetime(
        onetimeToken.value,
        amount,
        model
      );
      if (success) {
        await loadOnetimeTokens(user.value.id);
        return true;
      }
    }

    return false;
  }

  // 获取token使用历史
  async function fetchTokenHistory(page = 0) {
    if (!user.value) return;

    const isInitialLoad = page === 0;
    if (isInitialLoad) {
      historyLoading.value = true;
    } else {
      historyLoadingMore.value = true;
    }

    try {
      const { data, error, count } = await client
        .from(DB_TABLES.USER_TOKEN_HISTORY)
        .select("*", { count: "exact" })
        .eq("uid", user.value.id)
        .order("created_at", { ascending: false })
        .range(page * historyPageSize, (page + 1) * historyPageSize - 1);

      if (error) throw error;

      if (isInitialLoad) {
        tokenHistory.value = data || [];
      } else {
        tokenHistory.value = [...tokenHistory.value, ...(data || [])];
      }

      hasMoreHistory.value = (count || 0) > (page + 1) * historyPageSize;
      currentHistoryPage.value = page;
    } catch (error: any) {
      console.error("Error fetching token history:", error);
    } finally {
      if (isInitialLoad) {
        historyLoading.value = false;
      } else {
        historyLoadingMore.value = false;
      }
    }
  }

  // 加更多历史记录
  async function loadMoreHistory() {
    await fetchTokenHistory(currentHistoryPage.value + 1);
  }

  // 监听用户变化时也加载历史记录
  watch(
    [user, userPlan],
    () => {
      if (user.value) {
        loadUserTokens();
      } else {
        subscriptionToken.value = null;
        onetimeToken.value = null;
        tokenHistory.value = [];
        currentHistoryPage.value = 0;
        hasMoreHistory.value = false;
      }
    },
    { immediate: true }
  );

  return {
    loading,
    subscriptionToken,
    onetimeToken,
    totalOnetimeTokens,
    usedOnetimeTokens,
    remainingOnetimeTokens,
    remainingSubscriptionTokens,
    loadUserTokens,
    deductTokens,
    tokenHistory,
    historyLoading,
    historyLoadingMore,
    hasMoreHistory,
    fetchTokenHistory,
    loadMoreHistory,
  };
});
