<script setup lang="ts">
definePageMeta({
  layout: "marketing",
  static: true,
});

useHead({
  title: "价格",
});
</script>

<template>
  <div class="container py-32">
    <div class="flex flex-col items-center justify-center gap-4 text-center">
      <h1 class="text-4xl font-bold text-foreground">价格与方案</h1>
      <p class="text-sm text-muted-foreground">
        NuxtBase支持多种支付方式，当前展示默认为ZPAY<br />你可以在配置项中更改支付方式为ZPAY/易支付/Stripe，LemonSqueezy和Paddle正在申请中👨‍💻‍..
      </p>
    </div>

    <div class="mt-16 max-w-4xl m-auto">
      <h2 class="text-2xl font-bold text-center text-foreground">订阅制</h2>
      <PriceTable />
    </div>

    <div class="mt-24 max-w-4xl m-auto">
      <h2 class="text-2xl font-bold text-center mb-8 text-foreground">
        一次性购买
      </h2>
      <PriceItem />
    </div>
  </div>
</template>
