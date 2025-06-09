<template>
  <div class="w-full">
    <div class="flex gap-2 mb-2">
      <input
        ref="fileInput"
        type="file"
        :name="name"
        :required="input.required"
        :accept="inputAccept"
        :multiple="isMultiple"
        @change="handleFileChange"
        class="hidden"
        :aria-label="'Upload file'"
        tabindex="-1"
      />

      <Button
        variant="outline"
        size="sm"
        @click="fileInput?.click()"
        :disabled="componentUploading || (isMultiple && hasReachedMaxFiles)"
      >
        <LucideUpload class="h-4 w-4 mr-2" />
        {{ componentUploading ? "上传中..." : uploadButtonLabel }}
      </Button>

      <!-- 粘贴链接按钮: 目前Dify有bug，暂时不支持 -->
      <!-- <Button
        v-if="showUrlUploadButton"
        variant="outline"
        size="sm"
        @click="showUrlInput = true"
        :disabled="componentUploading || (isMultiple && hasReachedMaxFiles)"
      >
        <LucideLink class="h-4 w-4 mr-2" />
        {{ urlPasteButtonLabel }}
      </Button> -->
    </div>

    <!-- URL Input Dialog -->
    <div v-if="showUrlInput" class="mt-2 mb-2">
      <div class="flex gap-2">
        <input
          v-model="urlInput"
          type="text"
          class="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="输入文件链接"
        />
        <Button
          variant="default"
          size="sm"
          @click="addUrlFile"
          :disabled="!urlInput"
        >
          确认
        </Button>
        <Button variant="ghost" size="sm" @click="showUrlInput = false">
          取消
        </Button>
      </div>
    </div>

    <!-- Selected Files List -->
    <div v-if="selectedFiles.length > 0" class="mt-2 space-y-2">
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="flex items-center gap-2 p-2 text-sm text-gray-600 bg-gray-50 rounded-md"
      >
        <div class="flex-shrink-0">
          <!-- Preview for images -->
          <img
            v-if="file.type.startsWith('image/') || file.isRemoteImage"
            :src="getFilePreview(file)"
            class="h-8 w-8 object-cover rounded"
            alt="preview"
          />
          <!-- Icon for other file types -->
          <div v-else class="h-8 w-8 flex items-center justify-center">
            <LucideFile class="h-4 w-4" />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="truncate">{{ file.name }}</div>
          <div class="text-xs text-gray-400">
            <template v-if="file.size">
              {{ formatFileSize(file.size) }}
              <span v-if="file.uploadProgress !== undefined">
                · {{ file.uploadProgress }}%
              </span>
            </template>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 hover:bg-gray-200"
          @click="removeFile(index)"
          :disabled="isUploading"
        >
          <LucideX class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "@/modules/ui/components/toast/use-toast";
import type { FileInput, FileListInput } from "@/modules/ai/types/dify.type";
import {
  validateFileType,
  getInputAccept,
  formatFileSize,
} from "@/modules/ai/tools/file-types";
import type { FileType } from "@/modules/ai/tools/file-types";
import { useDifyChatStore } from "@/stores/dify-chat";
import { LucideLink } from "lucide-vue-next";

interface UploadingFile extends File {
  uploadProgress?: number;
  preview?: string;
  url?: string;
  upload_file_id?: string;
  isRemoteImage?: boolean;
  transferMethod?: "local_file" | "remote_url";
}

const props = defineProps<{
  input: FileInput | FileListInput;
}>();

const fileInput = ref<HTMLInputElement>();
const selectedFiles = ref<UploadingFile[]>([]);
const { toast } = useToast();
const chatStore = useDifyChatStore();
const { isUploading, userInputFormCache } = storeToRefs(chatStore);
const componentUploading = ref(false);
const showUrlInput = ref(false);
const urlInput = ref("");

// 判断是否为多文件上传
const isMultiple = computed(() => props.input.type === "file-list");

// 判断是否显示URL上传按钮
const showUrlUploadButton = computed(() => {
  const methods = props.input.allowed_file_upload_methods;
  return methods && methods.includes("remote_url");
});

// 是否处理图片
const isImageEnabled = computed(() => {
  return props.input.image && props.input.image.enabled === true;
});

// 上传按钮的标签
const uploadButtonLabel = computed(() => {
  return isImageEnabled.value ? "上传图片" : "从本地上传";
});

// 粘贴链接按钮标签
const urlPasteButtonLabel = computed(() => {
  return isImageEnabled.value ? "粘贴图片链接" : "粘贴链接";
});

// 是否已达到最大文件数量限制
const hasReachedMaxFiles = computed(() => {
  if (!isMultiple.value || !props.input.max_length) return false;
  return selectedFiles.value.length >= props.input.max_length;
});

