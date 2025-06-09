<template>
  <div :class="[
    layout === 'horizontal' ? 'grid grid-cols-4 gap-4' : 'flex flex-col gap-2'
  ]">
    <Label
      :class="[
        layout === 'horizontal' ? 'text-right py-3' : 'text-left mt-2 mb-1'
      ]"
    >
      {{ input.label }}
    </Label>
    <Input
      :id="input.variable"
      :placeholder="input.label"
      v-model="data"
      :class="[
        layout === 'horizontal' ? 'col-span-3' : 'w-full'
      ]"
    />
  </div>
</template>

<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";

const props = defineProps<{
  input: {
    label: string;
    max_length?: number;
    required: boolean;
    type: "text-input";
    variable: string;
  };
  layout?: "horizontal" | "vertical";
}>();

const difyChatStore = useDifyChatStore();
const { userInputs } = storeToRefs(difyChatStore);

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
