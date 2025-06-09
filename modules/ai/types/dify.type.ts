export interface Message {
  id: string;
  content: string;
  isBot: boolean;
  messageId?: string;
  error?: boolean;
  files?: UploadedFile[];
  inputs?: Record<string, any>;
  workflows?: WorkflowNode[];
  isOpeningStatement?: boolean;
  feedback?: {
    rating: "like" | "dislike" | null;
  };
}

export interface WorkflowNode {
  event: string;
  workflow_run_id?: string;
  task_id?: string;
  data: {
    id: string;
    node_id?: string;
    node_type: string;
    title: string;
    status?: string;
    elapsed_time?: number;
    // 文本块事件的数据
    text?: string;
    from_variable_selector?: string[];
    // 其他可能的属性
    [key: string]: any;
  };
}

export interface ChatHistory {
  id: string;
  name: string;
  inputs?: Record<string, any>;
  status: string;
  created_at: number;
  updated_at: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  inputs: Record<string, any>;
  query: string;
  answer: string;
  message_files?: {
    id: string;
    filename: string;
    type: string;
    url: string;
    mime_type: string;
    size: number;
    transfer_method: string;
    belongs_to: string;
  }[];
  feedback: null | {
    rating: "like" | "dislike";
  };
  created_at: number;
}

export interface ChatCache {
  messages: Message[];
  firstMessageId: string | null;
  hasMoreMessages: boolean;
}

export interface AppInfo {
  name: string;
  description: string;
  tags: string[];
  url: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  path?: string; // supabase storage path
  upload_file_id?: string; // dify upload file id
}

export type FileType = "document" | "image" | "audio" | "video" | "custom";

export type FileUploadMethod = "local_file" | "remote_url";

export interface ImageTypeUpload {
  detail: "high" | "low";
  enabled: boolean;
  number_limits: number;
  transfer_methods: FileUploadMethod[];
}

export interface FileInput {
  type: "file";
  variable: string;
  label: string;
  required: boolean;
  image?: ImageTypeUpload;
  max_length: number;
  allowed_file_types: FileType[];
  allowed_file_extensions: string[];
  allowed_file_upload_methods: FileUploadMethod[];
}

export interface FileListInput {
  type: "file-list";
  variable: string;
  label: string;
  required: boolean;
  max_length: number;
  image?: ImageTypeUpload;
  allowed_file_types: FileType[];
  allowed_file_extensions: string[];
  allowed_file_upload_methods: FileUploadMethod[];
}

export type InputType = {
  "text-input"?: {
    variable: string;
    label: string;
    required: boolean;
    default?: string;
    type: "text-input";
  };
  paragraph?: {
    variable: string;
    label: string;
    required: boolean;
    default?: string;
    type: "paragraph";
  };
  select?: {
    variable: string;
    label: string;
    required: boolean;
    options: string[];
    default?: string;
    type: "select";
  };
  number?: {
    variable: string;
    label: string;
    required: boolean;
    max_length?: number;
    default?: number;
    type: "number";
  };
  file?: FileInput;
  "file-list"?: FileListInput;
};

export interface AppParameters {
  opening_statement: string;
  suggested_questions: string[];
  suggested_questions_after_answer: {
    enabled: boolean;
  };
  speech_to_text: {
    enabled: boolean;
  };
  text_to_speech: {
    enabled: boolean;
    voice: string;
    language: string;
  };
  retriever_resource: {
    enabled: boolean;
  };
  annotation_reply: {
    enabled: boolean;
  };
  more_like_this: {
    enabled: boolean;
  };
  user_input_form: InputType[];
  sensitive_word_avoidance: {
    enabled: boolean;
  };
  file_upload: {
    enabled: boolean;
    image: ImageTypeUpload;
    allowed_file_types: string[];
    allowed_file_extensions: string[];
    allowed_file_upload_methods: Array<"remote_url" | "local_file">;
    number_limits: number;
    fileUploadConfig: {
      file_size_limit: number;
      batch_count_limit: number;
      image_file_size_limit: number;
      video_file_size_limit: number;
      audio_file_size_limit: number;
      workflow_file_upload_limit: number;
    };
  };
  system_parameters: {
    file_size_limit: number;
    image_file_size_limit: number;
    audio_file_size_limit: number;
    video_file_size_limit: number;
    workflow_file_upload_limit: number;
  };
}

export interface SavedCompletion {
  id: string;
  query: string;
  answer: string;
  user_id: string;
  created_at: string;
}

export interface SavedCompletionInsert
  extends Omit<SavedCompletion, "created_at"> {}

export interface SavedCompletionDisplay {
  id: string;
  content: string;
  created_at: string;
}
