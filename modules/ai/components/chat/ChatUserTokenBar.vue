<template>
  <div class="border rounded-lg p-3 space-y-2 m-2 text-xs">
    <!-- 订阅Token -->
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">订阅Token:</span>
      <span class="font-medium">
        {{ remainingSubscriptionTokens }}/{{
          subscriptionToken?.total_tokens || 0
        }}
      </span>
    </div>

    <div class="h-px bg-border"></div>

    <!-- 一次性Token -->
    <div class="flex items-center justify-between">
      <span class="text-muted-foreground">一次性Token:</span>
      <span class="font-medium">
        {{ remainingOnetimeTokens }}/{{ totalOnetimeTokens }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserTokenStore } from "@/stores/user-token";

const tokenStore = useUserTokenStore();

const {
  loading,
  subscriptionToken,
  remainingSubscriptionTokens,
  remainingOnetimeTokens,
  totalOnetimeTokens,
} = storeToRefs(tokenStore);
</script>
