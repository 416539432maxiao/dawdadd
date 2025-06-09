<script setup lang="ts">
defineEmits<{
  (e: "edit"): void;
}>();
</script>

<template>
  <Card class="mb-4 w-full">
    <CardContent class="p-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground"
            >开始前，您可以修改对话设置</span
          >
        </div>
        <Button variant="ghost" size="icon" @click="$emit('edit')">
          <LucidePencil class="h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
