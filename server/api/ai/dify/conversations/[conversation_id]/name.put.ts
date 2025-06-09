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
    const response = await difyRequest(appid, `/conversations/${conversationId}/name`, {
      method: 'PUT',
      body: JSON.stringify({ name: body.name }),
    })

    return response
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Failed to update conversation name',
    })
  }
}) 