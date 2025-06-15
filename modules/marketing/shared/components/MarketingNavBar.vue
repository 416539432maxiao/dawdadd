<template>
  <nav id="marketing-header" class="fixed left-0 top-0 z-50 w-full rounded-b-xl border-b backdrop-blur-xl
         transition-all duration-300 ease-in-out shadow-lg" :class="[
          isTop ? 'shadow-none bg-transparent' :
            'bg-white/60 dark:bg-white/5 dark:border-white/10'
        ]" style="box-shadow:
    0 2px 4px rgba(168, 85, 247, 0.1),
    0 6px 12px rgba(168, 85, 247, 0.08);">
    <div :class="[isDoc ? 'w-full px-4 border-b border-white/10' : 'w-full']" class="relative z-50">
      <div class="flex items-center justify-between w-full transition-all duration-200"
        :class="[isTop ? 'py-2' : 'py-4']">
        <div class="flex-1"></div>

        <div class="flex items-center justify-end gap-2 mr-20">


          <ClientOnly>

            <div class=" text-black dark:text-gray-300">
              <ColorModeToggle />
            </div>

          </ClientOnly>

          <ClientOnly>
            <!-- 登录状态判断：显示控制台按钮或用户信息组件 -->
            <template v-if="hasUser">
              <UserInfo />
            </template>
            <template v-else>
              <NuxtLink to="/auth/signin" prefetch class="text-primary-foreground">
                <Button class="px-6">登录</Button>
              </NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </div>
    </div>
  </nav>




</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useWindowScroll } from '@vueuse/core';
import { useUser } from '@/modules/saas/auth/composables/useUser';


const route = useRoute();
const { y: verticalScrollPosition } = useWindowScroll();
const { user } = useUser();
const initialScrollChecked = ref(false);

const isDoc = computed(() => {
  return route.fullPath.startsWith("/docs");
});

const isTop = computed(() => {
  if (!initialScrollChecked.value) return true;
  return verticalScrollPosition.value < 10;
});

const hasUser = computed(() => {
  return user.value;
});



onMounted(() => {
  initialScrollChecked.value = true;
});
</script>



<style scoped>
nav {
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background-color: rgba(255, 255, 255, 0.6);
}

.dark nav {
  background-color: rgba(17, 24, 39, 0.5);
  border-color: rgba(255, 255, 255, 0.1);
}
</style>
