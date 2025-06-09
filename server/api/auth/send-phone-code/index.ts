import { serverSupabaseClient } from "#supabase/server";
import { H3Event } from "h3";
import { useSupabaseErrors } from "@/modules/shared/composables/useSupabaseErrors";

export default defineEventHandler(async (event: H3Event) => {
  try {
    const supabase = await serverSupabaseClient(event);
    const { phone } = await readBody<{ phone: string }>(event);
    const { handleSupabaseError } = useSupabaseErrors();

    const { data, error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      handleSupabaseError(error);
    }

    return { data };
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "发送验证码失败",
    });
  }
});
