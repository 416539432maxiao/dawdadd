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
    <!-- 如果是“全部”分类，分区显示 -->
    <template v-if="isAllCategory">
      <div v-for="(apps, category) in categorizedApps" :key="category">
        <h2 class="text-m font-bold text-gray-700 mb-2 pl-3 border-l-4 border-primary/60 py-1 rounded">
          {{ category }}
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6  justify-center">
          <Card v-for="app in apps" :key="app.path"
      
           class="  relative flex h-full rounded-2xl border hover:border-primary      bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5          shadow-sm  hover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg transition-all duration-300 cursor-pointer group"
            @click="handleClick(app)">

            <div class="absolute -top-1 right-0">
              <span
                class=" shadow-md ring-1 ring-inset ring-black/5 dark:ring-white/10 px-1.5 py-0.5 text-xs font-semibold rounded-2xl border border-opacity-40 transition-all duration-300 opacity-80 hover:opacity-100"
                :class="{
                  'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300': app.accessType === 'free',
                  'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300': app.accessType === 'points',
                  'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300': app.accessType === 'vip'
                }">
                {{
                  app.accessType === 'free' ? '免费' :
                    app.accessType === 'points' ? '积分' : 'VIP'
                }}
              </span>
            </div>

            <div class="flex gap-4 sm:gap-4 p-4 sm:p-5">
              <div
              
                class="h-16 w-16 shadow-inner    border border-white/50 rounded-xl flex items-center justify-center text-3xl icon-container transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                :style="{ backgroundColor: app.iconBgColor, boxShadow: 'inset 0 0 4px rgba(0,0,0,0.1)' }">
            
                <img :src="app.icon" class="w-10 h-10 object-contain" alt="app icon" />
              </div>
              <div class="flex flex-col flex-1">
                <h3 class="font-medium  text-base sm:text-lg truncate">{{ app.name }}</h3>
                <p class="  hidden sm:block text-xs sm:text-sm  text-muted-foreground  mt-1  ">{{ app.description }}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </template>

    <!-- 否则只展示选中分类 -->
    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <Card v-for="app in filteredApps" :key="app.path"
          class="relative flex h-full rounded-2xl  border-gray-100  hover:border-primary transition-all duration-300 cursor-pointer group hhover:-translate-y-1 hover:scale-[1.01] hover:shadow-lg"
          @click="handleClick(app)">
          <div class="absolute -top-1 right-0">
              <span
                class=" shadow-md ring-1 ring-inset ring-black/5 dark:ring-white/10 px-1.5 py-0.5  text-xs font-semibold rounded-2xl border border-opacity-40 transition-all duration-300 opacity-80 hover:opacity-100"
                :class="{
                  'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300': app.accessType === 'free',
                  'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300': app.accessType === 'points',
                  'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300': app.accessType === 'vip'
                }">
                {{
                  app.accessType === 'free' ? '免费' :
                    app.accessType === 'points' ? '积分' : 'VIP'
                }}
              </span>
            </div>
          <div class="flex gap-2 sm:gap-4 p-4 sm:p-5">
            <div
              class="h-16 w-16 shadow-inner border  border-gray-100  rounded-xl flex items-center justify-center text-3xl icon-container transition-transform duration-300 group-hover:rotate-12"
              :style="{ backgroundColor: app.iconBgColor }">
              <img :src="app.icon" class="w-10 h-10 object-contain" alt="app icon" />
            </div>
            <div class="flex flex-col flex-1">
              <h3 class="font-medium text-lg">{{ app.name }}</h3>
              <p class="text-sm text-muted-foreground mt-2">{{ app.description }}</p>
            </div>
          </div>
        </Card>
      </div>
    </template>
  </div>
</template>   