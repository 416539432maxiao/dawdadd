<script setup lang="ts">
import { Dialog, DialogContent } from "@/modules/ui/components/dialog";
import { useDifyChatStore } from "@/stores/dify-chat";

interface StreamFile {
  dify_model_identity: string;
  id: string | null;
  tenant_id: string;
  type: string;
  transfer_method: string;
  remote_url: string | null;
  related_id: string;
  filename: string;
  extension: string;
  mime_type: string;
  size: number;
  url: string;
}

interface File {
  id: string;
  name: string;
  file_name?: string;
  size: number;
  type?: string;
  url?: string;
}

interface Props {
  files: File[] | StreamFile[];
  readonly?: boolean;
}

const props = defineProps<Props>();

const difyChatStore = useDifyChatStore();

// 当前预览的图片
const previewImage = ref<{ url: string; name: string } | null>(null);

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// 判断是否为图片
const isImage = (type: string | undefined) => {
  return type?.startsWith("image") || false;
};

// 打开图片预览
const openPreview = (file: File) => {
  if (file.url) {
    previewImage.value = {
      url: getFullUrl(file.url),
      name: file.name,
    };
  }
};

// 获取链接地址
const getFullUrl = (url: string) => {
  if (url.startsWith("http")) {
    return url;
  } else if (url.startsWith("/")) {
    return `${difyChatStore.appInfo?.url}${url}`;
  } else {
    return `${difyChatStore.appInfo?.url}/${url}`;
  }
};

// 删除文件
const removeFile = (fileId: string) => {
  difyChatStore.uploadingFiles = difyChatStore.uploadingFiles.filter(
    (file) => file.id !== fileId
  );
};

// 关闭图片预览
const closePreview = () => {
  previewImage.value = null;
};

// 获取文件扩展名
const getFileExtension = (filename: string) => {
  const ext = filename.split(".").pop();
  return ext ? ext.toUpperCase() : "FILE";
};

// 点击下载
const onDownload = async (file: File) => {
  try {
    // 验证 URL
    if (!file.url || !isValidUrl(file.url)) {
      throw new Error("Invalid URL");
    }

    // 创建临时链接元素
    const link = document.createElement("a");
    link.style.display = "none";
    link.href = getFullUrl(file.url);
    link.download = file.name || file.filename;
    link.target = "_blank";

    // 添加到 DOM
    document.body.appendChild(link);

    // 触发下载
    link.click();

    // 清理 DOM
    setTimeout(() => {
      document.body.removeChild(link);
    }, 100);
  } catch (error) {
    console.error("Download failed:", error);
    // 处理错误,显示提示等
  }
};

// URL 验证函数
const isValidUrl = (url: string): boolean => {
  try {
    new URL(getFullUrl(url));
    return true;
  } catch {
    return false;
  }
};
</script>

<template>
  <div
    class="flex items-center gap-2 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 cursor-pointer"
  >
    <div
      v-for="file in files"
      :key="file.id"
      class="flex-shrink-0 group relative rounded-lg border dark:border-gray-700 p-2 bg-muted hover:bg-muted/80"
      :class="{ 'hover:bg-muted': readonly }"
    >
      <!-- 图片预览 -->
      <div v-if="isImage(file.type)" class="relative">
        <img
          :src="getFullUrl(file.url)"
          :alt="file.name || file.filename"
          class="h-20 w-20 object-cover rounded cursor-pointer"
          @click="openPreview(file)"
        />
        <LucideDownload
          v-if="file.url"
          @click="onDownload(file)"
          class="absolute right-0 bottom-0 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      <!-- 文件预览 -->
      <div v-else class="flex flex-col gap-1 group" @click="onDownload(file)">
        <div class="flex items-center gap-2 text-foreground">
          <LucideFile class="h-5 w-5" />
          <div class="text-sm truncate max-w-[120px]">
            {{ file.name || file.filename }}
          </div>
        </div>
        <div
          class="text-xs text-muted-foreground flex justify-between items-center"
        >
          <div>
            {{ getFileExtension(file.name || file.filename) }} ·
            {{ formatFileSize(file.size) }}
          </div>
          <LucideDownload
            v-if="file.url"
            class="ml-4 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
          />
        </div>
      </div>

      <!-- 删除按钮 -->
      <Button
        v-if="!readonly"
        variant="outline"
        size="icon"
        class="absolute -right-2 -top-2 h-6 w-6 rounded-full border border-gray-200 dark:border-gray-700 bg-background opacity-0 group-hover:opacity-100 transition-opacity"
        @click="removeFile(file.id)"
      >
        <LucideX class="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>

  <!-- 图片预览弹窗 -->
  <Dialog :open="!!previewImage" @update:open="closePreview">
    <DialogContent class="max-w-4xl">
      <div class="relative">
        <img
          v-if="previewImage"
          :src="previewImage.url"
          :alt="previewImage.name"
          class="w-auto h-auto rounded-lg max-h-[80vh] m-auto"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.scrollbar-thin {
  scrollbar-width: thin;
}
.scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 9999px;
}
.dark .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
  background-color: #4b5563;
}
</style>
