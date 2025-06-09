<script setup lang="ts">
definePageMeta({
  layout: "saas-dashboard",
});

useHead({
  title: "Token",
});
</script>

<template>
  <div class="container py-8">
    <div class="flex flex-col space-y-4">
      <h2 class="text-2xl font-bold tracking-tight text-foreground">
        Token使用情况
      </h2>
      <p class="text-sm text-muted-foreground">
        展示用户的Token使用数据，每位注册用户有1000个免费Token
      </p>
      <div class="mt-8">
        <DashboardTokenStatus class="mb-8" />
        <DashboardTokenHistory />
      </div>
    </div>
  </div>
</template>
