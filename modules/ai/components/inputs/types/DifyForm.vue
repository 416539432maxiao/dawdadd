<template>
  <div class="space-y-4">
    <div v-for="(input, index) in userInputForm" :key="index">
      <!-- Text Input -->
      <DifyTextInput
        v-if="input['text-input']"
        :input="input['text-input']"
        :layout="props.layout"
      />

      <!-- Paragraph -->
      <DifyParagraphInput
        v-if="input.paragraph"
        :input="input.paragraph"
        :layout="props.layout"
      />

      <!-- Select -->
      <DifySelectInput
        v-if="input.select"
        :input="input.select"
        :layout="props.layout"
      />

      <!-- Number -->
      <DifyNumberInput
        v-if="input.number"
        :input="input.number"
        :layout="props.layout"
      />

      <!-- Single File Upload -->
      <DifyFileInput
        v-if="input.file"
        :input="input.file"
        :layout="props.layout"
      />

      <!-- Multiple File Upload -->
      <DifyFileListInput
        v-if="input['file-list']"
        :input="input['file-list']"
        :layout="props.layout"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";

const props = defineProps({
  layout: {
    type: String as PropType<"horizontal" | "vertical">,
    default: "horizontal",
  },
});

const difyChatStore = useDifyChatStore();
const { userInputForm } = storeToRefs(difyChatStore);
</script>
