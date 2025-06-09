<script setup lang="ts">
import { ONE_TIME_PRODUCTS } from "@/config/products";
import type { Product } from "@/modules/billing/types/product.type";
const items = ONE_TIME_PRODUCTS;
const checkout = useCheckout();
const loading = ref<string>("");

const onPurchase = async (item: Product) => {
  loading.value = item.name;
  try {
    const { id, price, stripe_price_id } = item;
    await checkout.createCheckout({
      id,
      price,
      priceId: stripe_price_id,
    });
  } finally {
    setTimeout(() => {
      loading.value = "";
    }, 200);
  }
};
</script>

<template>
  <div class="w-full mx-auto">
    <div class="grid gap-6">
      <div
        v-for="item in items"
        :key="item.name"
        class="bg-background rounded-lg border border-border p-8 dark:bg-zinc-900"
      >
        <div class="flex flex-col md:flex-row lg:items-center justify-between">
          <div class="w-full md:w-3/5 p-4">
            <div class="text-left mb-8">
              <h2 class="text-xl font-bold mb-2 text-foreground">
                {{ item.name }}
              </h2>
              <p class="text-muted-foreground text-sm">
                一次性获取NuxtBase，节省你数周的时间上线你的AI项目
              </p>

              <div class="flex flex-col mt-8">
                <div class="flex items-start gap-4">
                  <LucideZap class="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 class="font-medium text-foreground">基础组件</h3>
                    <p class="text-sm text-muted-foreground">
                      提供丰富的UI组件和区块，快速构建你的网站
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4 mt-6">
                  <LucideUsers class="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 class="font-medium text-foreground">Auth管理</h3>
                    <p class="text-sm text-muted-foreground">
                      基于Supabase管理你的Auth，支持多种16+鉴权方式
                    </p>
                  </div>
                </div>

                <div class="flex items-start gap-4 mt-6">
                  <LucideBarChart2 class="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 class="font-medium text-foreground">数据存储</h3>
                    <p class="text-sm text-muted-foreground">
                      基于Supabase管理你的数据存储，包括PostgreSQL和Storage
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="w-full md:w-2/5 mt-6 lg:mt-0 lg:ml-8 flex flex-col">
            <div class="flex justify-between items-center mb-6">
              <div class="text-base font-bold text-foreground">
                <div>一次性付款</div>
                <p class="text-sm text-muted-foreground">永久使用</p>
              </div>
              <div
                class="text-5xl font-bold flex items-baseline text-foreground"
              >
                <span class="text-lg mr-1">{{ item.price_symbol }}</span>
                {{ item.price }}
              </div>
            </div>
            <Button class="w-full" @click="onPurchase(item)" :disabled="loading === item.name">
              <LucideLoaderCircle class="animate-spin" v-if="loading === item.name" />
              立即购买
            </Button>
            <div class="mt-6">
              <div class="text-sm font-medium mb-4 text-foreground">
                立刻获取以下所有功能
              </div>
              <ul class="grid grid-cols-2 gap-3">
                <li
                  v-for="feature in item.features"
                  :key="feature"
                  class="flex items-center"
                >
                  <LucideCheck class="w-4 h-4 text-primary mr-2" />
                  <span class="text-sm text-muted-foreground">{{
                    feature
                  }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
