<script setup lang="ts">
import { MoonIcon, SunIcon } from "lucide-vue-next";
import { useColorMode } from "@vueuse/core";

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button data-test="color-mode-toggle" variant="ghost">
        <component :is="isDark ? SunIcon : MoonIcon" class="w-24 h-24" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <ColorModeToggleRadioGroup />
    </DropdownMenuContent>
  </DropdownMenu>
</template>
