<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "服务条款",
});
</script>

<template>
  <div class="container py-32">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-3xl font-bold">服务条款</h1>
      <p class="text-base text-muted-foreground">
        了解使用我们服务时需要遵守的条款和规则。
      </p>
    </div>

    <div
      class="mt-16 prose prose-lg max-w-3xl mx-auto text-sm dark:prose-invert"
    >
      <!-- 使用 ContentDoc 组件渲染 markdown 内容 -->
      <ContentDoc path="/legal/terms" />
    </div>
  </div>
</template>
