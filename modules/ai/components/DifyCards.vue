<script setup lang="ts">
import { useUser } from "@/modules/saas/auth/composables/useUser";
import { useToast } from "@/modules/ui/components/toast/use-toast";
import aiConfig, { type DifyAppConfig } from "@/config/ai/index";
import { computed } from "vue";

const { user } = useUser();
const { toast } = useToast();

const difyApps = Object.values(aiConfig.apps);

const handleClick = (difyApp: DifyAppConfig) => {
  if (!user.value) {
    toast({
      title: "请先登录",
      description: "登录后才能使用AI助手哦~",
      duration: 2000,
    });
    navigateTo("/auth/signin");
  } else {
    window.open(difyApp.path, "_blank");
  }
};

const props = defineProps({
  activeMenu: {
    type: Number,
    required: true
  }
});

const categories = ['全部', '教案区', '幼儿专区', 'AI'];

const selectedCategory = computed(() => categories[props.activeMenu]);
const isAllCategory = computed(() => selectedCategory.value === '全部');

// 按分类分组
const categorizedApps = computed(() => {
  return {
    教案区: difyApps.filter(app => app.appCategory === '教案区'),
    幼儿专区: difyApps.filter(app => app.appCategory === '幼儿专区'),
    AI: difyApps.filter(app => app.appCategory === 'AI'),
  };
});

// 当前分类的 app（非“全部”时使用）
const filteredApps = computed(() => {
  return difyApps.filter(app => app.appCategory === selectedCategory.value);
});
</script>



<template>
  <div class="space-y-12">
    <!-- 分类显示：全部分类 -->
    <template v-if="isAllCategory">
      <div
        v-for="(apps, category) in categorizedApps"
        :key="category"
        class="space-y-4"
      >
        <h2 class="text-xl font-semibold text-gray-800 dark:text-white pl-4 border-l-4 border-primary/60 py-1">
          {{ category }}
        </h2>
        <div
          class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6"
        >
          <Card
            v-for="app in apps"
            :key="app.path"
            class="relative group flex flex-col h-full p-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md hover:-translate-y-1 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-primary cursor-pointer"
            @click="handleClick(app)"
          >
            <!-- 类型标签 -->
            <div class="absolute -top-2 right-2">
              <span
                class="px-2 py-0.5 text-xs font-semibold rounded-full border shadow-md ring-1 ring-black/5 dark:ring-white/10 transition-all"
                :class="{
                  'bg-green-100 text-green-800 border-green-300': app.accessType === 'free',
                  'bg-blue-100 text-blue-800 border-blue-300': app.accessType === 'points',
                  'bg-purple-100 text-purple-800 border-purple-300': app.accessType === 'vip'
                }"
              >
                {{ app.accessType === 'free' ? '免费' : app.accessType === 'points' ? '积分' : 'VIP' }}
              </span>
            </div>

           <!-- 卡片中的主体内容 -->
<div class="flex items-center sm:items-start gap-4 sm:gap-4 flex-col sm:flex-row text-center sm:text-left">
  <!-- 图标部分 -->
  <div
    class="h-12 w-12 sm:h-16 sm:w-16 rounded-xl border border-white/30 dark:border-white/10 shadow-inner flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform"
    :style="{ backgroundColor: app.iconBgColor }"
  >
    <img :src="app.icon" class="w-6 h-6 sm:w-10 sm:h-10 object-contain" alt="icon" />
  </div>

  <!-- 文字部分 -->
  <div class="flex flex-col flex-1">
    <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
      {{ app.name }}
    </h3>
    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
      {{ app.description }}
    </p>
  </div>
</div>
          </Card>
        </div>
      </div>
    </template>

    <!-- 分类显示：非全部分类 -->
    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card
          v-for="app in filteredApps"
          :key="app.path"
          class="relative group flex flex-col h-full p-5 rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-md hover:-translate-y-1 hover:scale-105 transition-all duration-300 hover:shadow-xl hover:border-primary cursor-pointer"
          @click="handleClick(app)"
        >
          <!-- 类型标签 -->
          <div class="absolute -top-2 right-2">
            <span
              class="px-2 py-0.5 text-xs font-semibold rounded-full border shadow-md ring-1 ring-black/5 dark:ring-white/10 transition-all"
              :class="{
                'bg-green-100 text-green-800 border-green-300': app.accessType === 'free',
                'bg-blue-100 text-blue-800 border-blue-300': app.accessType === 'points',
                'bg-purple-100 text-purple-800 border-purple-300': app.accessType === 'vip'
              }"
            >
              {{ app.accessType === 'free' ? '免费' : app.accessType === 'points' ? '积分' : 'VIP' }}
            </span>
          </div>

          <!-- 卡片中的主体内容 -->
<div class="flex items-center sm:items-start gap-4 sm:gap-4 flex-col sm:flex-row text-center sm:text-left">
  <!-- 图标部分 -->
  <div
    class="h-12 w-12 sm:h-16 sm:w-16 rounded-xl border border-white/30 dark:border-white/10 shadow-inner flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-transform"
    :style="{ backgroundColor: app.iconBgColor }"
  >
    <img :src="app.icon" class="w-6 h-6 sm:w-10 sm:h-10 object-contain" alt="icon" />
  </div>

  <!-- 文字部分 -->
  <div class="flex flex-col flex-1">
    <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
      {{ app.name }}
    </h3>
    <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
      {{ app.description }}
    </p>
  </div>
</div>
        </Card>
      </div>
    </template>
  </div>
</template>

