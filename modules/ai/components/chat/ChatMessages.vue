<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";
import { storeToRefs } from "pinia";
import lodash from "lodash";

// 为消息扩展类型，添加复制成功状态
interface MessageWithUI extends Record<string, any> {
  copySuccess?: boolean;
}

const difyChatStore = useDifyChatStore();

const {
  messages,
  isLoadingMessage,
  isMessagesLoading,
  hasMoreMessages,
  currentConversationId,
} = storeToRefs(difyChatStore);

// 消息容器的引用
const messageContainer = ref<HTMLElement | null>(null);
const scrollInterval = ref<ReturnType<typeof setInterval> | null>(null);
const isLoadingMore = ref(false);

// 记录上一次的滚动位置
const lastScrollTop = ref(0);

// 滚动到底部
const scrollToBottom = () => {
  if (messageContainer.value) {
    messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
  }
};

// 处理加载更多消息
const handleLoadMore = lodash.debounce(async () => {
  if (
    hasMoreMessages.value &&
    !isLoadingMessage.value &&
    !isLoadingMore.value
  ) {
    isLoadingMore.value = true;

    // 获取当前第一条消息的DOM元素
    const firstMessage = messages.value?.[0];
    const messageElement = document.getElementById(
      `message-${firstMessage?.id}`
    );

    await difyChatStore.fetchMessages(true);

    nextTick(() => {
      // 滚动到之前的消息位置
      if (messageElement) {
        messageElement.scrollIntoView();
      }
      isLoadingMore.value = false;
    });
  }
}, 200);

// 处理消息列表滚动
const handleMessagesScroll = (e: Event) => {
  const target = e.target as HTMLElement;
  const { scrollTop } = target;

  // 判断是否是向上滚动
  const isScrollingUp = scrollTop < lastScrollTop.value;
  lastScrollTop.value = scrollTop;

  // 当向上滚动到顶部时加载更多历史消息
  if (isScrollingUp && scrollTop < 50) {
    handleLoadMore();
  }
};

// 设置自动滚动
const setupAutoScroll = () => {
  // 清除已存在的定时器
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  }

  // 如果正在加载，设置定时滚动
  if (isLoadingMessage.value) {
    scrollInterval.value = setInterval(scrollToBottom, 1000);
  }
};

const handleEditInput = () => {
  difyChatStore.showUserInputForm = true;
  difyChatStore.showUserInputFormCancelBtn = true;
};

