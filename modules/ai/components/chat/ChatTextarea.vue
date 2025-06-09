<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";
import { useToast } from "@/modules/ui/components/toast/use-toast";
import FilePreview from "./FilePreview.vue";
import { validateFileType } from "@/modules/ai/tools/file-types";
const difyChatStore = useDifyChatStore();
const {
  isLoadingMessage,
  isUploading,
  uploadingFiles,
  enableFileUpload,
  fileInputAccept,
  allowedFileTypes,
  fileInputLimit,
} = storeToRefs(difyChatStore);
const { toast } = useToast();

const newMessage = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const initialHeight = ref(84.5);

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;
  if (isUploading.value) {
    toast({
      variant: "destructive",
      description: "文件正在上传中，请等待上传完成",
    });
    return;
  }

  try {
    await difyChatStore.sendMessage(newMessage.value);
    newMessage.value = "";
    nextTick(() => {
      adjustTextareaHeight();
    });
  } catch (error: any) {
    console.error(error);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    if (!isLoadingMessage.value && !isUploading.value) {
      sendMessage();
    }
  } else if (e.key === "Enter" && e.shiftKey) {
    nextTick(() => {
      adjustTextareaHeight();
    });
  }
};

const adjustTextareaHeight = () => {
  const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
  const wrapper = document.getElementById("dify-chat-textarea_wrapper");
  const handler = document.getElementById("dify-chat-textarea_handler");

  if (textarea && wrapper && handler) {
    textarea.style.height = "auto";
    wrapper.style.height = "auto";

    const scrollHeight = Math.min(192, textarea.scrollHeight);
    textarea.style.height = `${scrollHeight}px`;

    const handlerHeight = handler.offsetHeight;
    const totalHeight = Math.min(360, scrollHeight + handlerHeight + 18);
    wrapper.style.height = `${Math.max(initialHeight.value, totalHeight)}px`;
  }
};

// Watch for changes in uploadingFiles to adjust height when files are added/removed
watch(
  () => uploadingFiles.value,
  () => {
    nextTick(() => {
      adjustTextareaHeight();
    });
  },
  { deep: true }
);

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = input.files;
  const max = fileInputLimit.value;

  if (!files || files.length === 0) return;

  if (files.length > max || uploadingFiles.value.length >= max) {
    toast({
      variant: "destructive",
      description: `最多上传 ${max} 个文件`,
    });
    return;
  }

  // 遍历所有文件进行验证和上传
  for (const file of Array.from(files)) {
    // 验证文件类型
    const isSupported = validateFileType(file, allowedFileTypes.value);
    if (!isSupported) {
      toast({
        variant: "destructive",
        description: `文件 ${file.name} 类型不支持`,
      });
      continue;
    }

    try {
      await difyChatStore.uploadFile(file);
    } catch (error) {
      console.error("File upload error:", error);
      toast({
        variant: "destructive",
        description: `文件 ${file.name} 上传失败`,
      });
    }
  }

  // 重置文件输入框
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

onMounted(() => {
  initialHeight.value = document.getElementById("dify-chat-textarea_wrapper")
    ?.offsetHeight as number;
});
</script>

<template>
  <div class="border-t p-4 dark:border-t-gray-800">
    <div class="max-w-[780px] mx-auto">
      <div
        id="dify-chat-textarea_wrapper"
        class="relative border rounded-lg p-2 bg-background"
      >
        <textarea
          v-model="newMessage"
          placeholder="开始对话"
          :disabled="isLoadingMessage"
          class="w-full resize-none bg-background overflow-y-auto border-none focus-visible:ring-0 px-2 py-0"
          :style="{ maxHeight: '192px' }"
          rows="1"
          @keydown="handleKeydown"
          @input="adjustTextareaHeight"
        />
        <div
          id="dify-chat-textarea_handler"
          class="flex justify-between items-end"
        >
          <div class="flex-grow">
            <FilePreview
              v-if="enableFileUpload && uploadingFiles.length > 0"
              :files="uploadingFiles"
            />
          </div>
          <div v-if="!isLoadingMessage">
            <template v-if="enableFileUpload">
              <input
                ref="fileInput"
                type="file"
                class="hidden"
                :accept="fileInputAccept"
                @change="handleFileUpload"
                :multiple="fileInputLimit > 1"
                :max="fileInputLimit"
              />
              <Button
                variant="ghost"
                size="icon"
                :disabled="isUploading"
                @click="fileInput?.click()"
              >
                <LucidePaperclip
                  class="h-4 w-4"
                  :class="{ 'animate-spin': isUploading }"
                />
              </Button>
            </template>
            <Button
              variant="ghost"
              size="icon"
              :disabled="!newMessage.trim() || isUploading"
              @click="sendMessage"
            >
              <LucideSend class="h-4 w-4" />
            </Button>
          </div>
          <div
            v-else
            class="absolute inset-0 flex items-center justify-center bg-background/80"
          >
            <LucideLoader class="h-6 w-6 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
