<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/modules/ui/lib/utils'

interface SkeletonProps {
  class?: HTMLAttributes['class']
}

const props = defineProps<SkeletonProps>()
</script>

<template>
  <div :class="cn('animate-pulse rounded-md bg-muted', props.class)" />
</template>
