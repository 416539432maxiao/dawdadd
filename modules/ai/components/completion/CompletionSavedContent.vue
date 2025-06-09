<template>
  <Card class="mb-4">
    <CardContent class="pt-6">
      <!-- Content -->
      <div
        ref="contentRef"
        :class="{
          'max-h-[320px] overflow-hidden': !expanded && shouldShowExpand,
        }"
      >
        <MarkdownRender :content="content" is-bot-message />
      </div>

      <!-- Expand/Collapse Button -->
      <div v-if="shouldShowExpand" class="mt-4 text-center">
        <Button variant="ghost" size="sm" @click="expanded = !expanded">
          {{ expanded ? "收起" : "展开" }}
          <LucideChevronDown v-if="!expanded" class="ml-2 h-4 w-4" />
          <LucideChevronUp v-else class="ml-2 h-4 w-4" />
        </Button>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t mt-4 pt-4">
        <div class="text-sm text-gray-500">
          {{ new Date(created_at).toLocaleString() }}
        </div>
        <div class="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            class="gap-2"
            @click="copyContent"
          >
            <LucideCopy />
            复制
          </Button>
          <Button
            variant="outline"
            size="sm"
            class="gap-2"
            @click="$emit('delete', id)"
          >
            <LucideTrash />
            删除
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import MarkdownRender from "@/modules/shared/components/MarkdownRender.vue";
import { useToast } from "@/modules/ui/components/toast/use-toast";

const props = defineProps<{
  id: string;
  content: string;
  created_at: string;
}>();

const emit = defineEmits<{
  delete: [id: string];
}>();

const contentRef = ref<HTMLElement | null>(null);
const expanded = ref(false);
const shouldShowExpand = ref(false);
const { toast } = useToast();
// 检查内容高度的函数
const checkContentHeight = () => {
  nextTick(() => {
    if (contentRef.value) {
      shouldShowExpand.value = contentRef.value.scrollHeight > 320;
    }
  });
};

// 监听内容变化
watchEffect(checkContentHeight);

// 组件挂载时也检查一次
onMounted(checkContentHeight);

async function copyContent() {
  try {
    await navigator.clipboard.writeText(props.content);
    toast({
      title: "复制成功",
      description: "内容已复制",
      duration: 2000,
    });
  } catch (error) {
    toast({
      title: "复制失败",
      description: "无法复制内容",
      variant: "destructive",
      duration: 2000,
    });
  }
}
</script>
