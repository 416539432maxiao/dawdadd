import type { Session, User } from "@supabase/supabase-js";
import type { SignInBody } from "@/modules/saas/auth/types";
import { useToast } from "@/modules/ui/components/toast/use-toast";
import api from "@/config/api";
import type { UserSubscription } from "@/modules/shared/types/database.types";

export const useUser = ({ initialUser }: { initialUser?: User } = {}) => {
  const supabase = useSupabaseClient();
  const { toast } = useToast();
  const subscription = ref<any>(null);

  const loaded = useState("useUser-loaded", () => !!initialUser);
  const user = useState<User | null>("useUser-user", () => initialUser ?? null);
  const userPlan = useState<UserSubscription | null>(
    "useUser-user-plan",
    () => null
  );

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    user.value = data?.user || null;
    loaded.value = true;
    return data?.user || null;
  };

  const setupAuthListener = async () => {
    const {
      data: { subscription: sub },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const prevUser = user.value;

      switch (event) {
        case "INITIAL_SESSION":
        case "SIGNED_IN":
          user.value = session?.user || null;
          if (user.value?.id !== prevUser?.id) {
            userPlan.value = await loadPlan();
          }
          break;
        case "SIGNED_OUT":
          user.value = null;
          userPlan.value = null;
          break;
        case "USER_UPDATED":
          user.value = session?.user || null;
          break;
        default:
          return;
      }

      loaded.value = true;
    });

    subscription.value = sub;
    return () => {
      if (subscription.value) {
        subscription.value.unsubscribe();
      }
    };
  };

  // 发送手机验证码
  const sendPhoneCode = async (phone: string) => {
    const { data } = await $fetch<{ data: any }>(api.sendPhoneCode, {
      method: "POST",
      body: { phone },
    });

    toast({
      title: "验证码已发送",
      duration: 2000,
    });

    return data;
  };

  // 登出
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    user.value = null;
    loaded.value = false;

    navigateTo("/");
  };

  // 获取当前用户
  const getCurrentUser = async () => {
    const {
      data: { user: currentUser },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    user.value = currentUser;
    loaded.value = true;
    return currentUser;
  };

  // 登录方法
  const signIn = async (params: SignInBody) => {
    const res = await $fetch<{ user: User; session: Session }>(api.signin, {
      method: "POST",
      body: params,
    });

    if (res.user && res.session) {
      // 更新 Supabase Cookie
      await supabase.auth.setSession({
        access_token: res.session.access_token,
        refresh_token: res.session.refresh_token,
      });

      user.value = res.user;
      loaded.value = true;

      navigateTo("/dashboard");
      toast({
        title: "登录成功",
        duration: 2000,
      });
    }
  };

  // 注册方法
  const signUp = async (params: SignInBody) => {
    const res = await $fetch<{ user: User; session: Session }>(api.signup, {
      method: "POST",
      body: params,
    });

    if (res.user) {
      if (params.type === "email") {
        // 邮箱注册
        toast({
          title: "注册邮件已发送，请查收",
          duration: 2000,
        });
      } else if (params.type === "phone") {
        // 手机号注册成功后直接登录
        user.value = res.user;
        loaded.value = true;

        // 导航到仪表板
        navigateTo("/dashboard");
        toast({
          title: "注册成功，已为您自动登录",
          duration: 2000,
        });
      }
    }
  };

  // 获取用户订阅计划
  const loadPlan = async () => {
    if (!user.value?.id) return null;

    const res = await $fetch<UserSubscription>(api.subscription, {
      method: "GET",
    });

    return res;
  };

  // 处理邮箱验证回调
  const handleEmailVerification = async () => {
    const route = useRoute();

    // 首先检查用户是否已经登录，如果已登录则直接返回成功
    const { data } = await supabase.auth.getUser();
    if (data?.user && data.user.email_confirmed_at) {
      // 三秒后重定向到仪表板
      navigateTo("/dashboard");

      return true;
    }

    // 检查URL中是否有错误参数
    if (route.query.error || route.hash.includes("error=")) {
      const errorDesc = route.query.error_description
        ? String(route.query.error_description)
        : new URLSearchParams(route.hash.substring(1)).get("error_description");

      toast({
        title: "验证失败",
        description: errorDesc || "邮箱验证链接无效或已过期",
        variant: "destructive",
        duration: 5000,
      });

      return false;
    }

    // 检查URL中是否有会话参数
    if (
      (route.hash && route.hash.includes("access_token")) ||
      route.query.access_token
    ) {
      try {
        // 从URL获取会话信息
        const hashParams = route.hash
          ? new URLSearchParams(route.hash.substring(1))
          : null;
        const accessToken =
          route.query.access_token || hashParams?.get("access_token");
        const refreshToken =
          route.query.refresh_token || hashParams?.get("refresh_token");

        if (accessToken && refreshToken) {
          // 设置会话
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken as string,
            refresh_token: refreshToken as string,
          });

          if (error) throw error;

          user.value = data.user;
          loaded.value = true;

          toast({
            title: "邮箱验证成功",
            description: "您的账号已激活",
            duration: 3000,
          });

          // 导航到仪表板
          navigateTo("/dashboard");
          return true;
        }
      } catch (error: any) {
        console.error("邮箱验证处理错误:", error);
        toast({
          title: "验证失败",
          description: error.message || "邮箱验证过程中出现问题",
          variant: "destructive",
          duration: 5000,
        });
      }
    }

    return false;
  };

  return {
    loaded,
    loadUser,
    user,
    userPlan,
    loadPlan,
    sendPhoneCode,
    signOut,
    getCurrentUser,
    signIn,
    signUp,
    setupAuthListener,
    handleEmailVerification,
  };
};
