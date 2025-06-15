<template>
  <!-- 外层容器：加 padding-left 避开 fixed 侧边栏 -->
  <div
    class="flex flex-col lg:flex-row h-screen overflow-hidden 
           bg-gradient-to-br from-white via-indigo-100 to-indigo-200 
           dark:bg-gradient-to-br dark:from-black dark:via-indigo-950 dark:to-black
           lg:pl-[40px]"
  >
    <!-- 左侧侧边栏（调整 z-index，顶部预留空间） -->
    <div
      class="hidden lg:flex w-[40px] fixed top-0 left-0 bottom-0 z-[60] pt-[164px]
             flex-col items-center"
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
             bg-white/70backdrop-blur-md rounded-2xl shadow-xl transition-all duration-300"
    >
      <div class="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-400 scrollbar-track-white/30">
        <slot />
      </div>
    </main>
    <img
  src="/images/bg-character.png"
  alt="角落插图"
  class="absolute bottom-4 right-4 w-40 sm:w-52 lg:w-64 opacity-90 pointer-events-none select-none float-animation"
/>
  </div>
</template>







<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}
</style>





