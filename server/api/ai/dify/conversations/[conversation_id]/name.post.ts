import { defineEventHandler, readBody, getHeader } from "h3";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

export default defineEventHandler(async (event) => {
  const conversationId = event.context.params?.conversation_id;
  const body = await readBody(event);
  const appid = getHeader(event, "x-app-id") as AppKey;

  if (!conversationId || !body.name) {
    throw createError({
      statusCode: 400,
      message: 'Missing required parameters',
    })
  }

  try {
    // 修改为 POST 请求
    const response = await difyRequest(appid, `/conversations/${conversationId}/name`, {
      method: 'POST',
      body: JSON.stringify({
        name: body.name,
        user: body.user,  // 添加必需的 user 参数
        auto_generate: false // 手动设置名称时为 false
      }),
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update conversation name',
    })
  }
}) 