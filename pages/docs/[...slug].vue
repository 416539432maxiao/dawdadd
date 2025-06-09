<script setup lang="ts">
definePageMeta({
  layout: "marketing",
});

useHead({
  title: "文档",
})

// 使用 queryContent 的类型
interface TocLink {
  id: string;
  text: string;
  depth: number;
}

interface PageData {
  content: any;
  meta: any;
  toc: TocLink[];
}

const route = useRoute();

// 改用 useAsyncData
const { data: pageData } = await useAsyncData<PageData>(
  `content-${route.path}`, // 使用动态键名
  async () => {
    const [content, navigation] = await Promise.all([
      queryContent(route.path).findOne(),
      queryContent("/docs/meta").findOne(),
    ]);

    return {
      content,
      meta: navigation,
      toc: content?.body?.toc?.links || [],
    };
  },
  {
    server: true,
    lazy: false,
  }
);

const data = computed(() => pageData.value?.content);
const meta = computed(() => pageData.value?.meta);
const toc = computed(() => pageData.value?.toc || []);

// 添加响应式高度变量
const headerHeight = ref(85);

// 添加监听函数
onMounted(() => {
  const header = document.getElementById("marketing-header");
  if (header) {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        headerHeight.value = entry.contentRect.height;
      }
    });

    resizeObserver.observe(header);

    // 清理函数
    onUnmounted(() => {
      resizeObserver.disconnect();
    });
  }
});
</script>

<template>
  <div :style="{ marginTop: `${headerHeight}px` }">
    <div class="flex gap-4">
      <!-- 左侧边栏 -->
      <div class="hidden lg:block w-60 shrink-0">
        <div
          class="fixed h-screen max-h-[calc(100vh-80px)] w-60 overflow-y-auto pt-4 pb-8 px-6 border-r border-border"
        >
          <DocsSidebar :meta="meta" />
        </div>
      </div>

      <!-- 主内容区域 -->
      <div class="min-w-0 flex-1 pt-8 pb-16 mx-8">
        <div class="flex gap-8">
          <div class="min-w-0 flex-1">
            <!-- 移动端目录导航 -->
            <div class="block lg:hidden mb-8">
              <DocsToc :toc="toc" />
            </div>

            <!-- 主要内容区域 -->
            <div class="prose dark:prose-invert max-w-none">
              <ContentRenderer v-if="data" :value="data">
                <template #empty>
                  <h1>文档不存在</h1>
                </template>
              </ContentRenderer>
            </div>
          </div>

          <!-- 右侧目录导航 -->
          <div class="hidden lg:block w-48 shrink-0">
            <div
              class="fixed top-28 max-h-[calc(100vh-120px)] overflow-y-auto px-4"
            >
              <DocsToc :toc="toc" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端侧边栏按钮和抽屉 -->
    <ClientOnly>
      <Sheet>
        <SheetTrigger class="fixed bottom-8 right-8 lg:hidden">
          <Button size="icon" variant="outline">
            <LucideLogs class="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-[300px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>文档导航</SheetTitle>
          </SheetHeader>
          <div class="mt-4">
            <DocsSidebar :meta="meta" />
          </div>
        </SheetContent>
      </Sheet>
    </ClientOnly>
  </div>
</template>
