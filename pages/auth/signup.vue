<script setup lang="ts">
definePageMeta({
  layout: "saas-auth",
  static: true,
});

useHead({
  title: "注册",
});
</script>

<template>
  <SaasSignForm mode="signup" />
</template>
