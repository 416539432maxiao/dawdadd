<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "隐私政策",
});
</script>

<template>
  <div class="container py-32">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-3xl font-bold">隐私政策</h1>
      <p class="text-base text-muted-foreground">
        了解我们如何保护您的隐私和个人数据。
      </p>
    </div>

    <article
      class="mt-16 prose prose-lg max-w-3xl mx-auto text-sm dark:prose-invert"
    >
      <!-- 使用 ContentDoc 组件渲染 markdown 内容 -->
      <ContentDoc path="/legal/privacy" />
    </article>
  </div>
</template>
