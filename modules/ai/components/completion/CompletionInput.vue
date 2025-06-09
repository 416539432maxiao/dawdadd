<template>
  <div class="w-full p-4 md:p-6 h-full flex flex-col bg-background text-foreground dark:bg-gray-900 dark:text-white">
    <!-- 应用信息区域 -->
    <div class="flex items-start md:items-center justify-between mb-8">
      <div class="flex flex-col md:flex-row md:items-center gap-3 md:gap-5">
        <div
          class="h-14 w-14 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg ring-2 ring-primary/20"
          :style="{ backgroundColor: currentApp?.iconBgColor }"
        >
          <img
            v-if="currentApp?.icon && currentApp.icon.endsWith('.svg')"
            :src="currentApp.icon"
            alt="app icon"
            class="h-9 w-9 object-contain"
            @error="currentApp.icon = '📘'"
          />
          <span v-else class="text-2xl">
            {{ currentApp?.icon }}
          </span>
        </div>
        <div>
          <h1 class="text-2xl font-bold leading-tight">
            {{ currentApp?.name || "文本生成型应用" }}
          </h1>
          <p v-if="currentApp?.description" class="text-sm text-muted-foreground leading-snug">
            {{ currentApp.description }}
          </p>
        </div>
      </div>

      <!-- 小屏显示按钮 -->
      <div class="ml-auto md:hidden">
        <Button
          class="hover:scale-[1.02] active:scale-95 transition-transform"
          size="sm"
          variant="outline"
          @click="openDrawer"
        >
          <LucideSparkle class="mr-1 h-4 w-4" />
          AI 智能书写
        </Button>
      </div>
    </div>

    <!-- 标签页 -->
    <Tabs class="w-full flex flex-col flex-grow overflow-y-hidden" v-model="activeTab">
      <TabsList class="grid w-full grid-cols-2 bg-muted p-1 rounded-xl mb-6">
        <TabsTrigger
          value="run"
          class="py-2 text-base font-medium rounded-lg transition-all duration-200 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          运行
        </TabsTrigger>
        <TabsTrigger
          value="saved"
          class="py-2 text-base font-medium rounded-lg transition-all duration-200 ease-in-out data-[state=active]:bg-primary data-[state=active]:text-white"
        >
          已保存
          <Button
            v-if="completionSavedList.length"
            class="ml-2 h-5 px-2 text-xs rounded bg-white text-primary"
            variant="ghost"
            size="sm"
          >
            {{ completionSavedList.length }}
          </Button>
        </TabsTrigger>
      </TabsList>

      <!-- 运行页内容 -->
      <TabsContent
        value="run"
        v-if="activeTab === 'run'"
        class="flex flex-col justify-between flex-grow overflow-y-auto space-y-6"
      >
        <Card class="rounded-3xl hover:shadow-xl shadow border border-gray-100 dark:border-white/10 bg-white dark:bg-white/5">
          <CardContent class="space-y-6 pt-6">
            <div v-if="isLoadingApp">
              <div class="space-y-4">
                <Skeleton class="h-4 w-1/4 mb-2 rounded bg-gray-200 dark:bg-white/10" />
                <Skeleton class="h-10 rounded bg-gray-200 dark:bg-white/10" />
                <Skeleton class="h-4 w-1/4 mb-2 rounded bg-gray-200 dark:bg-white/10" />
                <Skeleton class="h-10 rounded bg-gray-200 dark:bg-white/10" />
                <Skeleton class="h-4 w-1/4 mb-2 rounded bg-gray-200 dark:bg-white/10" />
                <Skeleton class="h-10 rounded bg-gray-200 dark:bg-white/10" />
              </div>
            </div>
            <template v-else-if="userInputFormList.length > 0">
              <DifyForm layout="vertical" />
            </template>

            <template v-if="type === 'completion' && enableFileUpload">
              <DifyFileInput
                v-if="appParameters?.file_upload"
                :input="fileUploadInput"
                layout="vertical"
              />
            </template>

            <div class="flex justify-end gap-4">
              <Button variant="outline" class="min-w-[80px]"> 清空 </Button>
              <Button
                class="min-w-[100px] bg-primary text-white hover:bg-primary/90 transition hover:scale-[1.01] active:scale-95"
                @click="runGeneration"
                :disabled="isLoadingMessage"
              >
                <LucideLoader2 v-if="isLoadingMessage" class="h-4 w-4 animate-spin mr-2" />
                <LucidePlay v-else class="h-4 w-4 mr-2" />
                {{ isLoadingMessage ? "生成中..." : "运行" }}
              </Button>
            </div>
          </CardContent>
        </Card>

        <ChatUserTokenBar />
      </TabsContent>

      <!-- 已保存页内容 -->
      <TabsContent
        value="saved"
        v-if="activeTab === 'saved'"
        class="flex-grow overflow-y-auto"
      >
        <CompletionSaved @switchToRun="handleSwitchToRun" />
      </TabsContent>
    </Tabs>
  </div>
</template>




<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";
import { computed } from "vue";
import type { FileInput } from "@/modules/ai/types/dify.type";

const difyChatStore = useDifyChatStore();
const {
  currentApp,
  appParameters,
  isLoadingMessage,
  userInputs,
  isLoadingApp,
  completionSavedList,
  type,
  enableFileUpload,
} = storeToRefs(difyChatStore);

const activeTab = ref("run");
const emit = defineEmits(["openDrawer"]);

const fileUploadInput = computed(() => {
  const file_upload = appParameters.value?.file_upload;
  const image = file_upload?.image;

  return {
    label: image?.enabled ? "上传图片" : "上传文件",
    type: "file" as const,
    variable: "file_upload",
    required: false,
    max_length: file_upload?.number_limits || 1,
    allowed_file_types: file_upload?.allowed_file_types || [],
    allowed_file_extensions: file_upload?.allowed_file_extensions || [],
    allowed_file_upload_methods: file_upload?.allowed_file_upload_methods || [],
  } as FileInput;
});

const userInputFormList = computed(() => {
  const list: any[] = [];
  (appParameters.value?.user_input_form || []).forEach((field) => {
    Object.entries(field).forEach(([key, value]) => {
      if (value && typeof value === "object") {
        value.type = value.type || key;
        list.push(value);
      }
    });
  });
  return list;
});

function clearForm() {
  userInputs.value = {};
}

function runGeneration() {
  if (type.value === "workflow") {
    difyChatStore.startWorkflow();
  } else {
    difyChatStore.startTextGeneration();
  }
}

function handleSwitchToRun() {
  activeTab.value = "run";
}

function openDrawer() {
  emit("openDrawer");
}
</script>
