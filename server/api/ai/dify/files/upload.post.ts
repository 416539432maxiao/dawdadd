import { defineEventHandler, readMultipartFormData, getHeader } from "h3";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

export default defineEventHandler(async (event) => {
  try {
    const appid = getHeader(event, "x-app-id") as AppKey;
    const formData = await readMultipartFormData(event);

    if (!formData || formData.length === 0) {
      throw createError({
        statusCode: 400,
        message: "No file uploaded",
      });
    }

    const fileData = formData.find((item) => item.name === "file");
    const userData = formData.find((item) => item.name === "user");

    if (!fileData) {
      throw createError({
        statusCode: 400,
        message: "No file provided",
      });
    }

    if (!userData) {
      throw createError({
        statusCode: 400,
        message: "No user provided",
      });
    }

    // 构建 multipart/form-data 请求
    const body = new FormData();
    const file = new File([fileData.data], fileData.filename || "file", {
      type: fileData.type || "application/octet-stream",
    });
    body.append("file", file);
    body.append("user", userData.data.toString());

    // 发送请求到 Dify API
    const response = await difyRequest(appid, "/files/upload", {
      method: "POST",
      body,
      isMultipart: true, // 标记为 multipart/form-data 请求
    });

    return response;
  } catch (error: any) {
    console.error("File upload error:", error);

    // 处理特定的错误类型
    if (error.statusCode === 413) {
      throw createError({
        statusCode: 413,
        message: "文件太大",
      });
    }

    if (error.statusCode === 415) {
      throw createError({
        statusCode: 415,
        message: "不支持的文件类型",
      });
    }

    // 处理其他错误
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "文件上传失败",
    });
  }
});
