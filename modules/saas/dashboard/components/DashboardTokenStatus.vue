<template>
  <div class="grid gap-4 md:grid-cols-2">
    <!-- 订阅 Token 卡片 -->
    <div class="rounded-lg border p-4 bg-background">
      <div class="flex items-center justify-between">
        <Label class="font-medium text-foreground">订阅 Token</Label>
        <LucideCrown
          v-if="subscriptionToken?.subscription?.status === 'active'"
          class="w-4 h-4 text-yellow-500"
        />
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="mt-3 space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
      </div>

      <!-- Subscription Token Info -->
      <div v-else class="mt-3">
        <div v-if="subscriptionToken" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Token用量</span>
            <span
              >{{ remainingSubscriptionTokens }}/{{
                subscriptionToken?.total_tokens
              }}</span
            >
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">已使用</span>
            <span>{{ subscriptionToken?.used_tokens }}</span>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">重置时间</span>
            <span>{{
              formatDate(subscriptionToken?.subscription?.expire_time)
            }}</span>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          暂无有效订阅，
          <NuxtLink to="/pricing" class="text-primary hover:underline"
            >去订阅</NuxtLink
          >
        </div>
      </div>
    </div>

    <!-- 一次性购买 Token 卡片 -->
    <div class="rounded-lg border p-4 bg-background">
      <div class="flex items-center justify-between">
        <Label class="font-medium text-foreground">一次性购买 Token</Label>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="loading" class="mt-3 space-y-2">
        <Skeleton class="h-4 w-full" />
        <Skeleton class="h-4 w-3/4" />
      </div>

      <!-- Onetime Token Info -->
      <div v-else class="mt-3">
        <div v-if="onetimeToken" class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">Token用量</span>
            <span class="font-medium"
              >{{ remainingOnetimeTokens }}/{{ totalOnetimeTokens }}</span
            >
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">已使用</span>
            <span>{{ usedOnetimeTokens }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm text-muted-foreground">有效时间</span>
            <span>永久有效</span>
          </div>
        </div>
        <div v-else class="text-sm text-muted-foreground">
          暂无一次性购买记录，
          <NuxtLink to="/pricing" class="text-primary hover:underline"
            >去购买</NuxtLink
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { useUserTokenStore } from "@/stores/user-token";

const tokenStore = useUserTokenStore();

const {
  loading,
  subscriptionToken,
  onetimeToken,
  totalOnetimeTokens,
  usedOnetimeTokens,
  remainingOnetimeTokens,
  remainingSubscriptionTokens,
} = storeToRefs(tokenStore);

// 格式化日期
function formatDate(dateString?: string) {
  if (!dateString) return "";
  return format(new Date(dateString), "yyyy-MM-dd");
}
</script>
