<script setup lang="ts">
import { Link } from "lucide-vue-next";

interface Props {
  title: string;
  description: string;
  date: string;
  author: string;
  image?: string;
  href: string;
}

const props = defineProps<Props>();

// 使用计算属性来决定是显示图片还是默认背景
const hasImage = computed(() => !!props.image);
</script>

<template>
  <NuxtLink :to="href" class="block">
    <Card class="group overflow-hidden">
      <div class="aspect-video overflow-hidden">
        <img
          v-if="hasImage"
          :src="image"
          :alt="title"
          class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div
          v-else
          class="h-full w-full bg-gradient-to-r from-gray-200 to-slate-200 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <CardHeader>
        <CardTitle>
          <div class="inline-flex items-center gap-2">
            {{ title }}
            <Link class="h-4 w-4" />
          </div>
        </CardTitle>
        <div class="flex items-center gap-4 text-sm text-muted-foreground">
          <time>{{ date }}</time>
          <span>{{ author }}</span>
        </div>
      </CardHeader>

      <CardContent>
        <p class="line-clamp-3 text-sm text-muted-foreground">
          {{ description }}
        </p>
      </CardContent>
    </Card>
  </NuxtLink>
</template>