// 处理消息操作
const handleCopyMessage = (message: MessageWithUI) => {
  if (message.content) {
    navigator.clipboard.writeText(message.content.trim())
      .then(() => {
        // 添加复制成功的临时状态
        message.copySuccess = true;
        // 1.5秒后重置状态
        setTimeout(() => {
          message.copySuccess = false;
        }, 1500);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  }
};

const handleRefreshMessage = (message: MessageWithUI) => {
  // 实现刷新消息的逻辑
  // 可能需要调用difyChatStore中的方法来重新生成回答
};

// 处理点赞操作
const handleLikeMessage = async (message: MessageWithUI) => {
  // 如果消息没有ID或不是机器人消息，则不处理
  if (!message.id || !message.isBot) return;

  // 如果当前已经点赞，则取消点赞
  const newRating = message.feedback?.rating === "like" ? null : "like";

  // 发送反馈
  await difyChatStore.sendMessageFeedback(
    message.messageId || message.id?.replace("-answer", ""),
    newRating,
    message.content
  );
  
  // 更新消息的feedback字段
  if (newRating === null) {
    message.feedback = null;
  } else {
    message.feedback = { rating: newRating };
  }
};

// 处理点踩操作
const handleDislikeMessage = async (message: MessageWithUI) => {
  // 如果消息没有ID或不是机器人消息，则不处理
  if (!message.id || !message.isBot) return;

  // 如果当前已经点踩，则取消点踩
  const newRating = message.feedback?.rating === "dislike" ? null : "dislike";

  // 发送反馈
  await difyChatStore.sendMessageFeedback(
    message.messageId || message.id?.replace("-answer", ""),
    newRating,
    message.content
  );
  
  // 更新消息的feedback字段
  if (newRating === null) {
    message.feedback = null;
  } else {
    message.feedback = { rating: newRating };
  }
};

watch(isLoadingMessage, (newValue) => {
  if (newValue) {
    setupAutoScroll();
  } else {
    // 停止加载时清除定时器
    if (scrollInterval.value) {
      clearInterval(scrollInterval.value);
      scrollInterval.value = null;
    }
    // 最后再滚动一次确保显示最新消息
    nextTick(() => {
      scrollToBottom();
    });
  }
});

watch(isMessagesLoading, (newValue) => {
  if (!newValue) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

watch(currentConversationId, (newValue) => {
  nextTick(() => {
    scrollToBottom();
  });
});

// 组件卸载时清理定时器
onUnmounted(() => {
  if (scrollInterval.value) {
    clearInterval(scrollInterval.value);
    scrollInterval.value = null;
  }
});

// 初始化时滚动到底部
onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <div
    ref="messageContainer"
    class="flex-1 overflow-y-auto"
    @scroll="handleMessagesScroll"
  >
    <div class="max-w-[780px] mx-auto px-4 py-8 space-y-4">
      <div
        v-if="isMessagesLoading"
        class="py-8 flex flex-col items-center gap-2"
      >
        <LucideLoader class="h-6 w-6 animate-spin text-muted-foreground" />
        <p class="text-xs text-muted-foreground">加载对话内容...</p>
      </div>

      <!-- 加载更多提示 -->
      <div
        v-if="hasMoreMessages && isLoadingMore"
        class="py-2 flex justify-center items-center text-center gap-1 text-sm text-muted-foreground"
      >
        <LucideLoader class="h-4 w-4 animate-spin" />加载中...
      </div>

      <!-- 消息列表 -->
      <div v-if="!isMessagesLoading">
        <SetDifyInputComponentBox
          @edit="handleEditInput"
          v-if="
            difyChatStore.userInputs &&
            Object.keys(difyChatStore.userInputs || {}).length > 0 &&
            messages.length === 0
          "
        />
        <div
          v-else-if="messages.length === 0"
          class="py-8 text-center text-sm text-muted-foreground"
        >
          新的对话
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'flex gap-3 mb-4',
            message.isBot ? 'justify-start' : 'justify-end',
          ]"
        >
          <!-- AI消息 -->
          <template v-if="message.isBot">
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full bg-muted flex-none"
              :id="`message-${message.id}`"
            >
              <LucideBot class="h-5 w-5 text-foreground" />
            </div>
            <div class="flex flex-col max-w-[80%] w-full">
              <ChatWorkflow
                :nodes="message.workflows || []"
                v-if="message.workflows && message.workflows.length > 0"
              />
              <div
                class="relative text-sm p-3 rounded-lg break-words group"
                :class="[
                  message.error
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted',
                ]"
              >
                <MarkdownRender
                  :content="message.content.trim()"
                  is-bot-message
                />
                <!-- 文件预览 -->
                <FilePreview
                  v-if="message.files && message.files.length > 0"
                  :files="message.files!"
                  class="rounded-lg overflow-hidden"
                  readonly
                />

                <!-- 操作按钮 - 仅在鼠标悬浮时显示 -->
                <div
                  class="absolute right-0 bottom-0 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center bg-background shadow-sm rounded-b-md"
                  v-if="!message.isOpeningStatement"
                >
                  <button
                    @click="handleCopyMessage(message as MessageWithUI)"
                    class="p-2 hover:bg-muted rounded-bl-md"
                    :class="{ 'text-primary': (message as MessageWithUI).copySuccess }"
                    title="复制"
                  >
                    <LucideClipboard v-if="!(message as MessageWithUI).copySuccess" class="h-4 w-4" />
                    <LucideCheck v-else class="h-4 w-4" />
                  </button>
                  <!-- <button
                    @click="handleRefreshMessage(message)"
                    class="p-2 hover:bg-muted"
                    title="刷新"
                  >
                    <LucideRefreshCw class="h-4 w-4" />
                  </button> -->
                  <!-- 显示点赞按钮 - 仅当没有反馈或反馈为like时显示 -->
                  <button
                    v-if="!message.feedback || message.feedback?.rating === 'like'"
                    @click="handleLikeMessage(message)"
                    class="p-2 hover:bg-muted"
                    :class="{ 'text-primary': message.feedback?.rating === 'like' }"
                    title="点赞"
                  >
                    <LucideThumbsUp class="h-4 w-4" />
                  </button>
                  <!-- 显示点踩按钮 - 仅当没有反馈或反馈为dislike时显示 -->
                  <button
                    v-if="!message.feedback || message.feedback?.rating === 'dislike'"
                    @click="handleDislikeMessage(message)"
                    class="p-2 hover:bg-muted"
                    :class="[
                      { 'text-primary': message.feedback?.rating === 'dislike' },
                      message.feedback?.rating === 'dislike' ? 'rounded-br-md' : ''
                    ]"
                    title="踩"
                  >
                    <LucideThumbsDown class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </template>

          <!-- 用户消息 -->
          <template v-else>
            <div
              class="flex flex-col items-end max-w-[80%] w-full gap-2"
              :id="`message-${message.id}`"
            >
              <div class="flex flex-col gap-2">
                <!-- 消息内容 -->
                <div
                  class="bg-primary text-primary-foreground text-sm p-3 rounded-lg break-words"
                >
                  <MarkdownRender
                    :content="message.content?.trim()"
                    is-user-message
                  />
                  <!-- 文件预览 -->
                  <FilePreview
                    v-if="message.files && message.files.length > 0"
                    :files="message.files!"
                    class="rounded-lg overflow-hidden"
                    readonly
                  />
                </div>
              </div>
            </div>
            <div
              class="w-8 h-8 flex items-center justify-center rounded-full bg-primary flex-none"
            >
              <LucideUser class="h-5 w-5 text-primary-foreground" />
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 确保操作按钮在悬浮时位于消息上方 */
.group:hover .group-hover\:opacity-100 {
  display: flex;
}
</style>