// 计算文件选择器的 accept 属性
const inputAccept = computed(() =>
  getInputAccept(props.input.allowed_file_types)
);

// 生成唯一的 name
const name = computed(
  () =>
    props.input.variable || `file-upload-${Math.random().toString(36).slice(2)}`
);

const uploadFile = async (file: File): Promise<string> => {
  if (!validateFileType(file, props.input.allowed_file_types)) {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }

  try {
    const response = await chatStore.uploadFileToDify(file);
    return response.id;
  } catch (error: any) {
    throw new Error(error.message || "文件上传失败");
  }
};

// 添加URL文件
const addUrlFile = async () => {
  if (!urlInput.value) return;

  // 检查文件数量限制
  if (
    isMultiple.value &&
    props.input.max_length &&
    selectedFiles.value.length >= props.input.max_length
  ) {
    toast({
      variant: "destructive",
      title: "文件数量超出限制",
      description: `最多允许上传 ${props.input.max_length} 个文件`,
    });
    return;
  }

  const url = urlInput.value.trim();
  const fileName = url.split("/").pop() || "remote-file";

  // 创建一个类似File的对象
  const remoteFile = {
    name: fileName,
    url: url,
    type: isImageEnabled.value ? "image/url" : "unknown/url",
    isRemoteImage: isImageEnabled.value,
    transferMethod: "remote_url" as const,
    // 自定义方法，避免类型错误
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    slice: () => new Blob(),
    stream: () => new ReadableStream(),
    text: () => Promise.resolve(""),
  } as UploadingFile;

  if (isMultiple.value) {
    selectedFiles.value = [...selectedFiles.value, remoteFile];
  } else {
    selectedFiles.value = [remoteFile];
  }

  // 重置URL输入
  urlInput.value = "";
  showUrlInput.value = false;
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files) {
    const files = Array.from(input.files);

    // 检查文件数量限制
    if (isMultiple.value && props.input.max_length) {
      const totalFiles = selectedFiles.value.length + files.length;
      if (totalFiles > props.input.max_length) {
        toast({
          variant: "destructive",
          title: "文件数量超出限制",
          description: `最多允许上传 ${props.input.max_length} 个文件`,
        });
        input.value = ""; // Reset input
        return;
      }
    }

    const newFiles: UploadingFile[] = [];

    isUploading.value = true;
    componentUploading.value = true;

    try {
      for (const file of files) {
        // 验证文件类型
        if (!validateFileType(file, props.input.allowed_file_types)) {
          toast({
            variant: "destructive",
            title: "不支持的文件类型",
            description: `文件 ${file.name} 类型不支持`,
          });
          continue;
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          (file as UploadingFile).preview = URL.createObjectURL(file);
        }

        // Start uploading
        (file as UploadingFile).uploadProgress = 0;
        (file as UploadingFile).transferMethod = "local_file";

        try {
          const fileId = await uploadFile(file);
          (file as UploadingFile).uploadProgress = 100;
          (file as UploadingFile).upload_file_id = fileId;
          newFiles.push(file as UploadingFile);
        } catch (error: any) {
          toast({
            variant: "destructive",
            title: "上传失败",
            description: error.message,
          });
        }
      }

      selectedFiles.value = isMultiple.value
        ? [...selectedFiles.value, ...newFiles]
        : newFiles;
    } finally {
      isUploading.value = false;
      componentUploading.value = false;
      input.value = ""; // Reset input after selection
    }
  }
};

const removeFile = (index: number) => {
  const file = selectedFiles.value[index];
  if ((file as UploadingFile).preview) {
    URL.revokeObjectURL((file as UploadingFile).preview!);
  }
  selectedFiles.value.splice(index, 1);
};

const getFilePreview = (file: UploadingFile) => {
  return file.preview || file.url;
};

const determineFileType = (file: UploadingFile): FileType => {
  if (file.type.startsWith("image/") || file.isRemoteImage) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  if (validateFileType(file as unknown as File, ["document"]))
    return "document";
  return "custom";
};

watch(selectedFiles, (newFiles) => {
  chatStore.userInputFormCache[props.input.variable] = newFiles;

  const list = newFiles.map((file) => ({
    type: determineFileType(file),
    transfer_method: file.transferMethod || ("local_file" as const),
    url: file.url || "",
    upload_file_id: file.upload_file_id || "",
  }));

  chatStore.userInputs[props.input.variable] = isMultiple.value
    ? list
    : list[0];
});

onMounted(() => {
  selectedFiles.value = userInputFormCache.value[props.input.variable] || [];
});
</script>
