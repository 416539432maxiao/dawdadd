<template>
  <div class="flex flex-col space-y-4">
    <h2 class="text-2xl font-bold tracking-tight text-foreground">笔记演示</h2>
    <p class="text-sm text-muted-foreground">
      一个简单的 Supabase CRUD 操作演示
    </p>

    <div class="flex flex-col md:flex-row gap-6">
      <!-- 左侧输入区域 -->
      <div class="w-full md:w-1/2">
        <Form @submit="handleSubmit">
          <div class="space-y-4">
            <FormField name="content">
              <FormItem>
                <FormControl>
                  <Textarea
                    v-model="noteContent"
                    placeholder="在此输入你的笔记..."
                    class="min-h-[200px] dark:bg-zinc-900 dark:text-gray-100"
                  />
                </FormControl>
              </FormItem>
            </FormField>
            <Button
              type="submit"
              :disabled="isLoading"
              class="w-full md:w-auto"
            >
              {{ isEditing ? "更新笔记" : "添加笔记" }}
            </Button>
          </div>
        </Form>
      </div>

      <!-- 右侧列表区域 -->
      <div class="w-full md:w-1/2 mt-6 md:mt-0">
        <div class="space-y-4">
          <div
            v-if="notes.length === 0"
            class="text-center p-4 text-muted-foreground border rounded-md h-[200px] flex items-center justify-center text-sm"
          >
            {{ isFetching ? "加载中..." : "暂无笔记" }}
          </div>
          <Card
            v-else
            v-for="note in notes"
            :key="note.id"
            class="p-4 dark:bg-zinc-900 dark:border-gray-700"
          >
            <div
              class="flex flex-col md:flex-row justify-between items-start gap-4"
            >
              <p class="text-sm dark:text-gray-200 flex-1 whitespace-pre-wrap">
                {{ note.content }}
              </p>
              <div class="flex gap-2 w-full md:w-auto justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleEdit(note)"
                  class="dark:hover:bg-gray-700"
                >
                  <LucidePencil class="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  @click="handleDelete(note.id)"
                  class="dark:hover:bg-gray-700"
                >
                  <LucideTrash class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p class="text-xs text-muted-foreground mt-2 dark:text-gray-400">
              创建时间: {{ new Date(note.created_at).toLocaleString() }}
            </p>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useToast } from "@/modules/ui/components/toast/use-toast";
import type { Note, Database } from "@/modules/shared/types/database.types";

const { user } = useUser();

const supabase = useSupabaseClient<Database>();
const { toast } = useToast();

const TABLE_NAMAE = "nuxtbase_demo_notes";
const notes = ref<Note[]>([]);
const noteContent = ref("");
const isLoading = ref(false);
const isEditing = ref(false);
const isFetching = ref(true);
const editingNoteId = ref<number | null>(null);

// 获取笔记列表
const fetchNotes = async () => {
  isFetching.value = true;
  try {
    const { data, error } = await supabase
      .from("nuxtbase_demo_notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    notes.value = data || [];
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isFetching.value = false;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!noteContent.value.trim()) return;

  isLoading.value = true;
  try {
    if (isEditing.value && editingNoteId.value) {
      const { error } = await supabase
        .from("nuxtbase_demo_notes")
        .update({
          content: noteContent.value,
        })
        .eq("id", editingNoteId.value)
        .eq("user_id", user.value?.id);

      if (error) throw error;
      toast({
        title: "成功",
        description: "笔记已更新",
        duration: 2000,
      });
    } else {
      const { error } = await supabase.from("nuxtbase_demo_notes").insert({
        content: noteContent.value,
      });

      if (error) throw error;
      toast({
        title: "成功",
        description: "笔记已创建",
        duration: 2000,
      });
    }

    noteContent.value = "";
    isEditing.value = false;
    editingNoteId.value = null;
    await fetchNotes();
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  } finally {
    isLoading.value = false;
  }
};

// 编辑笔记
const handleEdit = (note: Note) => {
  noteContent.value = note.content;
  editingNoteId.value = note.id;
  isEditing.value = true;
};

// 删除笔记
const handleDelete = async (id: number) => {
  if (!window.confirm("确定要删除这条笔记吗？")) return;

  try {
    const { error } = await supabase.from(TABLE_NAMAE).delete().eq("id", id);

    if (error) throw error;
    toast({
      title: "成功",
      description: "笔记已删除",
      duration: 2000,
    });
    await fetchNotes();
  } catch (error: any) {
    toast({
      title: "错误",
      description: error.message,
      variant: "destructive",
      duration: 2000,
    });
  }
};

// 组件加载时获取笔记列表
onMounted(() => {
  fetchNotes();
});
</script>
