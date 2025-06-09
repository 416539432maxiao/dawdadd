<template>
  <footer class="border-t border-border py-12 px-8">
    <div class="container grid grid-cols-1 gap-12 lg:grid-cols-3">
      <div>
        <Logo
          class="opacity-70 grayscale hover:opacity-100 transition-opacity"
        />
        <p class="mt-4 text-sm text-muted-foreground">
          © {{ new Date().getFullYear() }} NuxtBase. 保留所有权利。
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/pricing"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >价格</NuxtLink
        >
        <NuxtLink
          to="/changelog"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >版本</NuxtLink
        >
        <NuxtLink
          to="/docs/guide/intro"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >文档</NuxtLink
        >
      </div>

      <div class="flex flex-col gap-3">
        <NuxtLink
          to="/legal/privacy"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >隐私政策</NuxtLink
        >
        <NuxtLink
          to="/legal/terms"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >服务条款</NuxtLink
        >
      </div>
    </div>
  </footer>
</template>
