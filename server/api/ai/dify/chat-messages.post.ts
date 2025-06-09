import { defineEventHandler, readBody, getHeader } from "h3";
import { difyRequest } from "@/server/utils/dify-tools";
import { AppKey } from "@/config/ai/index";

// Types for request body
interface ChatMessageRequest {
  query: string;
  inputs?: Record<string, any>;
  response_mode?: "streaming" | "blocking";
  user: string;
  conversation_id?: string;
  files?: Array<{
    type: "image";
    transfer_method: "remote_url" | "local_file";
    url?: string;
    upload_file_id?: string;
  }>;
  auto_generate_name?: boolean;
}

// Types for response in blocking mode
interface ChatCompletionResponse {
  message_id: string;
  conversation_id: string;
  mode: "chat";
  answer: string;
  metadata: {
    usage: {
      prompt_tokens: number;
      prompt_unit_price: string;
      prompt_price_unit: string;
      prompt_price: string;
      completion_tokens: number;
      completion_unit_price: string;
      completion_price_unit: string;
      completion_price: string;
      total_tokens: number;
      total_price: string;
      currency: string;
      latency: number;
    };
    retriever_resources: Array<{
      position: number;
      dataset_id: string;
      dataset_name: string;
      document_id: string;
      document_name: string;
      segment_id: string;
      score: number;
      content: string;
    }>;
  };
  created_at: number;
}

export default defineEventHandler(async (event) => {
  // Read request body
  const body = await readBody<ChatMessageRequest>(event);
  const appid = getHeader(event, "x-app-id") as AppKey;

  // Validate required fields
  if (!body.query || !body.user)
    throw createError({ statusCode: 400, message: "Missing required fields" });

  // Set default values
  const payload = {
    ...body,
    response_mode: body.response_mode || "streaming",
    inputs: body.inputs || {},
    auto_generate_name: body.auto_generate_name ?? true,
  };

  try {
    // Make request to Dify API
    const response = await difyRequest(appid, "/chat-messages", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // For streaming mode, we need to pipe the response
    if (payload.response_mode === "streaming") {
      setHeader(event, "Content-Type", "text/event-stream");
      setHeader(event, "Cache-Control", "no-cache");
      setHeader(event, "Connection", "keep-alive");

      return response;
    }

    // For blocking mode, return the JSON response
    return response as ChatCompletionResponse;
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Internal server error",
    });
  }
});
