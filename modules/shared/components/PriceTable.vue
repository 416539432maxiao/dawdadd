<script setup lang="ts">
import { Check } from "lucide-vue-next";
import {
  MONTHLY_SUBSCRIPTION_PRODUCTS,
  YEARLY_SUBSCRIPTION_PRODUCTS,
} from "@/config/products";

interface Plan {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlight?: boolean;
  price_symbol?: string;
}

const interval = ref<"monthly" | "yearly">("monthly");
const loading = ref<string>("");

const plans = computed<Plan[]>(() => {
  const products =
    interval.value === "monthly"
      ? MONTHLY_SUBSCRIPTION_PRODUCTS
      : YEARLY_SUBSCRIPTION_PRODUCTS;

  return products.map((product, index) => ({
    name: product.name,
    price: product.price,
    price_symbol: product.price_symbol || "¥",
    description: product.description,
    features: product.features,
    highlight: index === 1,
    interval_unit: product.interval_unit,
  }));
});

const checkout = useCheckout();

const onSubscribe = async (plan: Plan) => {
  loading.value = plan.name;

  try {
    const product =
      interval.value === "monthly"
        ? MONTHLY_SUBSCRIPTION_PRODUCTS.find((p) => p.name === plan.name)
        : YEARLY_SUBSCRIPTION_PRODUCTS.find((p) => p.name === plan.name);

    if (product) {
      await checkout.createCheckout({
        id: product.id,
        price: product.price,
        priceId: product.stripe_price_id,
      });
    }
  } finally {
    setTimeout(() => {
      loading.value = "";
    }, 200);
  }
};
</script>

<template>
    <section>
      <div class="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div class="flex justify-center mt-6">
          <Tabs v-model="interval" :default-value="interval" class="w-[400px]">
            <TabsList class="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">月付</TabsTrigger>
              <TabsTrigger value="yearly">年付</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div
          class="grid max-w-md grid-cols-1 gap-6 mx-auto mt-6 lg:max-w-full lg:mt-12 lg:grid-cols-3"
        >
          <div
            v-for="plan in plans"
            :key="plan.name"
            :class="[
              'overflow-hidden rounded-lg border p-6 xl:px-8 dark:bg-zinc-900 dark:border-gray-700',
              plan.highlight
                ? 'shadow-lg border-primary dark:border-primary/70'
                : '',
            ]"
          >
            <div>
              <h3
                class="text-sm font-semibold text-primary dark:text-primary/90"
              >
                {{ plan.name }}
              </h3>
              <p class="text-4xl font-bold mt-5 dark:text-white">
                {{ plan.price_symbol }}{{ plan.price }}
                <span class="text-base">/ {{ plan.interval_unit }}</span>
              </p>
              <p class="mt-2 text-sm text-muted-foreground dark:text-gray-400">
                {{ plan.description }}
              </p>

              <ul class="space-y-4 mt-6">
                <li
                  v-for="feature in plan.features"
                  :key="feature"
                  class="flex items-center gap-2"
                >
                  <Check class="h-4 w-4 text-primary dark:text-primary/90" />
                  <span class="text-sm font-medium dark:text-gray-300">{{
                    feature
                  }}</span>
                </li>
              </ul>

              <Button
                :class="[
                  'w-full mt-8',
                  plan.highlight
                    ? 'bg-gradient-to-r from-primary to-primary/80 dark:from-primary/90 dark:to-primary/70'
                    : 'dark:bg-primary/90 dark:hover:bg-primary/80',
                ]"
                :disabled="loading === plan.name"
                @click="onSubscribe(plan)"
              >
                <LucideLoaderCircle
                  class="animate-spin"
                  v-if="loading === plan.name"
                />
                立即订阅
              </Button>
              <p
                class="mt-3 text-xs text-muted-foreground dark:text-gray-400 text-center"
              >
                7天退款保证
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
</template>
