<template>
  <div
    :class="[
      layout === 'horizontal'
        ? 'grid grid-cols-4 items-center gap-4'
        : 'flex flex-col gap-2',
    ]"
  >
    <Label
      :for="input.variable"
      :class="[layout === 'horizontal' ? 'text-right' : 'text-left mt-2 mb-1']"
    >
      {{ input.label }}
    </Label>
    <div :class="[layout === 'horizontal' ? 'col-span-3' : 'w-full']">
      <DifyFileUpload :input="input" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { type FileListInput } from "@/modules/ai/types/dify.type";

defineProps<{
  input: FileListInput;
  layout?: "horizontal" | "vertical";
}>();
</script>
