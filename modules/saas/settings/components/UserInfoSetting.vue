<script setup lang="ts">
import { useToast } from "@/modules/ui/components/toast/use-toast";

const { user, loadUser } = useUser();
const { toast } = useToast();
const supabase = useSupabaseClient();

const provider = computed(() => user.value?.app_metadata?.provider || "email");
const isEmailProvider = computed(() => provider.value === "email");
const isPhoneProvider = computed(() => provider.value === "phone");
const isGithubProvider = computed(() => provider.value === "github");
const isGoogleProvider = computed(() => provider.value === "google");
const isOAuthProvider = computed(
  () => !isEmailProvider.value && !isPhoneProvider.value
);

const userInfo = computed(() => ({
  avatar_url: user.value?.user_metadata?.avatar_url,
  full_name: user.value?.user_metadata?.full_name,
  email: user.value?.email,
  phone: user.value?.phone,
}));

const avatarFile = ref<File | null>(null);
const isUploading = ref(false);
const isSaving = ref(false);

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.length) {
    avatarFile.value = input.files[0];
    uploadAvatar();
  }
};

const uploadAvatar = async () => {
  if (!avatarFile.value) return;
  isUploading.value = true;

  try {
    const file = avatarFile.value;
    const fileExt = file.name.split(".").pop();
    const uid = user.value?.id;
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${uid}/${fileName}`;

    // Upload image to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filePath);

    // Update user metadata
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) throw updateError;

    userInfo.value.avatar_url = publicUrl;

    toast({
      title: "头像更新成功",
      duration: 2000,
    });

    await loadUser();
  } catch (error) {
    console.error(error);
    toast({
      title: "头像更新失败",
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isUploading.value = false;
  }
};

const updateProfile = async () => {
  isSaving.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: userInfo.value.full_name,
      },
    });

    if (error) throw error;

    toast({
      title: "个人信息更新成功",
      duration: 2000,
    });

    await loadUser();
  } catch (error) {
    toast({
      title: "个人信息更新失败",
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
<template>
  <div class="rounded-lg border bg-background" v-if="user">
    <div class="border-b p-6">
      <h3 class="text-lg font-medium text-foreground">个人信息</h3>
      <p class="text-sm text-muted-foreground">
        您的个人信息不会被分享给其他人
      </p>
    </div>

    <div class="space-y-6 p-6">
      <div class="flex items-center gap-4">
        <UserAvatar size="lg" />
        <Button
          :class="{ 'opacity-50 cursor-not-allowed': isUploading }"
          variant="outline"
          as="label"
          v-if="!isOAuthProvider"
          :disabled="isUploading"
        >
          {{ isUploading ? "上传中..." : "上传头像" }}
          <input
            type="file"
            class="hidden"
            accept="image/*"
            @change="handleAvatarChange"
            :disabled="isUploading"
          />
        </Button>
      </div>

      <div class="space-y-2">
        <Label class="text-foreground">登录方式</Label>
        <div class="flex items-center gap-2 text-sm text-muted-foreground">
          <div v-if="isEmailProvider" class="flex items-center gap-1">
            <LucideMail class="size-4" />
            <span>邮箱登录</span>
          </div>
          <div v-if="isPhoneProvider" class="flex items-center gap-1">
            <LucidePhone class="size-4" />
            <span>手机号登录</span>
          </div>
          <div v-if="isGithubProvider" class="flex items-center gap-1">
            <LucideGithub class="size-4" />
            <span>GitHub 登录</span>
          </div>
          <div v-if="isGoogleProvider" class="flex items-center gap-1">
            <img src="/images/google.svg" alt="google" class="h-4 w-4 mr-1" />
            <span>Google 登录</span>
          </div>
        </div>
      </div>

      <div class="space-y-2" v-if="isEmailProvider">
        <Label for="email" class="text-foreground">邮箱</Label>
        <Input
          class="max-w-md text-foreground"
          id="email"
          v-model="userInfo.email"
          disabled
        />
      </div>

      <div class="space-y-2" v-if="isPhoneProvider">
        <Label for="phone" class="text-foreground">手机号</Label>
        <Input
          class="max-w-md text-foreground"
          id="phone"
          v-model="userInfo.phone"
          disabled
        />
      </div>

      <div class="space-y-2">
        <Label for="full_name" class="text-foreground">用户名</Label>
        <Input
          class="max-w-md text-foreground"
          id="full_name"
          v-model="userInfo.full_name"
          :disabled="isOAuthProvider"
        />
      </div>

      <Button
        @click="updateProfile"
        v-if="!isOAuthProvider"
        :disabled="isSaving"
      >
        <LucideLoader2 v-if="isSaving" class="size-4 animate-spin" />
        {{ isSaving ? "保存中..." : "保存更改" }}
      </Button>
    </div>
  </div>
</template>
