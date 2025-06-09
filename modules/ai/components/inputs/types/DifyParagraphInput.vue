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
    <Textarea
      :id="input.variable"
      :placeholder="input.label"
      v-model="data"
      :rows="10"
      :class="[layout === 'horizontal' ? 'col-span-3' : 'w-full']"
    />
  </div>
</template>

<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";

const difyChatStore = useDifyChatStore();
const { userInputs } = storeToRefs(difyChatStore);

const props = defineProps<{
  input: {
    variable: string;
    label: string;
    required: boolean;
    default?: string;
    type: "paragraph";
  };
  layout?: "horizontal" | "vertical";
}>();

const data = computed({
  get() {
    return userInputs.value[props.input.variable];
  },
  set(value: string) {
    difyChatStore.$patch((state) => {
      state.userInputs[props.input.variable] = value;
    });
  },
});
</script>
