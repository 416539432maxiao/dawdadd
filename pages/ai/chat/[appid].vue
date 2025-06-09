<script setup lang="ts">
import lodash from "lodash";
import { useDifyChatStore } from "@/stores/dify-chat";
import { useUser } from "@/modules/saas/auth/composables/useUser";

const { user } = useUser();

const difyChatStore = useDifyChatStore();
const { appInfo, isLoadingApp, showUserInputForm } = storeToRefs(difyChatStore);
const appName = computed(() => appInfo.value?.name);

const route = useRoute();
const appid = route.params.appid as string;

const isSheetOpen = ref(false);

// 设置动态标题
useHead(() => ({
  title: appInfo.value?.name || "Dify Chat",
}));

// 监听屏幕大小变化
const { width } = useWindowSize();
watch(width, (newWidth: number) => {
  if (newWidth >= 768) {
    isSheetOpen.value = false;
  }
});

const initAppId = () => {
  if (appid) {
    difyChatStore.setAppId(appid);
  } else {
    console.error("appid is not set");
  }
};

const closeSheet = () => {
  isSheetOpen.value = false;
};

difyChatStore.setType("chat");
initAppId();

onUnmounted(() => {
  difyChatStore.clearAll();
});

watch(
  user,
  async (userValue, oldValue) => {
    if (!userValue?.id || lodash.isEqual(userValue?.id, oldValue?.id)) return;

    if (userValue && userValue.id) {
      await difyChatStore.initDifyApp();
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="flex h-screen">
    <ChatSidebar class="hidden md:block" />

    <main class="flex-1 flex flex-col h-full">
      <template v-if="showUserInputForm">
        <DifyInputsComponent />
      </template>

      <template v-else>
        <header
          class="border-b p-4 flex items-center justify-between dark:border-b-gray-800"
        >
          <div class="flex items-center gap-2">
            <Sheet v-model:open="isSheetOpen">
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" class="md:hidden">
                  <LucideMenu class="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" class="w-64 p-0">
                <ChatSidebar class="md:hidden" @onclose="closeSheet" />
              </SheetContent>
            </Sheet>
            <Skeleton
              v-if="isLoadingApp || !appName"
              class="h-6 w-48 bg-primary/10"
            />
            <h1 class="text-lg font-semibold" v-else>
              {{ appName }}
            </h1>
          </div>
        </header>

        <template v-if="!isLoadingApp">
          <ChatMessages />
          <ChatTextarea />
        </template>
        <template v-else>
          <div class="flex-1 flex items-center justify-center">
            <LucideLoader2 class="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </template>
      </template>
    </main>
  </div>
</template>
