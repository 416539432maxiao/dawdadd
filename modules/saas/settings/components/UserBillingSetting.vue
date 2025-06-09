<script setup lang="ts"></script>

<template>
  <div class="rounded-lg border bg-background">
    <div class="border-b p-6">
      <h3 class="text-lg font-medium text-foreground">账单信息</h3>
      <p class="text-sm text-muted-foreground">管理你的订阅和付款方式</p>
    </div>

    <div class="space-y-6 p-6">
      <UserPlanInfo />
      <UserBillingHistoryList />
    </div>
  </div>
</template>
