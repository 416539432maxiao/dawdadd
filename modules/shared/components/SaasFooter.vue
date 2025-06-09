<template>
  <footer class="container py-4 text-center text-sm text-muted-foreground">
    <span>
      © {{ new Date().getFullYear() }} NuxtBase. All rights reserved.
    </span>
    <span class="opacity-50"> | </span>
    <NuxtLink to="/legal/privacy">隐私政策</NuxtLink>
    <span class="opacity-50"> | </span>
    <NuxtLink to="/legal/terms">服务条款</NuxtLink>
  </footer>
</template>
