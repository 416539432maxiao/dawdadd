<template>
  <div :class="[
    layout === 'horizontal' ? 'grid grid-cols-4 items-center gap-4' : 'flex flex-col gap-2'
  ]">
    <Label
      :for="input.variable"
      :class="[
        layout === 'horizontal' ? 'text-right' : 'text-left mt-2 mb-1'
      ]"
    >
      {{ input.label }}
    </Label>
    <Select
      :id="input.variable"
      v-model="data"
      :class="[
        layout === 'horizontal' ? 'col-span-3' : 'w-full'
      ]"
    >
      <SelectTrigger>
        <SelectValue :placeholder="input.label" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in input.options"
          :key="option"
          :value="option"
        >
          {{ option }}
        </SelectItem>
      </SelectContent>
    </Select>
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
    options: string[];
    default?: string;
    type: "select";
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
