<template>
  <div class="space-y-4">
    <div class="rounded-lg border p-4">
      <div class="flex items-center justify-between">
        <Label class="font-medium text-foreground">当前订阅</Label>
      </div>

      <!-- Loading Skeleton -->
      <div v-if="!loaded" class="mt-3">
        <div class="flex items-center justify-between">
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-32" />
        </div>
      </div>

      <!-- Subscription Info -->
      <div
        v-else
        class="flex flex-col lg:flex-row lg:items-center justify-between mt-3"
      >
        <!-- 左侧 -->
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <LucideCrown v-if="isSubscribed" class="w-4 h-4 text-yellow-500" />
            <span
              :class="{
                'text-sm text-primary dark:text-primary-foreground':
                  isSubscribed,
                'text-sm': !isSubscribed,
              }"
            >
              {{ isSubscribed ? "付费用户" : "免费版" }}
            </span>
            <div
              class="text-sm text-muted-foreground dark:text-muted-foreground"
              v-if="isSubscribed"
            >
              ({{ formatDate(subscription?.last_expire_time) }}到期)
            </div>
          </div>
        </div>

        <Button
          class="mt-2 lg:mt-0"
          variant="default"
          size="sm"
          @click="openBillingPortal"
          :disabled="isLoading"
        >
          <template v-if="isLoading">
            <LucideLoader2 class="mr-2 h-4 w-4 animate-spin" />
            加载中...
          </template>
          <template v-else>
            {{ btnText }}
          </template>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import checkConfig from "@/config/checkout/index";
import { format } from "date-fns";
import { LucideLoader2 } from "lucide-vue-next";

const { userPlan, loaded } = useUser();
const subscription = computed(() => userPlan.value);
const isSubscribed = computed(() => subscription.value?.product_id);
const isStripe = computed(() => checkConfig.provider === "stripe");
const isLoading = ref(false);

const formatDate = (timestamp?: string) => {
  if (!timestamp) return "-";
  return format(new Date(timestamp), "yyyy年MM月dd日");
};

const btnText = computed(() => {
  if (isSubscribed.value) {
    return isStripe.value ? "管理订阅" : "续期";
  } else {
    return "去升级";
  }
});

const openBillingPortal = async () => {
  if (isLoading.value) return;

  isLoading.value = true;
  if (isStripe.value && isSubscribed.value) {
    try {
      const { url } = await $fetch<{ url: string }>(
        "/api/checkout/providers/stripe/portal"
      );
      window.open(url, "_blank");
    } catch (error) {
      console.error("Failed to open Stripe portal:", error);
    } finally {
      isLoading.value = false;
    }
  } else {
    navigateTo("/pricing");
    isLoading.value = false;
  }
};
</script>
