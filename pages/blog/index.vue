<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "博客",
});

const posts = [
  {
    title: "产品更新：新功能发布",
    description:
      "我们很高兴地宣布一系列新功能的发布，这些功能将帮助您更好地使用我们的产品。",
    date: "2024-01-15",
    author: "产品团队",
    href: "/blog/test",
    image:
      "https://static-main.aiyeshi.cn/nuxtbase/images/newdoc/blog-preivew-01.png",
  },
  {
    title: "技术深度：架构设计解析",
    description:
      "本文将深入探讨我们的系统架构设计，以及如何确保高可用性和可扩展性。",
    date: "2024-01-10",
    author: "技术团队",
    href: "/blog/test",
    image:
      "https://static-main.aiyeshi.cn/nuxtbase/images/newdoc/blog-preivew-02.png",
  },
];
</script>

<template>
  <div class="container py-32">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-4xl font-bold">博客</h1>
      <p class="text-lg text-muted-foreground">
        了解我们的最新动态、技术文章和产品更新。
      </p>
    </div>
    <div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      <BlogCard v-for="post in posts" :key="post.title" v-bind="post" />
    </div>
  </div>
</template>
