<template>
  <nav class="w-full" v-if="meta">
    <div class="space-y-4">
      <div class="mb-2" v-for="(section, key) in sortedNavigation" :key="key">
        <h3 class="font-medium text-sm mb-2 text-muted-foreground">
          {{ section.title }}
        </h3>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="block w-full px-3 py-1.5 text-sm transition-colors rounded-md"
            :class="{
              'text-primary  font-medium': route.path === item.to,
              'text-muted-foreground hover:text-foreground ':
                route.path !== item.to,
            }"
          >
            {{ item.title }}
          </NuxtLink>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const route = useRoute();

const props = defineProps<{
  meta: any;
}>();

const sortedNavigation = computed(() => {
  if (!props.meta) return {};

  // 自动获取所有section数据
  const sections = Object.entries(props.meta).reduce((acc, [key, value]) => {
    if (typeof value === "object" && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(sections)
    .sort(([, a], [, b]) => (a?.position || 0) - (b?.position || 0))
    .reduce((acc, [key, section]) => {
      if (section) {
        acc[key] = {
          ...section,
          items: section.items || [],
        };
      }
      return acc;
    }, {} as Record<string, any>);
});
</script>
