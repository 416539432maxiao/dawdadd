<template>
  <div class="container max-w-screen-2xl mx-auto px-4 sm:px-6 py-1 pt-14 transition-all duration-500 ease-in-out h-full flex flex-col">
    <div class="border border-white/10 bg-white/70 backdrop-blur-md dark:bg-black/30 dark:backdrop-blur-2xl dark:border-white/10 shadow-2xl dark:shadow-[0_15px_60px_rgba(168,85,247,0.25)] hover:shadow-purple-500/20 hover:border-white/20 dark:hover:border-purple-500/50 transition-all duration-500 rounded-3xl overflow-hidden h-full flex flex-col">

      <!-- 顶部区域 -->
      <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md dark:bg-black/20 dark:backdrop-blur-2xl border-b border-gray-200 dark:border-white/10">
        <div class="px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/10 to-transparent backdrop-blur-sm animate-gradient-x dark:bg-gradient-to-r dark:from-purple-900/10 dark:to-transparent">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 hover:text-primary transition-colors duration-300 dark:text-white dark:hover:text-primary-300">
            教师的<span class="text-primary hover:text-primary/80 transition-colors duration-300 dark:text-primary-300 dark:hover:text-primary-200">AI</span>百宝箱
          </h2>
          <div class="w-full sm:w-auto">
            <div class="relative">
              <input
                type="text"
                aria-label="搜索应用"
                placeholder="搜索应用..."
                class="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 focus:w-72 focus:scale-105 dark:bg-black/30 dark:border-white/20 dark:text-white dark:placeholder-white/30 dark:focus:border-primary-300 dark:focus:bg-white/10 backdrop-blur"
              />
              <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 hover:text-primary transition-colors duration-300 dark:text-white/40 dark:hover:text-primary-300" />
            </div>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="px-6 py-4 sm:px-8 sm:py-5 border-b border-white/10 bg-white/70 backdrop-blur-md dark:bg-transparent dark:backdrop-blur-md">
        <div class="flex space-x-3 overflow-x-auto scrollbar-thin py-1">
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="px-4 py-2 text-base sm:text-lg font-medium whitespace-nowrap rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 border dark:border-white/10 border-transparent shadow-sm dark:shadow-[inset_0_0_6px_rgba(255,255,255,0.05)]"
            :class="{
              'bg-primary/20 text-primary font-semibold shadow-md dark:bg-primary-300/20 dark:text-primary-300': activeMenu === index,
              'text-gray-600 hover:bg-primary/10 hover:text-primary dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white': activeMenu !== index
            }"
            @click="activeMenu = index"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 sm:p-10 bg-white/70 dark:bg-transparent dark:backdrop-blur-md transition-all duration-300">
          <DifyCards :active-menu="activeMenu" />
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DifyCards from "@/modules/ai/components/DifyCards.vue";
import { SearchIcon } from 'lucide-vue-next';

definePageMeta({ layout: "saas-dashboard" });

useHead({ title: "AI应用" });

const menuItems = ['全部', '教案区', '幼儿专区', 'AI'];
const activeMenu = ref(0);
</script>
