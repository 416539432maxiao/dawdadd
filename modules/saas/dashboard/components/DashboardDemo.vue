<script setup lang="ts">
const { user, loaded } = useUser();

const greeting = computed(() => {
  const hour = new Date().getHours();
  const name = user.value?.user_metadata?.full_name || "新用户";

  if (hour < 6) return `晚安，${name}`;
  if (hour < 12) return `早安，${name}`;
  if (hour < 18) return `下午好，${name}`;
  return `晚上好，${name}`;
});

onMounted(async () => {
  if (!user.value && loaded.value) {
    navigateTo("/auth/signin");
  }
});

const stats = [
  {
    name: "本月消耗Token",
    value: "48,442",
    change: "+12.1%",
    trend: "up",
    period: "最近30天",
  },
  {
    name: "API调用次数",
    value: "892",
    change: "-4.7%",
    trend: "down",
    period: "最近30天",
  },
  {
    name: "费用支出",
    value: "¥142.50",
    change: "+18.6%",
    trend: "up",
    period: "最近30天",
  },
];

const usageRecords = [
  {
    id: "98382",
    model: "Qwen-7B",
    tokens: 2500,
    cost: "¥0.25",
    timestamp: "2024-03-15 13:45",
    status: "成功",
  },
  {
    id: "42967",
    model: "ERNIE-4.0",
    tokens: 1800,
    cost: "¥0.18",
    timestamp: "2024-03-15 13:42",
    status: "成功",
  },
  {
    id: "57384",
    model: "SparkDesk-3.5",
    tokens: 3200,
    cost: "¥0.32",
    timestamp: "2024-03-15 13:38",
    status: "处理中",
  },
  {
    id: "12368",
    model: "Qwen-Max",
    tokens: 1200,
    cost: "¥0.24",
    timestamp: "2024-03-15 13:35",
    status: "失败",
  },
  {
    id: "24323",
    model: "ChatGLM-4",
    tokens: 900,
    cost: "¥0.09",
    timestamp: "2024-03-15 13:30",
    status: "成功",
  },
  {
    id: "68324",
    model: "Baichuan-53B",
    tokens: 2800,
    cost: "¥0.28",
    timestamp: "2024-03-15 13:25",
    status: "成功",
  },
];
</script>

<template>
  <div class="container py-8">
    <div class="flex flex-col gap-8">
      <div>
        <h1 class="text-2xl font-bold text-foreground">{{ greeting }}</h1>
        <p class="text-sm text-muted-foreground mt-2">
          欢迎使用我们的AI服务，以下是您的使用情况和相关数据（Demo）
        </p>
      </div>

      <div class="grid gap-4 md:grid-cols-3">
        <Card v-for="stat in stats" :key="stat.name">
          <CardHeader
            class="flex flex-row items-center justify-between space-y-0 pb-2"
          >
            <CardTitle class="text-sm font-medium">{{ stat.name }}</CardTitle>
            <LucideTrendingUp
              v-if="stat.trend === 'up'"
              class="h-4 w-4 text-green-500"
            />
            <LucideTrendingDown v-else class="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stat.value }}</div>
            <p class="text-xs text-muted-foreground pt-2">
              {{ stat.period }} {{ stat.change }}
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="grid gap-4 mb-10 w-full">
        <Card>
          <CardHeader>
            <CardTitle>最近调用记录</CardTitle>
            <CardDescription
              >今日共有 {{ usageRecords.length }} 条调用记录</CardDescription
            >
          </CardHeader>
          <CardContent>
            <!-- 移动端列表视图 -->
            <div class="block md:hidden space-y-4">
              <div
                v-for="record in usageRecords"
                :key="record.id"
                class="border rounded-lg p-4"
              >
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">{{ record.model }}</span>
                  <Badge
                    :variant="
                      record.status === '失败'
                        ? 'destructive'
                        : record.status === '处理中'
                        ? 'secondary'
                        : 'default'
                    "
                  >
                    {{ record.status }}
                  </Badge>
                </div>
                <div class="space-y-1 text-sm text-muted-foreground">
                  <div class="flex justify-between">
                    <span>Token数:</span>
                    <span>{{ record.tokens }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>费用:</span>
                    <span>{{ record.cost }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>时间:</span>
                    <span>{{ record.timestamp }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 桌面端表格视图 -->
            <div class="hidden md:block overflow-x-auto">
              <div class="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead class="w-[100px]">记录ID</TableHead>
                      <TableHead class="w-[140px]">模型</TableHead>
                      <TableHead class="w-[100px] text-right"
                        >Token数</TableHead
                      >
                      <TableHead class="w-[80px] text-right">费用</TableHead>
                      <TableHead class="w-[160px]">时间</TableHead>
                      <TableHead class="w-[100px]">状态</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow v-for="record in usageRecords" :key="record.id">
                      <TableCell class="font-mono">{{ record.id }}</TableCell>
                      <TableCell>{{ record.model }}</TableCell>
                      <TableCell class="text-right">{{
                        record.tokens
                      }}</TableCell>
                      <TableCell class="text-right">{{
                        record.cost
                      }}</TableCell>
                      <TableCell>{{ record.timestamp }}</TableCell>
                      <TableCell>
                        <Badge
                          :variant="
                            record.status === '失败'
                              ? 'destructive'
                              : record.status === '处理中'
                              ? 'secondary'
                              : 'default'
                          "
                        >
                          {{ record.status }}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
