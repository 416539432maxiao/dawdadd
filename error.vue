<template>
  <div
    class="flex h-screen flex-col items-center justify-center gap-6 px-4 bg-background"
  >
    <!-- 错误代码 -->
    <div class="space-y-2 text-center">
      <h1
        class="text-8xl font-bold tracking-tighter text-primary dark:text-primary"
      >
        {{ error.statusCode }}
      </h1>
      <h2
        class="text-2xl font-semibold tracking-tight text-foreground dark:text-foreground"
      >
        {{
          error.statusCode === 404
            ? "页面不存在"
            : error.statusCode === 500
            ? "服务器内部错误"
            : error.statusCode === 403
            ? "无权访问"
            : error.statusCode === 401
            ? "未经授权"
            : "出错了"
        }}
      </h2>
      <p class="text-sm text-muted-foreground">
        {{ error.message }}
      </p>
    </div>

    <!-- 按钮组 -->
    <div class="flex gap-4">
      <Button
        variant="outline"
        @click="handleError"
        class="dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80"
      >
        <HomeIcon class="size-4" />
        返回首页
      </Button>
      <Button @click="handleBack">
        <CornerUpLeftIcon class="size-4" />
        返回上一页
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeIcon, CornerUpLeftIcon } from "lucide-vue-next";

const router = useRouter();

defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const handleError = () => {
  clearError();
  router.push("/");
};

const handleBack = () => {
  clearError();
  router.back();
};
</script>
