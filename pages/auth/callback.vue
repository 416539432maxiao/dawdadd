<script setup lang="ts">
definePageMeta({
  layout: "saas-auth",
  static: true,
});

useHead({
  title: "验证邮箱",
});

// 使用 useUser 中的 handleEmailVerification 方法处理邮箱验证
const { handleEmailVerification, user } = useUser();
const isHandling = ref(true);
const success = ref(false);
const alreadyVerified = ref(false);

// 在挂载时处理验证
onMounted(async () => {
  // 如果用户已登录且邮箱已验证，直接设置为已验证状态
  if (user.value?.email_confirmed_at) {
    alreadyVerified.value = true;
    success.value = true;
    isHandling.value = false;
    return;
  }
  
  const result = await handleEmailVerification();
  success.value = result;
  isHandling.value = false;
});
</script>

<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="text-2xl font-bold text-center">邮箱验证</CardTitle>
    </CardHeader>

    <CardContent class="flex flex-col items-center justify-center p-6">
      <div v-if="isHandling" class="text-center">
        <div class="flex justify-center mb-4">
          <LucideLoader2 class="h-10 w-10 animate-spin text-primary" />
        </div>
        <p>正在验证您的邮箱，请稍候...</p>
      </div>

      <div v-else-if="success && alreadyVerified" class="text-center">
        <div class="flex justify-center mb-4">
          <LucideCheckCircle class="h-16 w-16 text-success" />
        </div>
        <h3 class="text-lg font-medium">您的邮箱已经验证过</h3>
        <p class="mt-2 mb-4">无需重复验证，正在为您跳转到仪表板...</p>
      </div>

      <div v-else-if="success" class="text-center">
        <div class="flex justify-center mb-4">
          <LucideCheckCircle class="h-16 w-16 text-success" />
        </div>
        <h3 class="text-lg font-medium">验证成功！</h3>
        <p class="mt-2 mb-4">您的账号已激活，正在为您跳转...</p>
      </div>

      <div v-else class="text-center">
        <div class="flex justify-center mb-4">
          <LucideXCircle class="h-16 w-16 text-destructive" />
        </div>
        <h3 class="text-lg font-medium">验证失败</h3>
        <p class="mt-2 mb-4">邮箱验证链接可能已过期或无效</p>
        <div class="flex gap-4 mt-4 justify-center">
          <Button as-child variant="outline">
            <NuxtLink to="/auth/signin">去登录</NuxtLink>
          </Button>
          <Button as-child>
            <NuxtLink to="/auth/signup">重新注册</NuxtLink>
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template> 