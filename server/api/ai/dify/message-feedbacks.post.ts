import { defineEventHandler, readBody, getHeader, getRouterParam } from "h3";
import { serverSupabaseUser } from "#supabase/server";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

// Types for request body
interface MessageFeedbackRequest {
  rating: "like" | "dislike" | null;
  user: string;
  content?: string;
  message_id: string;
}

export default defineEventHandler(async (event) => {
  try {
    // 获取用户信息
    const user = await serverSupabaseUser(event);
    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    // 获取请求头中的 app id
    const appId = getHeader(event, "x-app-id") as AppKey;
    if (!appId) {
      throw createError({
        statusCode: 400,
        message: "Missing app id",
      });
    }

    // 读取请求体
    const body = await readBody<MessageFeedbackRequest>(event);
    if (!body || typeof body.rating === "undefined" || !body.user) {
      throw createError({
        statusCode: 400,
        message: "Invalid request body",
      });
    }

    const messageId = body.message_id;
    if (!messageId) {
      throw createError({
        statusCode: 400,
        message: "Missing message ID",
      });
    }

    // 构建Dify API路径
    const path = `/messages/${messageId}/feedbacks`;

    const bodyData = {
      rating: body.rating,
      user: body.user,
      content: body.content || "",
    };

    // 使用 difyRequest 发送请求
    const response = await difyRequest(appId, path, {
      method: "POST",
      body: bodyData,
    });

    return response;
  } catch (error: any) {
    console.error("Error sending message feedback:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to send message feedback",
    });
  }
});
