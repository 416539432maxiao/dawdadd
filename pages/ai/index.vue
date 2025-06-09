<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "AI示例",
});
</script>

<template>
  <div class="container py-32 max-w-5xl">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-4xl font-bold">Dify AI示例</h1>
      <p class="text-lg text-muted-foreground">
        一些简单的接入Dify AI接口的示例（Dify网络请求可能会不稳定，见谅）
      </p>
    </div>
    <DifyCards />
  </div>
</template>
