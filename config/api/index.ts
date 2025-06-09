export default {
  // billing
  checkout: "/api/checkout",
  // auth
  signin: "/api/auth/signin",
  signup: "/api/auth/signup",
  oauth: "/api/auth/oauth",
  oauthCallback: "/api/auth/oauth/callback",
  sendPhoneCode: "/api/auth/send-phone-code",
  // user
  subscription: "/api/user/subscription",
  // dify
  dify: {
    // 获取应用信息
    info: "/api/ai/dify/info",
    // 获取应用参数
    parameters: "/api/ai/dify/parameters",
    // 上传文件
    fileUpload: "/api/ai/dify/files/upload",
    // 发送/接收聊天消息（POST, streaming）
    chatMessages: "/api/ai/dify/chat-messages",
    // 获取会话列表（GET）
    conversations: "/api/ai/dify/conversations",
    // 获取会话历史消息（GET）
    messages: "/api/ai/dify/messages",
    // 消息反馈（点赞/点踩）
    messageFeedback:  `/api/ai/dify/message-feedbacks`,
    // 重命名会话（POST）
    renameConversation: (conversationId: string) =>
      `/api/ai/dify/conversations/${conversationId}/name`,
    // 删除会话（DELETE）
    deleteConversation: (conversationId: string) =>
      `/api/ai/dify/conversations/${conversationId}`,
    // 文本生成类
    completionMessages: "/api/ai/dify/completion-messages",
    // 工作流
    workflowRun: "/api/ai/dify/workflow/run",
  },
};
