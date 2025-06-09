<template>
  <div class="flex flex-col space-y-4">
    <h2 class="text-2xl font-bold tracking-tight text-foreground">存储演示</h2>
    <p class="text-sm text-muted-foreground">
      一个简单的 Supabase Storage 操作演示
    </p>

    <div class="flex flex-col gap-6">
      <!-- 上传区域 -->
      <Card class="p-4 md:p-6">
        <div
          class="border-2 border-dashed rounded-lg p-4 md:p-8 text-center"
          :class="[
            isDragging ? 'border-primary' : 'border-muted-foreground/25',
            isUploading ? 'opacity-50 cursor-wait' : 'cursor-pointer',
          ]"
          @dragenter.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @dragover.prevent
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleFileSelect"
            max-size="2097152"
          />
          <UploadCloudIcon
            class="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-4 text-muted-foreground"
          />
          <p class="text-xs md:text-sm text-muted-foreground">
            {{ isUploading ? "上传中..." : "拖拽文件到此处或点击上传" }}
          </p>
        </div>
      </Card>

      <!-- 文件列表 -->
      <div class="space-y-3 md:space-y-4">
        <div
          v-if="files.length === 0"
          class="text-center p-4 text-muted-foreground border rounded-md h-[150px] md:h-[200px] flex items-center justify-center text-xs md:text-sm"
        >
          {{ isFetching ? "加载中..." : "暂无文件" }}
        </div>
        <Card v-else v-for="file in files" :key="file.name" class="p-3 md:p-4">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div class="flex items-center gap-3">
              <div
                v-if="isImageFile(file.name)"
                class="w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                @click="previewImage(file)"
              >
                <img
                  :src="getFileUrl(file.name)"
                  class="w-full h-full object-cover"
                  alt="预览图"
                />
              </div>
              <FileIcon
                v-else
                class="w-4 h-4 text-muted-foreground flex-shrink-0"
              />
              <div class="min-w-0 flex-1">
                <p class="text-xs md:text-sm font-medium truncate">
                  {{ file.name }}
                </p>
                <p class="text-[10px] md:text-xs text-muted-foreground">
                  {{ formatFileSize(file.metadata?.size) }}
                </p>
              </div>
            </div>
            <div class="flex gap-2 justify-end md:justify-start">
              <Button
                variant="ghost"
                size="icon"
                @click="downloadFile(file)"
                class="h-8 w-8 md:h-9 md:w-9 dark:hover:bg-gray-700"
              >
                <DownloadIcon class="h-3 w-3 md:h-4 md:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                @click="deleteFile(file.name)"
                class="h-8 w-8 md:h-9 md:w-9 dark:hover:bg-gray-700"
                :disabled="isDeletingFile === file.name"
              >
                <Loader2Icon
                  v-if="isDeletingFile === file.name"
                  class="h-3 w-3 md:h-4 md:w-4 animate-spin"
                />
                <TrashIcon v-else class="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>

    <!-- 图片预览弹窗 -->
    <Dialog :open="!!previewImageUrl" @update:open="previewImageUrl = ''">
      <DialogContent
        class="max-w-[90vw] md:max-w-screen-lg h-[80vh] flex items-center justify-center p-0"
      >
        <img
          :src="previewImageUrl"
          class="max-w-full max-h-full object-contain"
          alt="预览图"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  UploadCloudIcon,
  FileIcon,
  TrashIcon,
  DownloadIcon,
  Loader2Icon,
  XIcon,
} from "lucide-vue-next";
import { useToast } from "@/modules/ui/components/toast/use-toast";

const supabase = useSupabaseClient();
const { user } = useUser();
const { toast } = useToast();

const BUCKET_NAME = "demo-files";
const files = ref<any[]>([]);
const isDragging = ref(false);
const isUploading = ref(false);
const isFetching = ref(true);
const fileInput = ref<HTMLInputElement | null>(null);
const isDeletingFile = ref<string | null>(null);
const previewImageUrl = ref<string>("");

// 获取用户文件夹路径
const getUserFolderPath = () => {
  return `${user.value?.id}`;
};

// 获取文件列表
const fetchFiles = async () => {
  isFetching.value = true;
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(getUserFolderPath());
    if (error) throw error;
    files.value = data || [];
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isFetching.value = false;
  }
};

// 触发文件选择
const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click();
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    uploadFile(input.files[0]);
  }
};

// 处理拖放
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  if (event.dataTransfer?.files.length) {
    uploadFile(event.dataTransfer.files[0]);
  }
};

// 上传文件
const uploadFile = async (file: File) => {
  isUploading.value = true;
  try {
    const filePath = `${getUserFolderPath()}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);
    if (error) throw error;

    toast({
      title: "成功",
      description: "文件已上传",
      duration: 2000,
    });
    await fetchFiles();
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isUploading.value = false;
  }
};

// 下载文件
const downloadFile = async (file: any) => {
  try {
    const filePath = `${getUserFolderPath()}/${file.name}`;
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .download(filePath);
    if (error) throw error;

    // 创建下载链接
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  }
};

// 删除文件
const deleteFile = async (fileName: string) => {
  if (!window.confirm("确定要删除这个文件吗？")) return;

  isDeletingFile.value = fileName;
  try {
    const filePath = `${getUserFolderPath()}/${fileName}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    if (error) throw error;

    toast({
      title: "成功",
      description: "文件已删除",
      duration: 2000,
    });
    await fetchFiles();
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isDeletingFile.value = null;
  }
};

// 格式化文件大小
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "未知大小";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// 判断是否为图片文件
const isImageFile = (fileName: string): boolean => {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExtensions.some((ext) => fileName.toLowerCase().endsWith(ext));
};

// 获取文件URL
const getFileUrl = (fileName: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(`${getUserFolderPath()}/${fileName}`);
  return data.publicUrl;
};

// 预览图片
const previewImage = (file: any) => {
  previewImageUrl.value = getFileUrl(file.name);
};

// 组件加载时获取文件列表
onMounted(() => {
  fetchFiles();
});
</script>
