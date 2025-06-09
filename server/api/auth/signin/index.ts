import { serverSupabaseClient } from "#supabase/server";
import { H3Event } from "h3";
import type { SignInBody } from "@/modules/saas/auth/types";
import { useSupabaseErrors } from "@/modules/shared/composables/useSupabaseErrors";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event);
    const body = await readBody<SignInBody>(event);
    const { public: runtimeConfig } = useRuntimeConfig();

    const { handleSupabaseError } = useSupabaseErrors();

    if (body.type === "email") {
      // 邮箱登录
      const { data, error } = await supabase.auth.signInWithPassword({
        email: body.email,
        password: body.password,
      });

      if (error) {
        handleSupabaseError(error);
      }

      return { user: data.user, session: data.session };
    } else {
      // 手机号登录
      const { data, error } = await supabase.auth.verifyOtp({
        phone: body.phone,
        token: body.code,
        type: "sms",
        options: {
          redirectTo: `${runtimeConfig.siteUrl}/dashboard`,
        },
      });

      if (error) {
        handleSupabaseError(error);
      }

      return { user: data.user, session: data.session };
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "登录失败",
    });
  }
});
