<template>

    <div class="container max-w-screen-2xl  mx-auto px-4 sm:px-6 py-1 pt-14
       transition-all duration-300 dark:bg-gray-900 h-full flex flex-col">
    <div class="bg-white rounded-2xl shadow-sm  overflow-hidden bg-gradient-to-br from-gray-50 to-white hover:shadow-m transition-shadow duration-300 dark:border dark:border-white/10 dark:bg-[rgba(255,255,255,0.08)] dark:backdrop-blur-md h-full flex flex-col">
      <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-md dark:bg-[rgba(255,255,255,0.08)] dark:backdrop-blur-md">
        <!-- 头部区域 -->
        <div class="px-6 py-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-transparent backdrop-blur-sm animate-gradient-x dark:bg-[rgba(255,255,255,0.08)] dark:backdrop-blur-md">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 hover:text-primary transition-colors duration-300 dark:text-white dark:hover:text-primary-300">
            教师<span class="text-primary hover:text-primary/80 transition-colors duration-300 dark:text-primary-300 dark:hover:text-primary-200">AI</span>百宝箱
          </h2>

          <!-- 搜索框 -->
          <div class="w-full sm:w-auto">
            <div class="relative">
              <input
                type="text"
                aria-label="搜索应用"
                placeholder="搜索应用..."
                class="pl-10 pr-4 py-2 w-full sm:w-64 rounded-full border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/50 bg-white shadow-sm hover:shadow-md transition-all duration-300 focus:w-72 focus:scale-105 dark:bg-[rgba(255,255,255,0.08)] dark:border-white/10 dark:text-white dark:placeholder-gray-400 dark:focus:border-primary-300"
              />
              <SearchIcon class="absolute left-3 top-2.5 h-5 w-5 text-gray-400 hover:text-primary transition-colors duration-300 dark:text-gray-400 dark:hover:text-primary-300" />
            </div>
          </div>
        </div>
      </div>

      <!-- 导航菜单 -->
      <div class="px-6 py-4 sm:px-8 sm:py-5 bg-white/70 backdrop-blur-sm dark:bg-[rgba(255,255,255,0.08)] dark:backdrop-blur-md">
        <div class="flex space-x-3 overflow-x-auto scrollbar-thin py-1">
          <button
            v-for="(item, index) in menuItems"
            :key="index"
            class="px-4 py-2 text-base sm:text-lg font-medium whitespace-nowrap rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 dark:text-gray-200 border border-transparent"
            :class="{
              'bg-primary/20 text-primary font-semibold shadow-md': activeMenu === index,
              'text-gray-600 hover:bg-primary/10 hover:text-primary': activeMenu !== index,
              'dark:bg-primary-300/20 dark:text-primary-300': activeMenu === index,
              'dark:hover:bg-primary-300/10 dark:hover:text-primary-300': activeMenu !== index
            }"
            @click="activeMenu = index"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 sm:p-8 bg-gradient-to-b from-white to-gray-50/50 animate-fade-in dark:bg-[rgba(255,255,255,0.08)] dark:backdrop-blur-md">
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
