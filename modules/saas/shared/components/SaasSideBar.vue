<script setup lang="ts">

// 回滚版本
import {
  Settings2Icon,
  LogOutIcon,
  CreditCardIcon,
  MoonIcon,
  SunIcon,
  StarIcon,
  MessageSquareMore,
  UserIcon,
  LayoutDashboardIcon,
  AlertCircle,
  FileText,
  MessageCircle,

} from "lucide-vue-next";

const { signOut } = useUser();
const route = useRoute();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === "dark");
const toggleTheme = () => {
  colorMode.preference = isDark.value ? "light" : "dark";
};

const isActive = (path: string) => {
  if (path === "/dashboard") {
    return route.path === "/dashboard";
  }
  return route.path.startsWith(path);
};

const showAddFavorites = ref(false); // 控制弹窗显隐

watch(showAddFavorites, (val) => {
  if (val) {
    console.log("打开添加收藏弹窗");
    // 可以加载候选卡片数据、初始化选中状态等
  }
});


const showRemoveFavorites = ref(false); // 控制移除弹窗显隐

watch(showRemoveFavorites, (val) => {
  if (val) {
    console.log("打开移除收藏弹窗");
    // 可以预加载已收藏项目列表，供选择移除
  }
});



const menuItems1 = [
  {
    label: "全部应用",
    icon: LayoutDashboardIcon,
    to: "/dashboard/ai/demo",
    badge: "",
  },

];

const menuItems2 = [

  {
    label: "我的",
    icon: UserIcon,
    to: "/dashboard/settings",
    badge: "",
  },

];

const MyCollection = [
  {
    label: "收藏",
    icon: StarIcon,
    to: "/changelog/",
    badge: "",

  },
];

const recentChatItems = [
  {
    label: "最近对话",
    icon: MessageSquareMore,
    to: "/dashboard/ai/chat",
    badge: "",
  },
];

const bottomMenuItems = [
  
  {
    label: "联系我们",
    icon: MessageCircle,
    to: "/dashboard/settings",
  },
  {
    label: "用户协议",
    icon: FileText,
    to: "/dashboard/settings",
  },

];

defineProps<{
  onNavigate?: () => void;
}>();

const submenuVisible = ref(false);
const activeSubmenu = ref("");
const toggleSubmenuPanel = (label: string) => {
  if (submenuVisible.value && activeSubmenu.value === label) {
    submenuVisible.value = false;
  } else {
    activeSubmenu.value = label;
    submenuVisible.value = true;
  }
};

const submenus = {
  最近对话: [
    { label: "聊天助手", to: "/dashboard/ai/chat" },
    { label: "图片生成", to: "/dashboard/ai/image" },
  ],
};

const favoriteApps = [
  {
    id: "interview",
    name: "教案设计",
    description: "一个智能的教案设计助手",
    icon: "/images/note.svg",
    iconBgColor: "#FFD1DC",
    type: "completion",
    appCategory: "教案区",
    path: "/ai/completion/interview",
    apikey: "DIFY_API_KEY_APP_INTERVIEW",
    accessType: "vip",
  },
  {
    id: "interview2",
    name: "环创模版",
    description: "一个智能的教案设计助手",
    icon: "/images/art.svg",
    iconBgColor: "#B5E2FA",
    type: "chat",
    appCategory: "幼儿专区",
    path: "/ai/completion/interview",
    apikey: "DIFY_API_KEY_APP_INTERVIEW",
    accessType: "free",
  },
  {
    id: "interview",
    name: "作品分析",
    description: "一个智能的教案设计助手",
    icon: "/images/zuopinfenxi.svg",
    iconBgColor: "#E1F3FF",
    type: "chat",
    appCategory: "AI",
    path: "/ai/completion/interview",
    apikey: "DIFY_API_KEY_APP_INTERVIEW",
    accessType: "vip",
  },
  {
    id: "interview",
    name: "工作计划",
    description: "一个智能的教案设计助手",
    icon: "/images/plan.svg",
    iconBgColor: "#E8FCE4",
    type: "chat",
    appCategory: "幼儿专区",
    path: "/ai/completion/interview",
    apikey: "DIFY_API_KEY_APP_INTERVIEW",
    accessType: "vip",
  },
  {
    id: "interview",
    name: "幼儿评语",
    description: "一个智能的教案设计助手",
    icon: "/images/pingyu.svg",
    iconBgColor: "#F5E6FF",
    type: "chat",
    appCategory: "幼儿专区",
    path: "/ai/completion/interview",
    apikey: "DIFY_API_KEY_APP_INTERVIEW",
    accessType: "vip",
  },

];

const handleClick = (app: any) => {
  window.open(app.path, '_blank');
};




</script>





