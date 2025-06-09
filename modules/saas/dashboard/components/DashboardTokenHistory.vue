<template>
  <div class="w-full space-y-4">
    <template v-if="historyLoading">
      <Card v-for="i in 3" :key="i" class="p-4">
        <div class="flex flex-col space-y-3">
          <div class="flex justify-between items-center">
            <Skeleton class="h-4 w-24" />
            <Skeleton class="h-4 w-32" />
          </div>
          <div class="flex justify-end items-center">
            <Skeleton class="h-4 w-20" />
          </div>
        </div>
      </Card>
    </template>

    <template v-else>
      <Card
        v-for="record in tokenHistory"
        :key="record.id"
        class="p-4 hover:bg-muted/50 transition-colors"
      >
        <div class="flex flex-col space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-sm font-medium">{{ record.model }}</span>
            <span class="text-sm font-medium"
              >{{ record.tokens_used }} tokens</span
            >
          </div>
          <div class="flex justify-end items-center">
            <span class="text-sm text-muted-foreground">{{
              formatDate(record.created_at)
            }}</span>
          </div>
        </div>
      </Card>

      <Card v-if="!historyLoading && tokenHistory.length === 0" class="p-4">
        <p class="text-center text-sm text-muted-foreground">暂无记录</p>
      </Card>

      <div v-if="hasMoreHistory" class="flex justify-center">
        <button
          class="text-sm text-primary hover:underline disabled:opacity-50 disabled:no-underline"
          :disabled="historyLoadingMore"
          @click="loadMoreHistory"
        >
          {{ historyLoadingMore ? "加载中..." : "加载更多" }}
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { format } from "date-fns";
import { useUserTokenStore } from "@/stores/user-token";

const tokenStore = useUserTokenStore();

const { tokenHistory, historyLoading, historyLoadingMore, hasMoreHistory } =
  storeToRefs(tokenStore);

const { loadMoreHistory, fetchTokenHistory } = tokenStore;

const formatDate = (date: string) => {
  return format(new Date(date), "yyyy-MM-dd HH:mm");
};

onMounted(() => {
  fetchTokenHistory(0);
});
</script>
