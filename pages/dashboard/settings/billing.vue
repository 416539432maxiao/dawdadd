<script setup lang="ts">
definePageMeta({
  layout: "saas-dashboard",
});

useHead({
  title: "账单",
});

const tabs = [
  {
    title: "个人信息",
    value: "account",
    to: "/dashboard/settings",
  },
  {
    title: "账单",
    value: "billing",
    to: "/dashboard/settings/billing",
  },
];
</script>

<template>
  <div class="container py-8">
    <div class="flex flex-col gap-8">
      <div>
        <h1 class="text-2xl font-bold text-foreground">设置</h1>
      </div>

      <div class="space-y-6">
        <Tabs :default-value="tabs[1].value" class="w-full">
          <TabsList>
            <TabsTrigger
              v-for="tab in tabs"
              :key="tab.value"
              :value="tab.value"
            >
              <NuxtLink :to="tab.to" class="text-foreground">{{ tab.title }}</NuxtLink>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <UserBillingSetting />
      </div>
    </div>
  </div>
</template>
