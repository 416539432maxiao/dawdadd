<template>
  <Card>
    <CardContent class="flex flex-col justify-center min-h-[400px] p-6">
      <!-- Empty State -->
      <div
        v-if="!completionSavedList.length"
        class="h-full flex items-center justify-center text-sm"
      >
        <div class="text-center text-gray-500">
          <div class="mb-4">
            <LucideBookmark size="48" class="mx-auto" />
          </div>
          <p>开始生成内容，您可以在这里找到保存的结果</p>
          <Button class="mt-4" variant="outline" @click="handleSwitchToRun">
            开始生成内容
          </Button>
        </div>
      </div>

      <!-- Content List -->
      <div v-else class="space-y-4">
        <CompletionSavedContent
          v-for="item in completionSavedList"
          :key="item.id"
          :id="item.id"
          :content="item.content"
          :created_at="item.created_at"
          @delete="handleDelete"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";

const emit = defineEmits(["switchToRun"]);
const difyChatStore = useDifyChatStore();
const { completionSavedList } = storeToRefs(difyChatStore);

const handleSwitchToRun = () => {
  emit("switchToRun");
};

const handleDelete = async (id: string) => {
  await difyChatStore.deleteCompletionSaved(id);
};
</script>