<template>
  <aside
    class="flex h-screen w-[250px] flex-col border border-white/50 shadow-xl bg-slate-50  dark:bg-gray-900 shadow-xs   fixed left-0 top-0 z-30 ">
    <div class="flex items-center gap-2 p-6">
      <NuxtLink to="/">
        <Logo class="h-15 mt-0" />
      </NuxtLink>
    </div>




    <nav class="flex-1 mt-4 space-y-1 p-5 text-lg">
      <NuxtLink v-for="item in menuItems1" :key="item.to" :to="item.to"
        class="group flex items-center gap-2 rounded-lg px-3 py-4 text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
        :class="[
          isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-gray-50 hover:text-primary'
        ]" :aria-current="isActive(item.to) ? 'page' : null" @click="onNavigate?.()">
        <component :is="item.icon" class="size-6 group-hover:rotate-12 transition-transform duration-300" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {{ item.badge }}
        </span>
      </NuxtLink>
      <div v-for="item in MyCollection" :key="item.to"
        class="group cursor-pointer flex items-center gap-2 rounded-lg px-3 py-4 text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
        :class="[
          isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-gray-50 hover:text-primary'
        ]" @click="toggleSubmenuPanel(item.label)">
        <component :is="item.icon" class="size-6 group-hover:rotate-12 transition-transform duration-300" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {{ item.badge }}
        </span>
      </div>

      <NuxtLink v-for="item in menuItems2" :key="item.to" :to="item.to"
        class="group flex items-center gap-2 rounded-lg px-3 py-4 text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
        :class="[
          isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-gray-50 hover:text-primary'
        ]" :aria-current="isActive(item.to) ? 'page' : null" @click="onNavigate?.()">
        <component :is="item.icon" class="size-6 group-hover:rotate-12 transition-transform duration-300" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {{ item.badge }}
        </span>
      </NuxtLink>



      <div class="border-t my-2"></div>

      <div v-for="item in recentChatItems" :key="item.to"
        class="group cursor-pointer flex items-center gap-2 rounded-lg px-3 py-4 text-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-[1px]"
        :class="[
          isActive(item.to)
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-gray-50 hover:text-primary'
        ]" @click="toggleSubmenuPanel(item.label)">
        <component :is="item.icon" class="size-6 group-hover:rotate-12 transition-transform duration-300" />
        <span>{{ item.label }}</span>
        <span v-if="item.badge" class="ml-auto rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
          {{ item.badge }}
        </span>
      </div>
    </nav>

    <div class="border-t p-3">

  <div class="group relative">
    <!-- 使用 lucide-vue-next 图标 + 文字，样式调整使其更协调 -->
    <div
      class="flex items-center gap-2 rounded-lg px-3 py-4 text-lg text-muted-foreground cursor-pointer transition-all duration-200 hover:-translate-y-[1px] hover:text-primary">
      <AlertCircle class="size-6 group-hover:rotate-12 transition-transform duration-300" />
      <span class="font-medium">关于酷师</span>
    </div>

    <div
      class="absolute bottom-full left-0 w-full invisible group-hover:visible bg-background border rounded-lg shadow-lg z-50">
      <nav class="space-y-1 p-2">
        <NuxtLink v-for="item in bottomMenuItems" :key="item.to" :to="item.to"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-m text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
          @click="onNavigate?.()">
          <component :is="item.icon" class="size-5" />
          <span>{{ item.label }}</span>
        </NuxtLink>
        <button
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-lg text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary"
              @click="signOut">
              <LogOutIcon class="size-6" />
              <span>退出登录</span>
            </button>

        <!-- 分割线 -->
        <div class="my-2 border-t border-gray-200 dark:border-white/10"></div>

        <!-- 备案号 -->
        <div class="text-m  text-gray-400 dark:text-white/30 px-4 py-2">
          陕ICP备20250001号
        </div>
      </nav>
    </div>

  </div>
</div>


  </aside>




  <transition name="fade">
    <div v-if="submenuVisible" class="fixed inset-0 z-20 bg-black/30 backdrop-blur-md"
      @click.self="submenuVisible = false" />
  </transition>

  <transition name="slide-bounce">

    <div v-if="submenuVisible && activeSubmenu === '最近对话'"
      class="fixed top-0 left-[250px] w-[280px] h-screen -ml-[1px]  shadow-r-xl border  rounded-r-lg  border-gray-200 bg-slate-50   z-40 ">
          <div class="p-6 border-b font-[Noto+Serif+SC] font-medium tracking-tight text-m">
  <div class="flex items-center justify-between">
    <div>最近对话</div>
    <div class="flex space-x-2 relative z-20">
      <button
        @click="showAddFavorites = true"
        class="flex items-center group gap-1  text-primary px-3 py-1 bg-primary/10 rounded-lg shadow-sm transform transition-all duration-300 hover:bg-primary/20 hover:shadow-xl hover:-translate-y-1 hover:scale-105"
      >
        <Settings2Icon class="w-4 h-4 transition-all group-hover:rotate-12" />
        管理
      </button>
    </div>
  </div>
