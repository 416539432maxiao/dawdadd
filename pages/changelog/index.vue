<script setup>
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "版本说明",
});

const versionList = [
  {
    version: "beta-0.1.0",
    comment:
      "👏大版本升级，完成sass后台功能、Demo整体优化、增加付费用户AI的tokens逻辑功能",
    date: "2024-10-20",
    bg: "bg-violet-500",
  },
  {
    version: "beta-0.0.2",
    comment: "完成订阅制版本，增加按月、按季度、按年订阅功能，上线发布！",
    date: "2024-07-10",
    bg: "bg-violet-500",
  },
  {
    version: "beta-0.0.1",
    comment: "完成购买商品类模板版本",
    date: "2024-07-08",
    bg: "bg-violet-500",
  },
];
</script>
<template>
  <div class="container py-32 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1
      class="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white"
    >
      版本说明
    </h1>
    <ul
      class="relative border-l-2 border-gray-200 dark:border-gray-700 space-y-12"
    >
      <li
        v-for="(version, index) in versionList"
        :key="version.version"
        class="ml-8 relative"
      >
        <span
          class="absolute flex items-center justify-center w-2 h-2 rounded-full -left-9 ring-4 ring-white dark:ring-gray-900"
          :class="[version.bg]"
        >
        </span>
        <div
          class="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <h3
            class="flex items-center text-xl font-semibold text-gray-900 dark:text-white mb-2"
          >
            {{ version.version }}
            <span
              class="ml-2 text-xs font-medium px-2.5 py-0.5 rounded-full text-primary-foreground bg-primary"
              v-if="index === 0"
            >
              最新
            </span>
          </h3>
          <time
            class="block mb-3 text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            发布时间：{{ version.date }}
          </time>
          <p class="text-base text-gray-700 dark:text-gray-300 leading-relaxed">
            版本说明：{{ version.comment }}
          </p>
        </div>
      </li>
    </ul>
  </div>
</template>
