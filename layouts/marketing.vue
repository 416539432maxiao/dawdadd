<template>
  <div>
    <MarketingNavBar />
    <main class="min-h-screen">
      <slot />
    </main>
   
  </div>
</template>

<script setup>
const route = useRoute();
</script>
