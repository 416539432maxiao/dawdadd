<template>
  <div class="h-screen overflow-y-hidden">
    <!-- PC Layout -->
    <div class="hidden md:flex gap-6 h-full">
      <div class="w-1/2 max-w-[600px] min-w-[420px] h-full">
        <CompletionInput @openDrawer="openDrawer" class="h-full" />
      </div>
      <div class="w-1/2 flex-grow h-full overflow-hidden py-4 pr-4">
        <CompletionText class="h-full" />
      </div>
    </div>

    <!-- Mobile Layout -->
    <div class="md:hidden h-full">
      <CompletionInput @openDrawer="openDrawer" />

      <!-- Mobile Drawer -->
      <Drawer v-model:open="isDrawerOpen" class="w-full sm:max-w-[90%]">
        <DrawerContent class="h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>AI 智能书写</DrawerTitle>
            <DrawerDescription v-if="workflowContent">
              已生成 {{ workflowContent.length }} 个字符
            </DrawerDescription>
          </DrawerHeader>
          <DrawerClose />

          <div class="flex-1 overflow-auto px-4">
            <CompletionText />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  </div>
</template>

<script setup lang="ts">
import lodash from "lodash";
import { useDifyChatStore } from "@/stores/dify-chat";
import { useUserTokenStore } from "@/stores/user-token";
import { useUser } from "@/modules/saas/auth/composables/useUser";

const { user } = useUser();
const difyChatStore = useDifyChatStore();
const { appInfo, isLoadingApp, workflowContent } = storeToRefs(difyChatStore);
const userTokenStore = useUserTokenStore();

const route = useRoute();
const appid = route.params.appid as string;
const isDrawerOpen = ref(false);

// 设置动态标题
useHead(() => ({
  title: appInfo.value?.name || "Dify Workflow",
}));

const initAppId = () => {
  if (appid) {
    difyChatStore.setAppId(appid);
  } else {
    console.error("appid is not set");
  }
};

difyChatStore.setType("workflow");
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
      difyChatStore.getCompletionSaved();
    }
  },
  { immediate: true }
);

// 监听生成内容变化，自动打开抽屉
watch(workflowContent, (newValue) => {
  if (newValue && window.innerWidth < 768) {
    isDrawerOpen.value = true;
  }
});

function openDrawer() {
  isDrawerOpen.value = true;
}
</script>
