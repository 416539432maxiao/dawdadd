<template>
  <GradientBackgroundWrapper>
    <NuxtLayout>
      <NuxtPage class="text-foreground" />
    </NuxtLayout>
    <Toaster />
  </GradientBackgroundWrapper>
</template>

<style>
.toast-success {
  background-color: hsl(var(--success));
  color: white;
}

.toast-error {
  background-color: hsl(var(--destructive));
  color: white;
}

html.dark {
  background-color: var(--colors-background);
}
</style>

<script setup lang="ts">
useHead({
  titleTemplate: "%s - NuxtBase",
  meta: [
    { charset: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    {
      name: "description",
      content: "NuxtBase - 帮助开发者快速构建和上线AI应用的开发模板",
    },
    // Open Graph / Facebook
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "NuxtBase" },
    { property: "og:title", content: "NuxtBase - 快速上线AI应用" },
    {
      property: "og:description",
      content: "帮助开发者快速构建和上线AI应用的开发模板",
    },
    {
      property: "og:image",
      content:
        "https://static-main.aiyeshi.cn/nuxtbase/images/newdoc/og-image.png",
    },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: "NuxtBase - 快速上线AI应用" },
    {
      name: "twitter:description",
      content: "帮助开发者快速构建和上线AI应用的开发框架",
    },
    {
      name: "twitter:image",
      content:
        "https://static-main.aiyeshi.cn/nuxtbase/images/newdoc/og-image.png",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "https://demo.nuxtbase.site/favicons/favicon.ico",
    },
    { rel: "canonical", href: "https://demo.nuxtbase.site" },
  ],
});

const { loadUser, setupAuthListener } = useUser();
const unsubscribe = ref<() => void | null>(null);

onMounted(async () => {
  // 先设置监听器
  unsubscribe.value = await setupAuthListener();
  // 再加载用户信息
  await loadUser();
});

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value();
  }
});
</script>
