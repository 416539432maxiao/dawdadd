<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";
import DifyForm from "./types/DifyForm.vue";

const difyChatStore = useDifyChatStore();
const { currentApp, isUploading, showUserInputFormCancelBtn } =
  storeToRefs(difyChatStore);
const { startConversationByInputs } = difyChatStore;

const handleCancelClick = () => {
  difyChatStore.showUserInputForm = false;
};
</script>

<template>
  <div class="h-full flex flex-col justify-center">
    <Card class="w-full max-w-[600px] mx-auto">
      <CardHeader class="bg-primary/10 rounded-t-lg">
        <div class="text-xl flex items-center">
          {{ currentApp?.icon }}
          {{ currentApp?.name }}
        </div>
      </CardHeader>
      <CardContent class="pt-8">
        <DifyForm />
      </CardContent>
      <CardFooter class="flex justify-end">
        <Button
          v-if="showUserInputFormCancelBtn"
          variant="outline"
          @click="handleCancelClick"
          class="mr-2"
          >取消</Button
        >
        <Button @click="startConversationByInputs" :disabled="isUploading">
          开始对话
        </Button>
      </CardFooter>
    </Card>
  </div>
</template>
