<script setup lang="ts">
type ActiveMode = "email" | "phone";

const props = defineProps<{
  modelValue: ActiveMode;
  mode: "signin" | "signup";
}>();

const emit = defineEmits<{
  "update:modelValue": [value: ActiveMode];
}>();

const modes: {
  value: ActiveMode;
  label: string;
}[] = [
  {
    value: "email",
    label: props.mode === "signin" ? "邮箱登录" : "邮箱注册",
  },
  {
    value: "phone",
    label: props.mode === "signin" ? "手机号登录" : "手机号注册",
  },
];
</script>

<template>
  <Tabs
    :modelValue="props.modelValue"
    @update:modelValue="emit('update:modelValue', $event as ActiveMode)"
  >
    <TabsList class="w-full">
      <TabsTrigger
        v-for="mode of modes"
        :key="mode.value"
        :value="mode.value"
        class="flex-1"
      >
        {{ mode.label }}
      </TabsTrigger>
    </TabsList>
  </Tabs>
</template>
