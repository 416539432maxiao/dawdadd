<template>
    <div class="absolute inset-0 bg-[radial-gradient(#ffffff0d,#00000000)] z-0">
      <!-- 固定像素网格背景 -->
      <div
        class="relative flex min-h-screen w-full p-4 sm:p-6 md:p-8 overflow-hidden bg-gradient-to-br from-black via-indigo-950 to-black">
        <div id="fixed-grid-bg" class="pointer-events-none z-0" style="
          position: fixed;
          top: 0px;
          left: 758px;
          width: 100vw;
          height: 500px;
          background-image:
            linear-gradient(to right, rgba(255, 255, 255, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
          background-size: 50px 50px;
          background-repeat: repeat;
          mix-blend-mode: overlay;
          transform-origin: top left;
          z-index: 0;
          mask-image: radial-gradient(ellipse at top right, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 100%);
          -webkit-mask-image: radial-gradient(ellipse at center, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%);
        "></div>
  
        <!-- 内容区域 -->
        <div class="relative z-10 flex flex-col w-full items-center gap-2">
          <!-- 顶部导航 -->
          <div class="container px-2 sm:px-4">
            <div class="flex items-center justify-between">
              <NuxtLink to="/" class="block hover:scale-105 transition-transform">
                <span class="cursor-pointer flex items-center">
                  <img src="/images/logo.png" alt="酷师 Logo"
                    class="w-12 h-12 md:w-16 md:h-16 rounded-md transition-all hover:rotate-6" loading="eager" />
                  <span class="text-3xl ml-2 font-bold text-primary">CoolTeacher</span>
                </span>
              </NuxtLink>
              <ClientOnly>
                <ColorModeToggle />
              </ClientOnly>
            </div>
          </div>
  
          <!-- 标语 -->
          <div class="text-center text-white space-y-2 mt-20 md:mt-32">
            <h1 class="text-4xl md:text-6xl font-extrabold">
              <span class="text-primary">酷师</span>，教师的 AI 百宝箱
            </h1>
            <p
              class="text-lg relative top-10 md:text-2xl mt-4 tracking-wider font-semibold text-white/70 flex items-center justify-center gap-4">
              <span>高效</span>
              <span class="text-primary">·</span>
              <span>易用</span>
              <span class="text-primary">·</span>
              <span>便宜</span>
            </p>
          </div>
  
          <!-- 主体区域 -->
          <main class="w-full px-2 sm:px-4 max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 mt-12 md:mt-20 overflow-hidden">
            <!-- 插图 -->
            <div class="relative hidden md:flex items-center justify-center w-[415px]">
              <img src="/images/bg-character.png" loading="lazy" fetchpriority="high" class="w-full drop-shadow-xl animate-floating"
                alt="AI 角色图" />
              <img src="/images/1.png" class="absolute top-0 left-0 w-24 h-24 animate-floating-small glow-effect" alt="图标 1" role="img" aria-label="AI 辅助图标 1" />
              <img src="/images/2.png" class="absolute top-0 right-0 w-24 h-24 animate-floating-small delay-100 glow-effect" alt="图标 2" role="img" aria-label="AI 辅助图标 2" />
              <img src="/images/3.png" class="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24 animate-floating-small delay-200 glow-effect" alt="图标 3" role="img" aria-label="AI 辅助图标 3" />
            </div>
            <!-- 插槽表单 -->
            <div class="w-full max-w-md">
              <slot />
            </div>
          </main>
  
          <!-- 页脚 -->
          <SaasFooter class="mt-48" />
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  onMounted(() => {
    const updateGridScale = () => {
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const grid = document.getElementById('fixed-grid-bg')
      if (grid) {
        grid.style.transform = `scale(${1 / scale})`
      }
    }
  
    updateGridScale()
    window.addEventListener('resize', updateGridScale)
  })
  </script>
  
  <style scoped>
  @keyframes floating {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  .animate-floating {
    animation: floating 4s ease-in-out infinite;
    will-change: transform;
  }
  
  @keyframes floating-small {
    0% { transform: translateY(0px) translateX(0px) rotate(0deg); }
    33% { transform: translateY(-6px) translateX(3px) rotate(1deg); }
    66% { transform: translateY(-4px) translateX(-3px) rotate(-1deg); }
    100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
  }
  .animate-floating-small {
    animation: floating-small 3s cubic-bezier(0.42, 0, 0.58, 1) infinite;
    will-change: transform;
  }
  
  .delay-100 { animation-delay: 0.3s; }
  .delay-200 { animation-delay: 0.6s; }
  
  .glow-effect:hover {
    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.9))
            drop-shadow(0 0 20px rgba(0, 153, 255, 0.8));
    transition: filter 0.3s ease-in-out;
  }
  </style>
  









