<script setup lang="ts">
definePageMeta({
  layout: "saas-auth",
  static: true,
});

useHead({
  title: "登录",
});
</script>

<template>
  <SaasSignForm mode="signin" />
</template>
