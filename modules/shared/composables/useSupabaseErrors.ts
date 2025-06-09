import { supabaseErrorMessages } from "@/config/error/supabase";

export function useSupabaseErrors() {
  const handleSupabaseError = (error: any) => {
    // 获取错误信息
    const errorMessage = error?.message;
    const mappedError = supabaseErrorMessages[errorMessage];

    if (mappedError) {
      // 抛出映射的错误
      throw createError({
        statusCode: mappedError.statusCode,
        message: mappedError.message,
      });
    }

    // 处理未映射的错误
    throw createError({
      statusCode: error?.statusCode || 500,
      message: errorMessage || "未知错误",
    });
  };

  return {
    handleSupabaseError,
  };
}
