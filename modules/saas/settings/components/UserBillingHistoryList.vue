<script setup lang="ts">
import { DB_TABLES } from "~/config/db/tables";
import type { PaymentHistory } from "@/modules/billing/types/payment.type";
import { format } from "date-fns";

const client = useSupabaseClient();
const loading = ref(true);
const billingHistory = ref<PaymentHistory[]>([]);

const loadBillingHistory = async () => {
  loading.value = true;
  try {
    const { data, error } = await client
      .from(DB_TABLES.PAYMENT_HISTORY)
      .select("id, product_name, amount, currency, status, created_at")
      .order("created_at", { ascending: false })
      .returns<PaymentHistory[]>();

    if (error) {
      console.error("Error fetching billing history:", error);
      return;
    }

    billingHistory.value = data || [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBillingHistory();
});
</script>
<template>
  <div class="space-y-2 rounded-lg border p-4">
    <Label class="text-foreground dark:text-foreground">账单历史</Label>

    <!-- Loading Skeleton -->
    <div v-if="loading">
      <!-- 移动端骨架屏 -->
      <div class="block md:hidden space-y-4">
        <div v-for="i in 3" :key="i" class="border rounded-lg p-4 space-y-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="h-4 w-16" />
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-12" />
        </div>
      </div>

      <!-- 桌面端骨架屏 -->
      <Table class="hidden md:table text-foreground">
        <TableHeader>
          <TableRow>
            <TableHead>商品</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="i in 3" :key="i">
            <TableCell><Skeleton class="h-4 w-24" /></TableCell>
            <TableCell><Skeleton class="h-4 w-16" /></TableCell>
            <TableCell><Skeleton class="h-4 w-20" /></TableCell>
            <TableCell><Skeleton class="h-4 w-12" /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div
      v-else-if="!billingHistory.length"
      class="text-sm text-muted-foreground dark:text-muted-foreground"
    >
      暂无账单记录
    </div>

    <div v-else>
      <!-- 移动端列表视图 -->
      <div class="block md:hidden space-y-4">
        <div
          v-for="record in billingHistory"
          :key="record.id"
          class="border rounded-lg p-4"
        >
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium">{{ record.product_name }}</span>
            <Badge
              :variant="record.status === 'success' ? 'default' : 'outline'"
            >
              {{ record.status }}
            </Badge>
          </div>
          <div class="space-y-1 text-sm text-muted-foreground">
            <div class="flex justify-between">
              <span>金额:</span>
              <span>{{ record.currency }} {{ record.amount }}</span>
            </div>
            <div class="flex justify-between">
              <span>日期:</span>
              <span>{{
                format(new Date(record.created_at as Date), "yyyy-MM-dd")
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 桌面端表格视图 -->
      <Table class="hidden md:table text-foreground">
        <TableHeader>
          <TableRow>
            <TableHead>商品</TableHead>
            <TableHead>金额</TableHead>
            <TableHead>日期</TableHead>
            <TableHead>状态</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="record in billingHistory" :key="record.id">
            <TableCell>{{ record.product_name }}</TableCell>
            <TableCell>{{ record.currency }} {{ record.amount }}</TableCell>
            <TableCell>{{
              format(new Date(record.created_at as Date), "yyyy-MM-dd HH:mm")
            }}</TableCell>
            <TableCell>
              <Badge
                :variant="record.status === 'success' ? 'default' : 'outline'"
              >
                {{ record.status }}
              </Badge>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
