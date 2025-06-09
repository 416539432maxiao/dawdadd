-- dify_text_completion_saved表: 创建文本生成保存记录表
create table if not exists public.dify_text_completion_saved (
    id uuid not null,
    query text not null,
    answer text not null,
    user_id uuid not null,
    app_id text not null,
    created_at timestamp with time zone not null default now(),
    constraint dify_text_completion_saved_pkey primary key (id)
);

-- 创建更新时间触发器
create trigger update_dify_text_completion_saved_updated_at
    before update on dify_text_completion_saved
    for each row
    execute function update_updated_at_column();

-- 启用RLS
alter table public.dify_text_completion_saved enable row level security;

-- 删除旧的策略（如果存在）
drop policy if exists dify_text_completion_saved_policy on public.dify_text_completion_saved;

-- 创建读取策略
create policy "dify_text_completion_saved_select_policy"
    on public.dify_text_completion_saved
    for select
    using (auth.uid() = user_id);

-- 创建插入策略
create policy "dify_text_completion_saved_insert_policy"
    on public.dify_text_completion_saved
    for insert
    with check (auth.uid() = user_id);

-- 创建删除策略
create policy "dify_text_completion_saved_delete_policy"
    on public.dify_text_completion_saved
    for delete
    using (auth.uid() = user_id);

