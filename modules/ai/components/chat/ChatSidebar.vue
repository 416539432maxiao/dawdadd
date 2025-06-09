<script setup lang="ts">
import { useDifyChatStore } from "@/stores/dify-chat";
import { storeToRefs } from "pinia";
import { useToast } from "@/modules/ui/components/toast/use-toast";
import { useRouter } from "vue-router";
import ChatUserTokenBar from "./ChatUserTokenBar.vue";

const router = useRouter();
const { toast } = useToast();
const difyChatStore = useDifyChatStore();

const {
  conversationHistory,
  currentConversationId,
  hasMoreHistory,
  isLoadingHistory,
  isLoadingApp,
} = storeToRefs(difyChatStore);

const showRenameDialog = ref(false);
const newChatName = ref("");
const selectedChatId = ref("");
const isRenaming = ref(false);
const showDeleteDialog = ref(false);
const isDeleting = ref(false);
const skeletonItems = computed(() => Array(3).fill(null));

const emit = defineEmits<{
  (e: "onclose"): void;
}>();

const handleNewConversation = () => {
  difyChatStore.startNewConversation();
  router.push({
    query: {},
  });
  emit("onclose");
};

// 处理滚动加载
const handleScroll = async (e: Event) => {
  const target = e.target as HTMLElement;
  const { scrollTop, scrollHeight, clientHeight } = target;

  // 当滚动到底部时加载更多、
  if (scrollHeight - scrollTop - clientHeight < 50 && hasMoreHistory.value) {
    await difyChatStore.loadConversations(true);
  }
};

const handleConversationsSelect = async (conversation_id: string) => {
  try {
    // 如果点击的是当前对话，不做任何操作
    if (conversation_id === currentConversationId.value) return;

    difyChatStore.clearMessages();

    await difyChatStore.getMessages(conversation_id);
    router.push({
      query: { conversation_id: conversation_id },
    });
    // 触发选择事件
    emit("onclose");
  } catch (error) {
    console.error("Failed to load conversation:", error);
  }
};

const handleRenameClick = (conversation_id: string, chatName: string) => {
  selectedChatId.value = conversation_id;
  newChatName.value = chatName;
  showRenameDialog.value = true;
};

const handleDeleteClick = (conversation_id: string) => {
  selectedChatId.value = conversation_id;
  showDeleteDialog.value = true;
};

// 处理重命名
const handleRename = async () => {
  if (!newChatName.value.trim() || !selectedChatId.value) return;

  try {
    isRenaming.value = true;
    await difyChatStore.renameConversation(
      selectedChatId.value,
      newChatName.value
    );
    showRenameDialog.value = false;
    toast({
      title: "重命名成功",
      duration: 2000,
    });
    emit("onclose");
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "重命名失败",
      description: error.message,
    });
  } finally {
    isRenaming.value = false;
  }
};

// 处理删除
const handleDelete = async () => {
  if (!selectedChatId.value) return;

  try {
    isDeleting.value = true;
    await difyChatStore.deleteConversation(selectedChatId.value);
    showDeleteDialog.value = false;
    toast({
      title: "删除成功",
      duration: 2000,
    });
    emit("onclose");
  } catch (error: any) {
    toast({
      variant: "destructive",
      title: "删除失败",
      description: error.message,
    });
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <aside class="w-64 border-r dark:border-r-gray-800 h-screen">
    <div class="flex flex-col h-full">
      <ScrollArea class="flex-1" @scroll="handleScroll">
        <div class="flex flex-col h-full p-4">
          <!-- Logo 区域 -->
          <div class="px-2 mb-6">
            <NuxtLink to="/ai">
              <Logo />
            </NuxtLink>
          </div>

          <Button
            class="w-full justify-start dark:text-gray-300"
            variant="outline"
            @click="handleNewConversation"
          >
            <LucidePlus class="mr-2 h-4 w-4" />
            新的对话
          </Button>

          <!-- 历史记录列表 -->
          <div class="space-y-2 flex-1 mt-4">
            <!-- 加载状态骨架图 -->
            <template v-if="isLoadingHistory && isLoadingApp">
              <div
                v-for="(_, index) in skeletonItems"
                :key="index"
                class="px-2 py-1"
              >
                <div class="flex items-center space-x-2">
                  <Skeleton class="h-4 w-4 bg-primary/10" />
                  <Skeleton class="h-8 flex-1 bg-primary/10" />
                </div>
              </div>
            </template>

            <!-- 实际的对话列表 -->
            <template v-else>
              <div
                v-for="conversation in conversationHistory"
                :key="conversation.id"
                class="group relative"
              >
                <Button
                  variant="ghost"
                  class="w-full justify-start text-sm truncate dark:text-gray-300"
                  @click="() => handleConversationsSelect(conversation.id)"
                  :class="[
                    'relative',
                    currentConversationId === conversation.id && 'bg-muted',
                    currentConversationId === conversation.id &&
                      'after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-1 after:h-4/5 after:bg-primary after:rounded-r',
                  ]"
                >
                  <LucideMessageSquare class="mr-2 h-4 w-4" />
                  {{ conversation.name }}
                </Button>

                <!-- 悬浮菜单 -->
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="absolute right-2 top-1/2 -translate-y-1/2 md:opacity-0 md:group-hover:opacity-100"
                    >
                      <LucideMoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      @click="
                        () =>
                          handleRenameClick(
                            conversation?.id,
                            conversation?.name
                          )
                      "
                      class="dark:text-gray-300"
                    >
                      <LucidePencil class="mr-2 h-4 w-4" />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      @click="() => handleDeleteClick(conversation.id)"
                      class="dark:text-gray-300"
                    >
                      <LucideTrash class="mr-2 h-4 w-4" />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </template>
          </div>
        </div>
      </ScrollArea>
      <!-- Token 状态栏 -->
      <ChatUserTokenBar class="mt-4" />
    </div>
    <!-- 重命名对话框 -->
    <Dialog v-model:open="showRenameDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="dark:text-gray-200">重命名对话</DialogTitle>
          <DialogDescription class="dark:text-gray-400">
            请输入新的对话名称
          </DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <Input
            v-model="newChatName"
            placeholder="请输入新的对话名称"
            :disabled="isRenaming"
            @keydown.enter.prevent="handleRename"
            class="dark:text-gray-300"
          />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showRenameDialog = false"
            :disabled="isRenaming"
          >
            取消
          </Button>
          <Button @click="handleRename" :disabled="isRenaming">
            <LucideLoader v-if="isRenaming" class="mr-2 h-4 w-4 animate-spin" />
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- 删除确认对话框 -->
    <Dialog v-model:open="showDeleteDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle class="dark:text-gray-200">确认删除</DialogTitle>
          <DialogDescription class="dark:text-gray-400">
            确定要删除这个对话吗？此操作无法撤销。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            @click="showDeleteDialog = false"
            :disabled="isDeleting"
          >
            取消
          </Button>
          <Button
            variant="destructive"
            @click="handleDelete"
            :disabled="isDeleting"
          >
            <LucideLoader v-if="isDeleting" class="mr-2 h-4 w-4 animate-spin" />
            删除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </aside>
</template>
