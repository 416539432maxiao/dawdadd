<template>
  <section class="mt-10">
    <div class="flex justify-center">
      <span class="inline-flex space-x-6">
        <span
          class="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/10"
          >版本更新</span
        >
        <NuxtLink
          to="/changelog"
          class="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-muted-foreground"
        >
          <span>beta-0.1.0上线</span>
          <ChevronRight
            class="h-5 w-5 text-muted-foreground"
            aria-hidden="true"
          />
        </NuxtLink>
      </span>
    </div>
    <h1
      class="mt-10 text-5xl font-semibold text-foreground text-center lg:text-6xl !leading-tight"
    >
      让Vue开发者用一天时间<br />上线<span
        class="gradient-text ml-1 text-primary"
        >AI+Dify应用</span
      >
    </h1>
    <p class="mt-6 text-base leading-8 text-muted-foreground text-center">
      这是NuxtBase的Demo：基于Nuxt + Supabase的全栈脚手架
      <br />集成登录+支付+文档+AI + Dify，让Vue开发者能够快速上线你的AI + Dify应用！
    </p>
    <div class="mt-10 flex justify-center items-center gap-x-4">
      <Button class="text-sm px-8 py-6" @click="onStartClick">
        立即开始 <ArrowRight class="w-5 h-5 ml-2" />
      </Button>
      <Button
        variant="outline"
        class="text-sm px-8 py-6 text-foreground"
        @click="onReadDocClick"
      >
        查看文档
      </Button>
    </div>
    <MarketingLLMBrands :gray="true" />
  </section>
</template>

<script setup>
import { ChevronRight, ArrowRight } from "lucide-vue-next";

const { user } = useUser();

const router = useRouter();
const { public: runtimeConfig } = useRuntimeConfig();

const onStartClick = () => {
  if (user.value) {
    router.push("/dashboard");
  } else {
    router.push("/auth/signin");
  }
};

const onReadDocClick = () => {
  router.push("/docs/guide/intro");
};
</script>
