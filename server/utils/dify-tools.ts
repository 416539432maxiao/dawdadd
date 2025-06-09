import aiConfig, { AppKey } from "@/config/ai/index";

const baseUrl = process.env.DIFY_BASE_URL || "https://api.dify.ai/v1";
type DifyRequestBody = BodyInit | Record<string, any> | null;

interface DifyRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: DifyRequestBody;
  query?: Record<string, string>;
  isMultipart?: boolean;
}

/**
 * Make a request to Dify API
 * @param path - API endpoint path
 * @param options - Request options
 * @returns Response from Dify API
 */
export async function difyRequest(
  app: AppKey,
  path: string,
  options: DifyRequestOptions = {}
) {
  // 获取 apikey
  const apiKey = process.env[aiConfig.apps[app].apikey];
  if (!apiKey) {
    throw new Error(`API key for ${app} is not set`);
  }

  // 确保 baseUrl 不以斜杠结尾，path 以斜杠开头
  const cleanBaseUrl = baseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;

  // 构建完整的 URL，确保包含 /v1 前缀
  const fullPath = cleanPath.startsWith("/v1/") ? cleanPath : `/v1${cleanPath}`;
  const url = new URL(fullPath, cleanBaseUrl);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }

  // 准备请求选项
  const fetchOptions: RequestInit = {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
  };

  // 处理请求体和 Content-Type
  if (options.body) {
    if (options.body instanceof FormData) {
      // 对于 FormData，不设置 Content-Type，让浏览器自动处理
      fetchOptions.body = options.body;
    } else if (typeof options.body === "string") {
      // 如果已经是字符串，直接使用
      fetchOptions.body = options.body;
      if (!options.headers?.["Content-Type"]) {
        (fetchOptions.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      }
    } else {
      // 对象类型，转换为 JSON 字符串
      fetchOptions.body = JSON.stringify(options.body);
      if (!options.headers?.["Content-Type"]) {
        (fetchOptions.headers as Record<string, string>)["Content-Type"] =
          "application/json";
      }
    }
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);

    // Handle error responses
    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || "Failed to fetch from Dify API";
      } catch {
        errorMessage = response.statusText || "Failed to fetch from Dify API";
      }

      throw createError({
        statusCode: response.status,
        statusMessage: response.statusText,
        message: errorMessage,
      });
    }

    // Handle streaming response
    if (response.headers.get("content-type")?.includes("text/event-stream")) {
      return response.body;
    }

    // Handle JSON response
    return await response.json();
  } catch (error: any) {
    console.error("Dify API error:", error);

    // Rethrow if it's already a handled error
    if (error.statusCode) {
      throw error;
    }

    // Handle network or other errors
    throw createError({
      statusCode: 500,
      message: error.message || "Failed to connect to Dify API",
    });
  }
}
