<script setup lang="ts">
import api from "@/config/api";
import { z } from "zod";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import type { SignInBody } from "@/modules/saas/auth/types";

const props = defineProps<{
  mode: "signin" | "signup";
}>();

type EmailFormValues = {
  email: string;
  password: string;
};

type PhoneFormValues = {
  phone: string;
  code: string;
};

type FormValues = EmailFormValues | PhoneFormValues;

const signMode = ref<"email" | "phone">("email");
const isLoading = ref(false);
const isCodeLoading = ref(false);

const emailSchema = z.object({
  root: z.string().optional(),
  email: z.string().email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6位"),
});

const phoneSchema = z.object({
  root: z.string().optional(),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入有效的手机号"),
  code: z.string().length(6, "验证码为6位数字"),
});

const form = useForm<FormValues & { root?: string }>({
  validationSchema: computed(() =>
    toTypedSchema(signMode.value === "email" ? emailSchema : phoneSchema)
  ),
  validateOnMount: false,
});

const { signIn, signUp, sendPhoneCode } = useUser();
const { handleApiError } = useApiFormErrors(form);

watch(signMode, () => {
  form.resetForm({
    values:
      signMode.value === "email"
        ? { email: "", password: "" }
        : { phone: "", code: "" },
  });
});

const { handleSubmit, errors } = form;

const countdown = ref(0);
const startCountdown = async () => {
  try {
    isCodeLoading.value = true;
    if (signMode.value === "phone" && "phone" in form.values) {
      const { phone } = form.values;
      await sendPhoneCode(phone);
      countdown.value = 60;
      const timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
        }
      }, 1000);
    }
  } finally {
    isCodeLoading.value = false;
  }
};

const onProviderSign = async (provider: string) => {
  try {
    const { url } = await $fetch<{ url: string }>(api.oauth, {
      method: "POST",
      body: { provider },
    });
    window.location.href = url;
  } catch (error) {
    console.error("第三方登录失败:", error);
  }
};

const onSubmit = handleSubmit(async (values) => {
  try {
    isLoading.value = true;

    if (props.mode === "signin") {
      const body: SignInBody =
        signMode.value === "email"
          ? {
              type: "email",
              email: (values as EmailFormValues).email,
              password: (values as EmailFormValues).password,
            }
          : {
              type: "phone",
              phone: (values as PhoneFormValues).phone,
              code: (values as PhoneFormValues).code,
            };

      await signIn(body);
    } else {
      const body: SignInBody =
        signMode.value === "email"
          ? {
              type: "email",
              email: (values as EmailFormValues).email,
              password: (values as EmailFormValues).password,
            }
          : {
              type: "phone",
              phone: (values as PhoneFormValues).phone,
              code: (values as PhoneFormValues).code,
            };

      await signUp(body);
    }
  } catch (error: unknown) {
    handleApiError(error);
  } finally {
    isLoading.value = false;
  }
});
</script>
<template>
  <Card class="w-full">
    <CardHeader>
      <CardTitle class="text-2xl font-bold text-center">{{
        mode === "signin" ? "登录" : "新用户注册"
      }}</CardTitle>
    </CardHeader>

    <CardContent>
      <form @submit.prevent="onSubmit" class="space-y-4">
        <SaasSignModeSwitch v-model="signMode" :mode="props.mode" />

        <Alert v-if="errors.root" variant="destructive">
          <div class="flex items-center">
            <LucideAlertTriangle class="size-4 mr-2" />
            <AlertDescription>{{ errors.root }}</AlertDescription>
          </div>
        </Alert>

        <div v-if="signMode === 'email'" class="space-y-4">
          <FormField name="email" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>邮箱</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="email"
                  placeholder="请输入邮箱"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="password" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>密码</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="password"
                  placeholder="请输入密码"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>
        </div>

        <div v-else class="space-y-4">
          <FormField name="phone" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>手机号</FormLabel>
              <FormControl>
                <Input
                  v-bind="componentField"
                  type="tel"
                  placeholder="请输入手机号"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          </FormField>

          <FormField name="code" v-slot="{ componentField }">
            <FormItem>
              <FormLabel>验证码</FormLabel>
              <div class="flex gap-2">
                <FormControl>
                  <Input
                    v-bind="componentField"
                    type="text"
                    placeholder="请输入验证码"
                    class="flex-1"
                  />
                </FormControl>
                <!-- 如果要开启短信服务，请移除掉下面的:disabled="true" -->
                <Button
                  type="button"
                  variant="outline"
                  :disabled="countdown > 0 || isCodeLoading || true"
                  @click="startCountdown"
                  :loading="isCodeLoading"
                >
                  <template v-if="isCodeLoading"> 发送中 </template>
                  <template v-else>
                    {{ countdown > 0 ? `${countdown}s` : "获取验证码" }}
                  </template>
                </Button>
              </div>
              <FormMessage />
              <FormDescription class="text-xs flex justify-end">
                说明：短信登录功能完备，只是因短信服务收费不提供演示
              </FormDescription>
            </FormItem>
          </FormField>
        </div>

        <div>
          <Button
            type="submit"
            class="w-full mt-4"
            :disabled="isLoading"
            :loading="isLoading"
          >
            {{
              isLoading
                ? mode === "signin"
                  ? "登录中..."
                  : "注册中..."
                : mode === "signin"
                ? "登录"
                : "注册"
            }}
          </Button>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">或者</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          class="w-full"
          @click="onProviderSign('github')"
        >
          <LucideGithub class="h-4 w-4" />Github 账号{{
            mode === "signin" ? "登录" : "注册"
          }}
        </Button>

        <Button
          type="button"
          variant="outline"
          class="w-full"
          @click="onProviderSign('google')"
        >
          <img src="/images/google.svg" alt="google" class="h-4 w-4" />Google
          账号{{ mode === "signin" ? "登录" : "注册" }}
        </Button>

        <div class="text-center text-sm mt-4">
          {{ mode === "signin" ? "还没有账号？" : "已有账号？" }}
          <NuxtLink
            :to="mode === 'signin' ? '/auth/signup' : '/auth/signin'"
            class="text-primary hover:underline"
          >
            {{ mode === "signin" ? "立即注册" : "立即登录" }}
          </NuxtLink>
        </div>
      </form>
    </CardContent>
  </Card>
</template>
