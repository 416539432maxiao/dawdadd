<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

const route = useRoute();
const { path } = route.params;

// 使用nuxt-content的queryContent API来获取博客内容
const { data: post } = await useAsyncData(`blog-${path}`, () =>
  queryContent("blog")
    .where({ _path: `/blog/${path}` })
    .findOne()
);

// 如果没有找到文章,重定向到404页面
if (!post.value) {
  throw createError({
    statusCode: 404,
    message: "网页不存在",
  });
}
</script>

<template>
  <div class="container py-32">
    <div class="mx-auto max-w-3xl">
      <NuxtLink
        to="/blog"
        class="mb-8 inline-block text-primary hover:underline"
      >
        ← 返回博客列表
      </NuxtLink>

      <article class="prose prose-lg dark:prose-invert">
        <h1 class="mb-4">{{ post.title }}</h1>

        <div
          class="mb-8 flex justify-between items-center gap-4 text-sm text-muted-foreground"
        >
          <div class="flex items-center gap-2">
            <img
              :src="post.avatar"
              :alt="post.author"
              class="h-8 w-8 rounded-full"
            />
            <span>{{ post.author }}</span>
          </div>
          <time>{{ post.date }}</time>
        </div>

        <div class="mb-8">
          {{ post.description }}
        </div>

        <!-- 使用ContentRenderer组件渲染Markdown内容 -->
        <ContentRenderer :value="post" />
      </article>
    </div>
  </div>
</template>
