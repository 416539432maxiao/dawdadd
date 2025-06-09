import { difyRequest } from "@/server/utils/dify-tools";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const appId = event.headers.get("x-app-id");

  if (!appId) {
    throw createError({
      statusCode: 400,
      message: "Missing app ID",
    });
  }

  // 设置响应头
  setResponseHeaders(event, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    const response = await difyRequest(appId as any, "/completion-messages", {
      method: "POST",
      body,
    });

    if (!response) {
      throw createError({
        statusCode: 500,
        message: "No response body",
      });
    }

    // 创建可读流
    const reader = response.getReader();
    
    // 返回流式响应
    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } catch (error: any) {
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to generate completion",
    });
  }
});
