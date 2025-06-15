<template>
  <div
    class="relative"
    @mouseenter="openMenu"
    @mouseleave="closeMenu"
  >
    <!-- 用户头像 -->
    <UserAvatar
      size="lg"
      class="cursor-pointer transition-transform duration-200 hover:scale-105"
    />

    <!-- 自定义菜单 -->
    <div
  v-if="isOpen"
  class="absolute right-0 mt-2 w-64 rounded-xl shadow-xl border z-50
         transition-all duration-200 ease-in-out opacity-100 translate-y-0 animate-fade-slide
         bg-white/80 dark:bg-white/10 dark:backdrop-blur-lg dark:border-white/10"
>
  <div class="px-4 py-3 font-semibold text-base text-gray-700 dark:text-gray-200">
    {{ name || "已登录用户" }}
  </div>

  <div class="border-t border-gray-200 dark:border-white/10 my-1" />

  <NuxtLink
    to="/dashboard/settings"
    class="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary rounded-md transition"
  >
    <Settings2Icon class="w-5 h-5 mr-3" />
    设置
  </NuxtLink>

  <NuxtLink
    to="/dashboard/settings/billing"
    class="flex items-center px-4 py-3 text-lg text-gray-700 dark:text-gray-200 hover:bg-primary/5 hover:text-primary rounded-md transition"
  >
    <CreditCardIcon class="w-5 h-5 mr-3" />
    账单
  </NuxtLink>

  <div class="border-t border-gray-200 dark:border-white/10 my-1" />

  <div
    @click="signOut"
    class="flex items-center px-4 py-3 text-lg text-muted-foreground dark:text-gray-300 hover:bg-primary/5 hover:text-primary rounded-md transition cursor-pointer"
  >
    <LogOutIcon class="w-5 h-5 mr-3" />
    退出登录
  </div>
</div>

  </div>
</template>



<script setup lang="ts">
import { useUser } from "@/modules/saas/auth/composables/useUser";
import {
  Settings2Icon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-vue-next";

const { user, signOut } = useUser();
const name = computed(() => user.value?.user_metadata?.full_name || "用户");

const isOpen = ref(false);
let closeTimer: ReturnType<typeof setTimeout> | null = null;

const openMenu = () => {
  if (closeTimer) clearTimeout(closeTimer);
  isOpen.value = true;
};

const closeMenu = () => {
  closeTimer = setTimeout(() => {
    isOpen.value = false;
  }, 200);
};
</script>



<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

