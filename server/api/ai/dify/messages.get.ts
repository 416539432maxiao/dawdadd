import { defineEventHandler, getQuery, getHeader } from "h3";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

interface MessagesQuery {
  conversation_id: string;
  user: string;
  first_id?: string;
  limit?: string;
}

export default defineEventHandler(async (event) => {
  // 获取查询参数
  const query = getQuery(event) as MessagesQuery;
  const appid = getHeader(event, "x-app-id") as AppKey;

  // 验证必需的参数
  if (!query.conversation_id || !query.user) {
    throw createError({
      statusCode: 400,
      message: "Missing required parameters: conversation_id and user",
    });
  }

  try {
    // 构建请求参数
    const params = new URLSearchParams({
      conversation_id: query.conversation_id,
      user: query.user,
      limit: query.limit || "40", // 默认40条
    });

    // 添加可选的first_id参数（用于分页）
    if (query.first_id) {
      params.append("first_id", query.first_id);
    }

    // 发送请求到 Dify API
    const response = await difyRequest(
      appid,
      `/messages?${params.toString()}`,
      {
        method: "GET",
      }
    );

    return response;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch messages",
    });
  }
});