</div>
      <nav class="p-4 space-y-2 rounded-lg">
        <NuxtLink v-for="item in submenus[activeSubmenu as keyof typeof submenus]" :key="item.to" :to="item.to"
          class="block px-4 py-2 rounded-lg text-lg text-muted-foreground hover:bg-primary/5 hover:text-primary transition-colors"
          @click="submenuVisible = false">
          {{ item.label }}
        </NuxtLink>
      </nav>
    </div>
  </transition>



  <!-- 移除收藏的弹窗框 -->
  <transition name="fade">
    <div v-if="showRemoveFavorites"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      @click.self="showRemoveFavorites = false">
      <div class="bg-white rounded-xl shadow-xl w-[500px] p-6">
        <h2 class="text-lg font-bold mb-4">移除收藏</h2>
        <!-- 显示当前已收藏的卡片供用户移除 -->
      </div>
    </div>
  </transition>



  <!-- 添加收藏的弹窗框 -->
  <transition name="fade">
    <div v-if="showAddFavorites"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
      @click.self="showAddFavorites = false">
      <div class="bg-white rounded-xl shadow-xl w-[500px] p-6">
        <h2 class="text-lg font-bold mb-4">选择你想收藏的应用</h2>
        <!-- 应用选择卡片区域 -->
        <!-- 你可以在此插入列表让用户选择并点击添加 -->
      </div>
    </div>
  </transition>




  <!-- 收藏侧边栏 -->
  <transition name="slide-bounce">


    <div v-if="submenuVisible && activeSubmenu === '收藏'"
      class="fixed top-0 left-[250px] w-[280px] h-screen -ml-[1px]  border  rounded-r-lg  shadow-r-xl border-gray-200 bg-slate-50  z-40  ">

      <div class="p-6 border-b font-[Noto+Serif+SC] font-medium tracking-tight text-m">
  <div class="flex items-center justify-between">
    <div>收藏应用</div>
    <div class="flex space-x-2 relative z-20">
      <button
        @click="showAddFavorites = true"
        class="flex items-center group gap-1  text-primary px-3 py-1 bg-primary/10 rounded-lg shadow-sm transform transition-all duration-300 hover:bg-primary/20 hover:shadow-xl hover:-translate-y-1 hover:scale-105"
      >
        <Settings2Icon class="w-4 h-4 transition-all group-hover:rotate-12" />
        编辑
      </button>
    </div>
  </div>
</div>
 



      <div class=" flex  flex-col p-4  mt-2 space-y-4">
        <!-- 按钮区域，提升层级 -->

       


        <Card v-for="app in favoriteApps" :key="app.id"
          class="relative flex flex-col rounded-2xl border-xl border-gray hover:border-primary transition-all duration-300 cursor-pointer group hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02]"
          @click="handleClick(app)">
          <div class="absolute -top-1 right-0">
            <span
              class="px-1.5 py-0.5 text-xs font-semibold   rounded-2xl shadow-sm border border-opacity-40 transition-all duration-300 opacity-80 hover:opacity-100"
              :class="{
                'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300': app.accessType === 'free',
                'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300': app.accessType === 'points',
                'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300': app.accessType === 'vip'
              }">
              {{
                app.accessType === 'free'
                  ? '免费'
                  : app.accessType === 'points'
                    ? '积分'
                    : 'VIP'
              }}
            </span>
          </div>
          <div class="flex gap-4 p-4">
            <div
              class="h-14 w-14 shadow-inner border-s border-white/50 rounded-xl   flex items-center justify-center text-3xl icon-container transition-transform duration-300 group-hover:rotate-12"
              :style="{ backgroundColor: app.iconBgColor }">
              <img :src="app.icon" class="w-8 h-8 object-contain" alt="app icon" />
            </div>
            <div class="flex flex-col flex-1">
              <h3 class="font-medium text-base">{{ app.name }}</h3>
              <p class="text-xs text-muted-foreground mt-1 leading-snug line-clamp-2">
                {{ app.description }}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </transition>
</template>

<style>
.slide-top-enter-active,
.slide-top-leave-active {
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
  will-change: transform, opacity;
}

.slide-top-enter-from,
.slide-top-leave-to {
  transform: translateY(-40px);
  opacity: 0;
  pointer-events: none;
}

.slide-top-enter-to,
.slide-top-leave-from {
  transform: translateY(0);
  opacity: 1;
}

.custom-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.custom-scroll::-webkit-scrollbar {
  width: 6px;
}

.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, filter 0.3s ease;
  filter: blur(0px);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  filter: blur(2px);
}


.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>



     