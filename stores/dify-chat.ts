import { defineStore } from "pinia";
import { useToast } from "@/modules/ui/components/toast/use-toast";
import { ToastAction } from "@/modules/ui/components/toast";
import { useUser } from "@/modules/saas/auth/composables/useUser";
import api from "@/config/api";
import { useUserTokenStore } from "@/stores/user-token";
import aiConfig, { type DifyAppConfig } from "~/config/ai";
import { useSupabaseClient } from "#imports";
import {
  type AppInfo,
  type AppParameters,
  type Message,
  type ChatMessage,
  type ChatHistory,
  type ChatCache,
  type UploadedFile,
  type InputType,
  type FileType,
  type SavedCompletionDisplay,
  type WorkflowNode,
} from "@/modules/ai/types/dify.type";
import {
  getFileTypeByMimeType,
  getInputAccept,
} from "@/modules/ai/tools/file-types";
import { DB_TABLES } from "@/config/db/tables";
import type { Database } from "@/modules/shared/types/database.types";

interface ApiResponse<T> {
  data: T[];
  has_more: boolean;
}

export const useDifyChatStore = defineStore("dify-chat", {
  state: () => ({
    type: "chat",
    isLoadingApp: true,
    appid: null as string | null,
    appInfo: null as AppInfo | null,
    appParameters: null as AppParameters | null,
    userInputs: {} as Record<string, any>,
    userInputFormCache: {} as Record<string, any>,
    showUserInputForm: false,
    showUserInputFormCancelBtn: false,
    messages: [] as Message[],
    conversationHistory: [] as ChatHistory[],
    currentConversationId: null as string | null,
    isLoadingMessage: false, // 是否正在加载会话历史消息
    isMessagesLoading: false, // 是否正在加载会话列表
    hasMoreHistory: false,
    lastId: null as string | null,
    firstMessageId: null as string | null,
    hasMoreMessages: false as boolean,
    isLoadingHistory: true,
    messageCache: new Map<string, ChatCache>(),
    uploadingFiles: ref<UploadedFile[]>([]),
    isUploading: false,
    generatedContent: null as string | null,
    currentMessageId: null as string | null,
    completionSavedList: [] as SavedCompletionDisplay[],
    workflowContent: null as string | null,
    workflowNodes: [] as WorkflowNode[],
    worflowRunId: null as string | null,
  }),
  getters: {
    // 是否是一个新对话
    isNewConversation(): boolean {
      if (!this.currentConversationId) {
        // 如果有开场白，且只有一条消息，依然是新对话
        if (this.appParameters?.opening_statement) {
          return this.messages.length <= 1;
        }
        // 如果没有开场白，没有消息才是新对话
        return this.messages.length === 0;
      }
      return false;
    },
    // 开场白
    openingStatement(): string {
      return this.appParameters?.opening_statement || "";
    },
    // 获取当前应用配置
    currentApp(): DifyAppConfig | null {
      if (!this.appid) return null;
      return (
        Object.values(aiConfig.apps).find((app) => app.id === this.appid) ||
        null
      );
    },
    // 是否启用文件上传
    enableFileUpload(): boolean {
      return this.appParameters?.file_upload?.enabled || false;
    },
    // 允许上传的文件类型
    allowedFileTypes(): FileType[] {
      return (
        (this.appParameters?.file_upload?.allowed_file_types as FileType[]) ||
        []
      );
    },
    // 允许上传的文件mime类型
    fileInputAccept(): string {
      return getInputAccept(
        this.appParameters?.file_upload?.allowed_file_types as FileType[]
      );
    },
    // 允许上传的文件最大数量
    fileInputLimit(): number {
      return this.appParameters?.file_upload?.number_limits || 1;
    },
    // 获取用户配置字段
    userInputForm(): InputType[] {
      const formElements = this.appParameters?.user_input_form || [];

      return formElements;
    },
    // 是否有用户配置字段
    hasConfigInputs(): boolean {
      return !!this.appParameters?.user_input_form?.length;
    },
    // 获取用户配置字段列表
    userInputFormList() {
      const list: any[] = [];

      this.userInputForm.forEach((field) => {
        Object.entries(field).forEach(([key, value]) => {
          if (value && typeof value === "object") {
            value.type = value.type || key; // completion的返回值中没有type 字段
            list.push(value);
          }
        });
      });

      return list;
    },
  },

  actions: {
    // 初始化dify应用
    async initDifyApp() {
      this.isLoadingApp = true;

      try {
        if (this.type === "chat") {
          await Promise.all([
            // 获取应用信息
            this.fetchAppInfo(),
            // 加载会话列表
            this.loadConversations(),
            // 初始化对话消息
            this.initConversationMessages(),
            // 初始化应用参数
            this.initParameters(),
          ]);
        } else if (this.type === "completion" || this.type === "workflow") {
          await Promise.all([
            // 获取应用信息
            this.fetchAppInfo(),
            // 初始化应用参数
            this.initParameters(),
          ]);
        }
      } catch (error: any) {
        console.error("Error initializing Dify app:", error);
        this.isLoadingApp = false;
      } finally {
        this.isLoadingApp = false;
      }
    },
    // 新增获取应用信息的方法
    async fetchAppInfo() {
      const { user } = useUser();
      if (!user.value || !this.appid) return;

      try {
        const data = await $fetch<AppInfo>(api.dify.info, {
          method: "GET",
          params: {
            user: user.value.id,
          },
          headers: {
            "X-App-ID": this.appid,
          },
        });

        this.appInfo = data;
      } catch (error: any) {
        console.error("Error fetching app info:", error);
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "获取应用信息失败",
          description: error.message || "无法获取应用信息",
          duration: 2000,
        });
      }
    },

    // 加载会话列表
    async loadConversations(loadMore = false) {
      if (this.type === "completion") return;

      const { user } = useUser();
      if (!user.value) return;

      this.isLoadingHistory = true;

      try {
        const params = {
          user: user.value.id,
          limit: "20",
          ...(loadMore && this.lastId ? { last_id: this.lastId } : {}),
        };

        const data = await $fetch<ApiResponse<ChatHistory>>(
          api.dify.conversations,
          {
            method: "GET",
            params,
            headers: {
              "X-App-ID": this.appid || "",
            },
            timeout: 10000,
          }
        );

        if (loadMore) {
          this.conversationHistory = [
            ...this.conversationHistory,
            ...data.data,
          ];
        } else {
          this.conversationHistory = data.data;
        }

        this.hasMoreHistory = data.has_more;
        this.lastId = data.data[data.data.length - 1]?.id || null;
      } catch (error: any) {
        console.error("Error loading conversations:", error);
        this.isLoadingHistory = false;
      } finally {
        this.isLoadingHistory = false;
      }
    },

    // 初始化对话消息
    async initConversationMessages() {
      if (this.type === "completion") return;

      const route = useRoute();
      const conversationId = route.query.conversation_id as string;
      if (conversationId) {
        await this.getMessages(conversationId);
      }
    },

    // 初始化应用参数
    async initParameters() {
      const { user } = useUser();
      if (!user.value || !this.appid) return;

      try {
        const parameters = await $fetch<AppParameters>(api.dify.parameters, {
          method: "GET",
          params: {
            user: user.value.id,
          },
          headers: {
            "X-App-ID": this.appid || "",
          },
        });
        this.appParameters = parameters;

        this.showUserInputForm = this.isNewConversation && this.hasConfigInputs;

        // 如果是新对话且存在开场白，添加一条AI消息
        if (this.isNewConversation && parameters.opening_statement) {
          this.addMessage({
            id: Date.now().toString(),
            content: parameters.opening_statement,
            isBot: true,
            isOpeningStatement: true,
          });
        }
      } catch (error: any) {
        console.error("Error fetching app parameters:", error);
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "获取应用参数失败",
          description: error.message || "无法获取应用参数",
          duration: 2000,
        });
      }
    },

    // 添加消息
    addMessage(message: Message) {
      this.messages.push(message);
    },

    // 清除消息
    clearMessages() {
      this.messages = [];
      this.currentConversationId = null;
      this.uploadingFiles = [];
      this.userInputs = {};
      this.userInputFormCache = {};
      this.showUserInputForm = false;
      this.showUserInputFormCancelBtn = false;
    },

    // 设置应用ID
    async setAppId(appid: string) {
      this.appid = appid;
    },

    // 设置对话类型
    async setType(type: "chat" | "completion") {
      this.type = type;
    },

    // 发送对话消息
    async sendMessage(content: string) {
      if (!content.trim()) return;
      try {
        const { user } = useUser();
        const tokenStore = useUserTokenStore();
        const { toast } = useToast();

        if (!user.value) {
          setTimeout(() => {
            navigateTo("/auth/signin");
          }, 1000);
          throw new Error("用户未登录");
        }

        if (
          tokenStore.remainingOnetimeTokens <= 0 &&
          tokenStore.remainingSubscriptionTokens <= 0
        ) {
          toast({
            variant: "destructive",
            description: "Token不足，请充值后再使用",
            action: h(
              ToastAction,
              {
                altText: "去购买",
                onClick: () => {
                  navigateTo("/pricing");
                },
              },
              {
                default: () => "去购买",
              }
            ),
          });
          return;
        }

        const newConversation = this.isNewConversation;

        // 添加用户消息
        const userMessage: Message = {
          id: Date.now().toString(),
          content,
          isBot: false,
          files:
            this.uploadingFiles.length > 0
              ? [...this.uploadingFiles]
              : undefined,
        };
        this.addMessage(userMessage);

        this.isLoadingMessage = true;

        // 创建 AI 消息占位
        const botMessageId = (Date.now() + 1).toString();
        const botMessage: Message = {
          id: botMessageId,
          content: "",
          isBot: true,
          messageId: "",
        };
        this.addMessage(botMessage);

        // 准备文件数据
        const files = this.uploadingFiles.map((file) => {
          const fileType = getFileTypeByMimeType(file.type);

          return {
            type: fileType,
            transfer_method: file.url ? "remote_url" : "local_file",
            ...(file.url
              ? { url: file.url }
              : { upload_file_id: file.upload_file_id }),
          };
        });

        // 发送请求
        const response = await fetch(api.dify.chatMessages, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-ID": this.appid || "",
          },
          body: JSON.stringify({
            query: content,
            user: user.value.id,
            response_mode: "streaming",
            conversation_id: this.currentConversationId || undefined,
            auto_generate_name: true,
            files: files.length > 0 ? files : undefined,
            inputs: this.userInputs || {},
          }),
        });

        if (!response.ok) {
          // 获取原始错误信息
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send message");
        }

        // 处理流式响应
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let accumulatedContent = "";
        let buffer = ""; // 用于存储不完整的数据

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            // 如果还有剩余数据，确保处理完
            if (buffer.trim()) {
              const remainingMatches = buffer.match(/data: ({.*?})\n\n/gs);
              if (remainingMatches) {
                for (const match of remainingMatches) {
                  try {
                    const json = JSON.parse(match.replace("data: ", ""));
                    const messageIndex = this.messages.findIndex(
                      (m) => m.id === botMessageId
                    );
                    if (json.event === "message") {
                      accumulatedContent += json.answer || "";
                      if (messageIndex !== -1) {
                        this.messages[messageIndex].content =
                          accumulatedContent;
                      }
                      // 如果消息没有messageId，则设置messageId
                      if (!this.messages[messageIndex].messageId) {
                        this.messages[messageIndex].messageId = json.message_id;
                      }
                    } else if (json.event === "message_end") {
                      if (json.conversation_id) {
                        this.currentConversationId = json.conversation_id;
                      }
                      if (json.files && messageIndex !== -1) {
                        this.messages[messageIndex].files = json.files;
                      }
                      await this.handleTokenDeduction(json.metadata);
                    } else if (json.event === "workflow_started") {
                      this.messages[messageIndex].workflows = [json];
                    } else if (json.event === "error") {
                      throw new Error(json.message || "Stream error");
                    } else if (
                      !json.event.data?.iteration_id &&
                      json.event !== "iteration_next"
                    ) {
                      this.messages[messageIndex].workflows?.push(json);
                    }
                  } catch (e) {
                    console.warn("Could not parse remaining data:", match);
                  }
                }
              }
            }
            break;
          }

          // 将新的chunk添加到buffer中
          buffer += decoder.decode(value, { stream: true });

          // 尝试从buffer中提取完整的消息
          const messages = [];
          let lastIndex = 0;
          const pattern = /data: ({.*?})\n\n/gs;
          let match;

          while ((match = pattern.exec(buffer)) !== null) {
            try {
              const json = JSON.parse(match[1]);
              messages.push(json);
              lastIndex = match.index + match[0].length;
            } catch (e) {
              console.warn("JSON parse error, waiting for more data");
              break;
            }
          }

          // 只保留未处理完的数据
          if (lastIndex > 0) {
            buffer = buffer.slice(lastIndex);
          }

          // 处理完整的消息
          for (const msg of messages) {
            const messageIndex = this.messages.findIndex(
              (m) => m.id === botMessageId
            );
            if (msg.event === "message") {
              accumulatedContent += msg.answer || "";
              if (messageIndex !== -1) {
                this.messages[messageIndex].content = accumulatedContent;
              }
              if (!this.messages[messageIndex].messageId) {
                this.messages[messageIndex].messageId = msg.message_id;
              }
            } else if (msg.event === "message_end") {
              if (msg.conversation_id) {
                this.currentConversationId = msg.conversation_id;
              }
              if (msg.files && messageIndex !== -1) {
                this.messages[messageIndex].files = msg.files;
              }
              await this.handleTokenDeduction(msg.metadata);
            } else if (msg.event === "workflow_started") {
              this.messages[messageIndex].workflows = [msg];
            } else if (msg.event === "error") {
              throw new Error(msg.message || "Stream error");
            } else if (
              !msg.event.data?.iteration_id &&
              msg.event !== "iteration_next"
            ) {
              this.messages[messageIndex].workflows?.push(msg);
            }
          }
        }

        // 在消息发送成功后更新缓存
        if (this.currentConversationId) {
          this.messageCache.set(this.currentConversationId, {
            messages: this.messages,
            firstMessageId: this.firstMessageId,
            hasMoreMessages: this.hasMoreMessages,
          });
        }

        // 清除上传的文件
        this.clearUploadedFiles();

        // 如果是一个新对话，重新请求文件列表
        if (newConversation) {
          this.loadConversations();
        }
      } catch (error: any) {
        const { toast } = useToast();
        console.error("Error sending message:", error);

        const lastMessage = this.messages[this.messages.length - 1];
        if (lastMessage?.isBot && lastMessage?.content === "") {
          this.messages.pop();
        }

        // 添加错误消息
        this.addMessage({
          id: Date.now().toString(),
          content: error.message || "抱歉，发生了错误，请稍后重试。",
          isBot: true,
          error: true,
        });

        // 显示错误提示
        toast({
          variant: "destructive",
          title: "消息发送失败",
          description: error.message || "消息发送失败，请稍后重试",
          duration: 2000,
        });

        throw error; // 继续抛出错误以便上层处理
      } finally {
        this.isLoadingMessage = false;
      }
    },

    // 开始新对话
    startNewConversation() {
      this.clearMessages();
      setTimeout(() => {
        this.showUserInputForm = this.hasConfigInputs;
        // 如果存在开场白，添加一条AI消息
        if (this.appParameters?.opening_statement) {
          this.addMessage({
            id: Date.now().toString(),
            content: this.appParameters.opening_statement,
            isBot: true,
          });
        }
      });
    },

    // 获取会话
    async getMessages(conversation_id: string) {
      this.currentConversationId = conversation_id;
      this.isMessagesLoading = true;

      try {
        // 检查缓存
        const cachedData = this.messageCache.get(conversation_id);
        if (cachedData) {
          // 使用缓存数据
          this.messages = cachedData.messages;
          this.firstMessageId = cachedData.firstMessageId;
          this.hasMoreMessages = cachedData.hasMoreMessages;
          this.isMessagesLoading = false;
          return;
        }

        // 如果没有缓存，从服务器加载
        this.messages = [];
        this.firstMessageId = null;
        await this.fetchMessages();
      } catch (error: any) {
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "加载失败",
          description: error.message || "无法加载对话内容",
          duration: 2000,
        });
      } finally {
        this.isMessagesLoading = false;
      }
    },

    // 加载会话历史消息
    async fetchMessages(loadMore = false) {
      const { user } = useUser();
      if (!user.value || !this.currentConversationId) return;

      try {
        // 如果加载更多，不使用缓存
        if (!loadMore) {
          const cachedData = this.messageCache.get(this.currentConversationId);
          if (cachedData) {
            this.messages = cachedData.messages;
            this.firstMessageId = cachedData.firstMessageId;
            this.hasMoreMessages = cachedData.hasMoreMessages;
            return;
          }
        }

        const params = {
          conversation_id: this.currentConversationId,
          user: user.value.id,
          limit: "20",
          ...(loadMore && this.firstMessageId
            ? { first_id: this.firstMessageId }
            : {}),
        };

        const data = await $fetch<ApiResponse<ChatMessage>>(api.dify.messages, {
          method: "GET",
          params,
          headers: {
            "X-App-ID": this.appid || "",
          },
        });

        // 转换消息
        const newMessages: Message[] = [];
        data.data.forEach((msg: ChatMessage) => {
          if (msg.query) {
            newMessages.push({
              id: msg.id + "-query",
              content: msg.query,
              isBot: false,
              files: msg.message_files
                ?.filter((file) => {
                  return file.belongs_to === "user";
                })
                ?.map((file) => ({
                  id: file.id,
                  name: file.filename,
                  size: file.size,
                  mime_type: file.mime_type,
                  type: file.type,
                  url: file.url,
                })),
            });
          }
          if (msg.answer) {
            newMessages.push({
              id: msg.id + "-answer",
              content: msg.answer,
              isBot: true,
              feedback: msg.feedback as Message["feedback"],
              files: msg.message_files
                ?.filter((file) => {
                  return file.belongs_to === "assistant";
                })
                ?.map((file) => ({
                  id: file.id,
                  name: file.filename,
                  size: file.size,
                  mime_type: file.mime_type,
                  type: file.type,
                  url: file.url,
                })),
            });
          }
        });

        // 更新消息列表
        if (loadMore) {
          this.messages = [...newMessages, ...this.messages];
        } else {
          this.messages = newMessages;
        }

        // 更新分页信息
        this.hasMoreMessages = data.has_more;
        if (data.data.length > 0) {
          this.firstMessageId = data.data[0].id;
        }

        // 如果还没有更多消息，并且有开场白，添加开场白
        if (!this.hasMoreMessages && this.openingStatement) {
          if (this.messages.length && this.messages[0].isOpeningStatement) {
            return;
          }
          this.messages.unshift({
            id: Date.now().toString(),
            content: this.openingStatement,
            isBot: true,
            isOpeningStatement: true,
          });
        }

        // 更新缓存
        if (!loadMore) {
          this.messageCache.set(this.currentConversationId, {
            messages: this.messages,
            firstMessageId: this.firstMessageId,
            hasMoreMessages: this.hasMoreMessages,
          });
        }
      } catch (error: any) {
        console.error("Error loading messages:", error);
        throw error;
      }
    },

    // 重命名会话
    async renameConversation(conversationId: string, newName: string) {
      try {
        const { user } = useUser();
        if (!user.value) return;

        await $fetch(api.dify.renameConversation(conversationId), {
          method: "POST",
          headers: {
            "X-App-ID": this.appid || "",
          },
          body: {
            name: newName,
            user: user.value.id,
            auto_generate: false,
          },
        });

        // 更新本地状态
        const index = this.conversationHistory.findIndex(
          (conversation) => conversation.id === conversationId
        );
        if (index !== -1) {
          this.conversationHistory[index].name = newName;
        }
      } catch (error: any) {
        console.error("Error renaming conversation:", error);
        throw error;
      }
    },

    // 删除会话
    async deleteConversation(conversationId: string) {
      try {
        const { user } = useUser();
        if (!user.value) return;

        await $fetch(api.dify.deleteConversation(conversationId), {
          method: "DELETE",
          headers: {
            "X-App-ID": this.appid || "",
          },
          body: { user: user.value.id },
        });

        // 更新本地状态
        this.conversationHistory = this.conversationHistory.filter(
          (conversation) => conversation.id !== conversationId
        );

        // 如果删除是当前对话，清空当前对话并重置 URL
        if (this.currentConversationId === conversationId) {
          this.startNewConversation();
        }

        // 删除缓存
        this.messageCache.delete(conversationId);
      } catch (error: any) {
        console.error("Error deleting conversation:", error);
        throw error;
      }
    },

    // 清除缓存的方法
    clearCache(conversationId?: string) {
      if (conversationId) {
        this.messageCache.delete(conversationId);
      } else {
        this.messageCache.clear();
      }
    },

    // 清除所有
    clearAll() {
      this.clearMessages();
      this.appInfo = null;
      this.appParameters = null;
    },

    // 上传文件到dify
    async uploadFileToDify(file: File) {
      const { user } = useUser();
      if (!user.value) {
        setTimeout(() => {
          navigateTo("/auth/signin");
        }, 1000);
        throw new Error("用户未登录");
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("user", user.value.id);

      const response = await $fetch<{ id: string }>(api.dify.fileUpload, {
        method: "POST",
        body: formData,
        headers: {
          "X-App-ID": this.appid || "",
        },
      });

      return response;
    },

    // 上传文件
    async uploadFile(file: File) {
      const { user } = useUser();
      const { toast } = useToast();
      const supabase = useSupabaseClient();

      if (!user.value) {
        setTimeout(() => {
          navigateTo("/auth/signin");
        }, 1000);
        throw new Error("用户未登录");
      }

      this.isUploading = true;

      try {
        let uploadedFile: UploadedFile;

        // 判断是否为图片
        if (file.type.startsWith("image/")) {
          // 图片使用 Supabase 上传
          const fileExt = file.name.split(".").pop();
          const fileName = `${crypto.randomUUID()}.${fileExt}`;
          const filePath = `${user.value.id}/${fileName}`;
          const BUCKET_NAME = "dify-files";

          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file, {
              cacheControl: "3600",
              upsert: false,
            });

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

          uploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            url: publicUrl,
            path: filePath,
          };
        } else {
          const response = await this.uploadFileToDify(file);

          uploadedFile = {
            id: crypto.randomUUID(),
            name: file.name,
            size: file.size,
            type: file.type,
            upload_file_id: response.id,
          };
        }

        this.uploadingFiles.push(uploadedFile);
        return uploadedFile;
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "上传失败",
          description: error.message || "文件上传失败",
          duration: 2000,
        });
        throw error;
      } finally {
        this.isUploading = false;
      }
    },

    // 清除上传文件
    clearUploadedFiles() {
      this.uploadingFiles = [];
    },

    // 校验输入
    validateUserInputs() {
      let valid = true;
      const { userInputs, userInputFormList } = this;
      const { toast } = useToast();

      for (const field of userInputFormList) {
        const value = userInputs[field.variable];
        if (!value && field.required) {
          toast({
            variant: "destructive",
            title: `${field.label}必填！`,
            duration: 2000,
          });
          valid = false;
          break;
        }

        if (field.type === "text-input" || field.type === "paragraph") {
          if (value && field.max_length && value?.length > field.max_length) {
            toast({
              variant: "destructive",
              title: `${field.label}不能超过${field.max_length}字！`,
              duration: 2000,
            });
            valid = false;
            break;
          }
        }
      }

      return valid;
    },

    // 开始对话
    async startConversationByInputs() {
      if (!this.validateUserInputs()) return;

      this.showUserInputForm = false;
    },

    // 开始文本生成
    async startTextGeneration() {
      if (!this.validateUserInputs()) return;

      try {
        this.isLoadingMessage = true;
        await this.requestTextGeneration();
      } catch (error: any) {
        console.error("Error generating text:", error);
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "生成失败",
          description: error.message || "内容生成失败，请稍后重试",
          duration: 2000,
        });
        this.generatedContent = null;
      } finally {
        this.isLoadingMessage = false;
      }
    },

    // 开始工作流
    async startWorkflow() {
      if (!this.validateUserInputs()) return;

      try {
        this.isLoadingMessage = true;
        await this.requestWorkflow();
      } catch (error: any) {
        console.error("Error generating text:", error);
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "工作流执行失败",
          description: error.message || "执行失败，请稍后重试",
          duration: 2000,
        });
        this.generatedContent = null;
      } finally {
        this.isLoadingMessage = false;
      }
    },

    // 请求文本生成
    async requestTextGeneration() {
      const { user } = useUser();
      const tokenStore = useUserTokenStore();
      const { toast } = useToast();

      if (!user.value) {
        setTimeout(() => {
          navigateTo("/auth/signin");
        }, 1000);
        throw new Error("用户未登录");
      }

      if (
        tokenStore.remainingOnetimeTokens <= 0 &&
        tokenStore.remainingSubscriptionTokens <= 0
      ) {
        toast({
          variant: "destructive",
          description: "Token不足，请充值后再使用",
          action: h(
            ToastAction,
            {
              altText: "去购买",
              onClick: () => {
                navigateTo("/pricing");
              },
            },
            {
              default: () => "去购买",
            }
          ),
        });
        return;
      }

      const { file_upload, ...inputs } = this.userInputs;

      const response = await fetch(api.dify.completionMessages, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": this.appid || "",
        },
        body: JSON.stringify({
          inputs,
          files: file_upload ? [file_upload] : [],
          user: user.value.id,
          response_mode: "streaming",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to generate content");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      let buffer = ""; // 用于存储不完整的数据

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 如果还有剩余数据，确保处理完
          if (buffer.trim()) {
            const remainingMatches = buffer.match(/data: ({.*?})\n\n/gs);
            if (remainingMatches) {
              for (const match of remainingMatches) {
                try {
                  const json = JSON.parse(match.replace("data: ", ""));
                  if (json.event === "message") {
                    accumulatedContent += json.answer || "";
                    this.generatedContent = accumulatedContent;
                    if (json.message_id) {
                      this.currentMessageId = json.message_id;
                    }
                  } else if (json.event === "message_end") {
                    await this.handleTokenDeduction(json.metadata);
                  } else if (json.event === "error") {
                    throw new Error(json.message || "Stream error");
                  }
                } catch (e) {
                  console.warn("Could not parse remaining data:", match);
                }
              }
            }
          }
          break;
        }

        // 将新的chunk添加到buffer中
        buffer += decoder.decode(value, { stream: true });

        // 尝试从buffer中提取完整的消息
        const messages = [];
        let lastIndex = 0;
        const pattern = /data: ({.*?})\n\n/gs;
        let match;

        while ((match = pattern.exec(buffer)) !== null) {
          try {
            const json = JSON.parse(match[1]);
            messages.push(json);
            lastIndex = match.index + match[0].length;
          } catch (e) {
            console.warn("JSON parse error, waiting for more data");
            break;
          }
        }

        // 只保留未处理完的数据
        if (lastIndex > 0) {
          buffer = buffer.slice(lastIndex);
        }

        // 处理完整的消息
        for (const msg of messages) {
          if (msg.event === "message") {
            accumulatedContent += msg.answer || "";
            this.generatedContent = accumulatedContent;
            if (msg.message_id) {
              this.currentMessageId = msg.message_id;
            }
          } else if (msg.event === "message_end") {
            await this.handleTokenDeduction(msg.metadata);
          } else if (msg.event === "error") {
            throw new Error(msg.message || "Stream error");
          }
        }
      }
    },

    // 请求工作流
    async requestWorkflow() {
      const { user } = useUser();
      const tokenStore = useUserTokenStore();
      const { toast } = useToast();

      if (!user.value) {
        setTimeout(() => {
          navigateTo("/auth/signin");
        }, 1000);
        throw new Error("用户未登录");
      }

      if (
        tokenStore.remainingOnetimeTokens <= 0 &&
        tokenStore.remainingSubscriptionTokens <= 0
      ) {
        toast({
          variant: "destructive",
          description: "Token不足，请充值后再使用",
          action: h(
            ToastAction,
            {
              altText: "去购买",
              onClick: () => {
                navigateTo("/pricing");
              },
            },
            {
              default: () => "去购买",
            }
          ),
        });
        return;
      }

      const getValidOutput = (outputs: any) => {
        if (!outputs) return null;

        // 过滤掉系统字段
        const validKeys = Object.keys(outputs).filter(
          (key) => !key.startsWith("sys.")
        );

        // 如果只有一个非系统字段，直接返回它
        if (validKeys.length === 1) {
          return outputs[validKeys[0]];
        }

        // 优先查找包含实际数据的字段
        for (const key of validKeys) {
          const value = outputs[key];
          // 检查是否是JSON字符串
          if (typeof value === "string") {
            try {
              JSON.parse(value);
              return value;
            } catch (e) {
              // 不是JSON，继续检查
            }
          }
          // 检查是否是对象或非空内容
          if (
            value &&
            (typeof value === "object" || typeof value === "string")
          ) {
            return value;
          }
        }

        // 如果没找到有效数据，返回整个outputs对象
        return validKeys.length > 0 ? outputs[validKeys[0]] : null;
      };

      // 清空之前的数据
      this.workflowContent = ""; // 初始化为空字符串而非 null
      this.workflowNodes = [];

      const response = await fetch(api.dify.workflowRun, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-ID": this.appid || "",
        },
        body: JSON.stringify({
          inputs: this.userInputs,
          user: user.value.id,
          response_mode: "streaming",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to run workflow");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let buffer = ""; // 用于存储不完整的数据

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          // 如果还有剩余数据，确保处理完
          if (buffer.trim()) {
            const remainingMatches = buffer.match(/data: ({.*?})\n\n/gs);
            if (remainingMatches) {
              for (const match of remainingMatches) {
                try {
                  const json = JSON.parse(match.replace("data: ", ""));
                  if (json.event === "workflow_finished") {
                    // 如果有最终结果，使用它替换流式内容
                    const finalOutput = getValidOutput(json.data.outputs);
                    if (finalOutput) {
                      this.workflowContent = finalOutput;
                    }
                    this.worflowRunId = json.workflow_run_id;
                    if (json.data.total_tokens) {
                      await this.handleTokenDeduction({
                        usage: { total_tokens: json.data.total_tokens },
                      });
                    }
                  } else if (json.event === "text_chunk") {
                    // 直接更新 workflowContent
                    this.workflowContent =
                      (this.workflowContent || "") + (json.data.text || "");
                  } else if (json.event === "node_finished") {
                    // 为所有节点添加完成事件，包括迭代节点
                    this.workflowNodes.push(json);
                  } else if (json.event === "iteration_completed") {
                    // 处理迭代完成事件 - 这会标记迭代节点为完成状态
                    this.workflowNodes.push(json);
                  } else if (json.event === "iteration_next") {
                    // 处理迭代下一步事件 - 这只更新当前迭代的状态
                    // 查找是否已有相同节点ID的节点
                    const existingIndex = this.workflowNodes.findIndex(
                      (node) =>
                        node.data?.node_id === json.data?.node_id &&
                        (node.event === "node_started" ||
                          node.event === "iteration_next")
                    );

                    if (existingIndex !== -1) {
                      // 更新现有节点的迭代信息
                      this.workflowNodes[existingIndex] = json;
                    } else {
                      // 添加新的迭代节点
                      this.workflowNodes.push(json);
                    }
                  } else if (!json.data?.iteration_id) {
                    // 处理非迭代节点
                    this.workflowNodes.push(json);
                  } else {
                    // 处理带有iteration_id的节点（迭代的子节点）
                    // 确保它们作为正常节点添加，但保留其迭代信息
                    this.workflowNodes.push(json);
                  }
                } catch (e) {
                  console.warn("Could not parse remaining data:", match);
                }
              }
            }
          }
          break;
        }

        // 将新的chunk添加到buffer中
        buffer += decoder.decode(value, { stream: true });

        // 尝试从buffer中提取完整的消息
        const messages = [];
        let lastIndex = 0;
        const pattern = /data: ({.*?})\n\n/gs;
        let match;

        while ((match = pattern.exec(buffer)) !== null) {
          try {
            const json = JSON.parse(match[1]);
            messages.push(json);
            lastIndex = match.index + match[0].length;
          } catch (e) {
            console.warn("JSON parse error, waiting for more data");
            break;
          }
        }

        // 只保留未处理完的数据
        if (lastIndex > 0) {
          buffer = buffer.slice(lastIndex);
        }

        // 处理完整的消息
        for (const msg of messages) {
          if (msg.event === "workflow_finished") {
            // 如果有最终结果，使用它替换流式内容
            const finalOutput = getValidOutput(msg.data.outputs);
            if (finalOutput) {
              this.workflowContent = finalOutput;
            }
            this.worflowRunId = msg.workflow_run_id;
            if (msg.data.total_tokens) {
              await this.handleTokenDeduction({
                usage: { total_tokens: msg.data.total_tokens },
              });
            }
          } else if (msg.event === "text_chunk") {
            // 直接更新 workflowContent
            this.workflowContent =
              (this.workflowContent || "") + (msg.data.text || "");
          } else if (msg.event === "node_finished") {
            // 为所有节点添加完成事件，包括迭代节点
            this.workflowNodes.push(msg);
          } else if (msg.event === "iteration_completed") {
            // 处理迭代完成事件 - 这会标记迭代节点为完成状态
            this.workflowNodes.push(msg);
          } else if (msg.event === "iteration_next") {
            // 处理迭代下一步事件 - 这只更新当前迭代的状态
            // 查找是否已有相同节点ID的节点
            const existingIndex = this.workflowNodes.findIndex(
              (node) =>
                node.data?.node_id === msg.data?.node_id &&
                (node.event === "node_started" ||
                  node.event === "iteration_next")
            );

            if (existingIndex !== -1) {
              // 更新现有节点的迭代信息
              this.workflowNodes[existingIndex] = msg;
            } else {
              // 添加新的迭代节点
              this.workflowNodes.push(msg);
            }
          } else if (!msg.data?.iteration_id) {
            // 处理非迭代节点
            this.workflowNodes.push(msg);
          } else {
            // 处理带有iteration_id的节点（迭代的子节点）
            // 确保它们作为正常节点添加，但保留其迭代信息
            this.workflowNodes.push(msg);
          }
        }
      }
    },

    // 保存生成内容
    async saveCompletionContent() {
      const { user } = useUser();
      const supabase = useSupabaseClient<Database>();
      const { toast } = useToast();

      if (this.type === "completion") {
        if (!user.value || !this.generatedContent || !this.currentMessageId) {
          toast({
            variant: "destructive",
            title: "保存失败",
            description: "无法保存内容，缺少必要信息",
            duration: 2000,
          });
          return;
        }
      } else if (this.type === "workflow") {
        if (!user.value || !this.workflowContent || !this.worflowRunId) {
          toast({
            variant: "destructive",
            title: "保存失败",
            description: "无法保存内容，缺少必要信息",
            duration: 2000,
          });
          return;
        }
      }

      if (!this.appid) {
        toast({
          variant: "destructive",
          title: "保存失败",
          description: "无法保存内容，缺少应用ID",
          duration: 2000,
        });
        return;
      }

      const id =
        this.type === "completion" ? this.currentMessageId : this.worflowRunId;
      const content =
        this.type === "completion"
          ? this.generatedContent
          : this.workflowContent;

      // 检查是否已经保存过
      const existingSaved = this.completionSavedList.find(
        (item) => item.id === id
      );

      if (existingSaved) {
        toast({
          title: "已保存",
          description: "该内容已经保存过了",
          duration: 2000,
        });
        return;
      }

      try {
        const { data, error } = await supabase
          .from(DB_TABLES.DIFY_TEXT_COMPLETION_SAVED)
          .insert({
            id: id,
            query: JSON.stringify(this.userInputs),
            answer: content,
            user_id: user.value?.id,
            app_id: this.appid,
          })
          .select()
          .single();

        if (error) throw error;

        // 添加到列表
        this.completionSavedList.unshift({
          id: data.id,
          content: data.answer,
          created_at: data.created_at,
        });

        toast({
          title: "保存成功",
          description: "内容已保存到我的收藏",
          variant: "success",
          duration: 2000,
        });
      } catch (error: any) {
        console.error("Error saving completion:", error);
        toast({
          variant: "destructive",
          title: "保存失败",
          description: error.message || "无法保存内容",
          duration: 2000,
        });
      }
    },

    // 获取保存的内容列表
    async getCompletionSaved() {
      const { user } = useUser();
      const supabase = useSupabaseClient<Database>();

      if (!user.value || !this.appid) return;

      try {
        const { data, error } = await supabase
          .from(DB_TABLES.DIFY_TEXT_COMPLETION_SAVED)
          .select("*")
          .eq("user_id", user.value.id)
          .eq("app_id", this.appid)
          .order("created_at", { ascending: false });

        if (error) throw error;

        this.completionSavedList = data.map((item) => ({
          id: item.id,
          content: item.answer,
          created_at: item.created_at,
        }));
      } catch (error: any) {
        console.error("Error fetching saved completions:", error);
        const { toast } = useToast();
        toast({
          variant: "destructive",
          title: "获取失败",
          description: error.message || "无法获取保存的内容",
          duration: 2000,
        });
      }
    },

    // 删除保存的内容
    async deleteCompletionSaved(id: string) {
      const { user } = useUser();
      const supabase = useSupabaseClient<Database>();
      const { toast } = useToast();

      if (!user.value) return;

      try {
        const { error } = await supabase
          .from(DB_TABLES.DIFY_TEXT_COMPLETION_SAVED)
          .delete()
          .eq("id", id);

        if (error) throw error;

        // 从列表中移除
        this.completionSavedList = this.completionSavedList.filter(
          (item) => item.id !== id
        );

        toast({
          title: "删除成功",
          description: "内容已删除",
          duration: 2000,
        });
      } catch (error: any) {
        console.error("Error deleting saved completion:", error);
        toast({
          variant: "destructive",
          title: "删除失败",
          description: error.message || "无法删除内容",
          duration: 2000,
        });
      }
    },

    // 处理token扣减
    async handleTokenDeduction(metadata: any) {
      if (!metadata?.usage?.total_tokens) return;

      const tokenStore = useUserTokenStore();
      const totalTokens = metadata.usage.total_tokens;
      const success = await tokenStore.deductTokens(
        totalTokens,
        aiConfig.apps[this.appid as keyof typeof aiConfig.apps]?.name ||
          "unknown"
      );

      if (!success) {
        throw new Error("Token不足，请购买后再使用");
      }
    },

    // 发送反馈（点赞/点踩）
    async sendMessageFeedback(
      messageId: string,
      rating: "like" | "dislike" | null,
      content?: string
    ) {
      const { user } = useUser();
      const { toast } = useToast();

      if (!user.value || !this.appid) {
        toast({
          variant: "destructive",
          title: "操作失败",
          description: "用户未登录或应用ID不存在",
          duration: 2000,
        });
        return false;
      }

      try {
        // 使用新的API端点
        const feedbackUrl = api.dify.messageFeedback;

        // 准备请求数据
        const feedbackData = {
          rating,
          user: user.value.id,
          content: content || "",
          message_id: messageId,
        };

        // 发送请求
        const response = await fetch(feedbackUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-ID": this.appid,
          },
          body: JSON.stringify(feedbackData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to send feedback");
        }

        // 更新本地消息状态
        const messageIndex = this.messages.findIndex(
          (message) => message.id === messageId
        );

        if (messageIndex !== -1) {
          // 使用类型断言
          (this.messages[messageIndex] as any).feedback = rating;
        }

        // 如果在缓存中存在该会话，也更新缓存
        if (this.currentConversationId) {
          const cachedData = this.messageCache.get(this.currentConversationId);
          if (cachedData) {
            const cachedMessageIndex = cachedData.messages.findIndex(
              (message) => message.id === messageId
            );
            if (cachedMessageIndex !== -1) {
              // 使用类型断言
              (cachedData.messages[cachedMessageIndex] as any).feedback =
                rating;
              this.messageCache.set(this.currentConversationId, cachedData);
            }
          }
        }
        return true;
      } catch (error: any) {
        console.error("Error sending message feedback:", error);
        toast({
          variant: "destructive",
          title: "反馈失败",
          description: error.message || "无法发送反馈",
          duration: 2000,
        });
        return false;
      }
    },
  },
});
