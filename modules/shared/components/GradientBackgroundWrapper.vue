<template>
  <div class="relative min-h-screen max-w-full overflow-x-hidden gradient-background-wrapper">
    <!-- Background Layer -->
    <div class="fixed top-0 left-0 w-full h-screen bg-gradient-to-b from-card via-background to-background to-[50vh]"></div>

    <!-- Glow Layer -->
    <div
      class="fixed top-0 left-1/2 z-10 -translate-x-1/2 h-[500px] w-[1000px] rounded-full bg-gradient-to-r from-primary via-background to-highlight opacity-15 blur-[120px]"
    ></div>

    <!-- Foreground Content -->
    <div class="relative z-20">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.gradient-background-wrapper {
  scrollbar-width: none;
}
.gradient-background-wrapper::-webkit-scrollbar {
  display: none;
}
</style>
