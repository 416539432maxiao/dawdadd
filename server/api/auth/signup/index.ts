import { serverSupabaseClient } from "#supabase/server";
import { H3Event } from "h3";
import type { SignInBody } from "@/modules/saas/auth/types";
import { useSupabaseErrors } from "@/modules/shared/composables/useSupabaseErrors";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event);
    const body = await readBody<SignInBody>(event);
    const { handleSupabaseError } = useSupabaseErrors();
    const config = useRuntimeConfig();

    if (body.type === "email") {
      // 邮箱注册
      const { data, error } = await supabase.auth.signUp({
        email: body.email,
        password: body.password,
        options: {
          emailRedirectTo: `${config.public.siteUrl}/auth/callback`,
        },
      });

      if (data.user && data.user.identities?.length === 0) {
        throw createError({
          statusCode: 400,
          message: "该邮箱已经被注册",
        });
      }

      if (error) {
        handleSupabaseError(error);
      }

      return { user: data.user, session: data.session };
    } else if (body.type === "phone") {
      // 手机号注册
      const { data, error } = await supabase.auth.verifyOtp({
        phone: body.phone,
        token: body.code,
        type: "sms",
      });

      if (error) {
        handleSupabaseError(error);
      }

      return { user: data.user, session: data.session };
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "注册失败",
    });
  }
});
