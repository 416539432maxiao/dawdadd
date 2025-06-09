<script setup lang="ts">
const isOpen = ref(false);
</script>

<template>
  <header class="flex h-14 items-center gap-4 border-b px-4 lg:hidden">
    <NuxtLink to="/">
      <Logo class="h-4" />
    </NuxtLink>

    <Sheet v-model:open="isOpen">
      <button
        class="ml-auto rounded-lg p-2 hover:bg-muted"
        @click="isOpen = true"
      >
        <LucideMenu class="size-5 text-foreground" />
      </button>

      <SheetContent side="left" class="w-full max-w-md p-0">
        <SaasSideBar class="w-full" :onNavigate="() => (isOpen = false)" />
      </SheetContent>
    </Sheet>
  </header>
</template>
