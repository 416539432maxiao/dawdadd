<template>
  <!-- 外层容器：加 padding-left 避开 fixed 侧边栏 -->
  <div
    class="flex flex-col lg:flex-row h-screen overflow-hidden 
           bg-gradient-to-br from-white via-indigo-100 to-indigo-200 
           dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900
           lg:pl-[40px]"
  >
    <!-- 左侧侧边栏（调整 z-index，顶部预留空间） -->
    <div
      class="hidden lg:flex w-[40px] fixed top-0 left-0 bottom-0  z-[60]  pt-[164px]
             flex-col items-center bg-black"
    >
      <SaasSideBar class="flex-1 z-90" />
    </div>

    <!-- 顶部导航栏（更高 z-index，固定位置） -->
    <MarketingNavBar class="hidden lg:flex fixed top-0 left-0 w-full z-50" />

    <!-- 小屏顶部导航 -->
    <div class="lg:hidden">
      <SaasHeader />
    </div>

    <!-- 主内容区域（顶部加 padding 避免被顶栏遮盖） -->
    <main
      class="flex-1 px-4 sm:px-6 lg:px-8 pt-[96px] pb-4 overflow-hidden 
             bg-white/70 dark:bg-gray-900/50 backdrop-blur-md rounded-2xl shadow-xl transition-all duration-300"
    >
      <div class="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-white/30">
        <slot />
      </div>
    </main>
  </div>
</template>
