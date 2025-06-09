<script setup lang="ts">
const { user } = useUser();

interface Props {
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "sm":
      return "size-8";
    case "lg":
      return "size-16";
    default:
      return "size-10";
  }
});

const avatarUrl = computed(() => user.value?.user_metadata?.avatar_url);
</script>
<template>
  <Avatar
    :class="`${sizeClasses} bg-primary/10 ring-2 ring-primary rounded-full`"
  >
    <AvatarImage v-if="avatarUrl" :src="avatarUrl" class="rounded-full " />
    <AvatarFallback>
      <LucideUser />
    </AvatarFallback>
  </Avatar>
</template>