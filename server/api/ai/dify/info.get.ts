import { serverSupabaseUser } from "#supabase/server";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

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

    // 获取查询参数
    const query = getQuery(event);
    const userId = query.user as string;

    if (!userId) {
      throw createError({
        statusCode: 400,
        message: "Missing user parameter",
      });
    }

    // 使用 difyRequest 发送请求
    const response = await difyRequest(appId, "/info", {
      method: "GET",
      query: {
        user: userId,
      },
    });

    return {
      url: process.env.DIFY_BASE_URL?.replace(/\/v1$/, ''),
      ...response,
    };
  } catch (error: any) {
    console.error("Error fetching app info:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Failed to fetch app info",
    });
  }
}); 