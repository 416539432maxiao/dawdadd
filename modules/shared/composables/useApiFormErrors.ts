import { type FormContext } from "vee-validate";

interface ApiError {
  code: string;
  message: string;
  fields?: Record<string, string>;
}

export function useApiFormErrors(form: FormContext<any>) {
  const handleApiError = (error: unknown) => {
    // 处理标准 API 错误
    if (error instanceof Error && "data" in error) {
      const apiError = (error as any).data as ApiError;

      // 处理字段级别的错误
      if (apiError.fields) {
        form.setErrors(apiError.fields);
      }

      // 处理全局错误消息
      if (apiError.message) {
        form.setErrors({
          root: apiError.message,
        });
      }
    } else {
      // 处理未知错误
      form.setErrors({
        root: "发生未知错误，请稍后重试",
      });
    }
  };

  return {
    handleApiError,
  };
}
