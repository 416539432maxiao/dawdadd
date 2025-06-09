import {
  LucidePlay,
  LucideSquare,
  LucideBrain,
  LucideBook,
  LucideGitBranch,
  LucideCode,
  LucideFileText,
  LucideList,
  LucideGlobe,
  LucidePenTool,
  LucideDatabase,
  LucideRepeat,
  LucideFilter,
  LucideClipboard,
  LucideMessageSquare,
} from "lucide-vue-next";

export const NODE_TYPES = {
  START: {
    type: "start",
    icon: LucidePlay,
    color: "bg-blue-500", // 蓝色
  },
  END: {
    type: "end",
    icon: LucideSquare,
    color: "bg-orange-500", // 橙色
  },
  LLM: {
    type: "llm",
    icon: LucideBrain,
    color: "bg-violet-500", // 紫色
  },
  KNOWLEDGE_RETRIEVAL: {
    type: "knowledge-retrieval",
    icon: LucideBook,
    color: "bg-emerald-500", // 绿色
  },
  IF_ELSE: {
    type: "if-else",
    icon: LucideGitBranch,
    color: "bg-sky-500", // 天蓝色
  },
  CODE: {
    type: "code",
    icon: LucideCode,
    color: "bg-blue-500", // 蓝色
  },
  TEMPLATE_TRANSFORM: {
    type: "template-transform",
    icon: LucideFileText,
    color: "bg-indigo-500", // 靛蓝色
  },
  QUESTION_CLASSIFIER: {
    type: "question-classifier",
    icon: LucideList,
    color: "bg-green-500", // 绿色
  },
  HTTP_REQUEST: {
    type: "http-request",
    icon: LucideGlobe,
    color: "bg-purple-500", // 紫色
  },
  TOOL: {
    type: "tool",
    icon: LucidePenTool,
    color: "bg-gray-500", // 灰色
  },
  VARIABLE_AGGREGATOR: {
    type: "variable-aggregator",
    icon: LucideDatabase,
    color: "bg-blue-500", // 蓝色
  },
  LOOP: {
    type: "loop",
    icon: LucideRepeat,
    color: "bg-cyan-500", // 青色
  },
  ITERATION: {
    type: "iteration",
    icon: LucideRepeat,
    color: "bg-cyan-500", // 青色
  },
  PARAMETER_EXTRACTOR: {
    type: "parameter-extractor",
    icon: LucideFilter,
    color: "bg-teal-500", // 蓝绿色
  },
  VARIABLE_ASSIGNER: {
    type: "assigner",
    icon: LucideClipboard,
    color: "bg-blue-500", // 蓝色
  },
  DOCUMENT_EXTRACTOR: {
    type: "document-extractor",
    icon: LucideFileText,
    color: "bg-emerald-500", // 绿色
  },
  ANSWER: {
    type: "answer",
    icon: LucideMessageSquare,
    color: "bg-orange-500", // 橙色
  },
  LIST_OPERATOR: {
    type: "list-operator",
    icon: LucideList,
    color: "bg-cyan-500", // 青色
  },
};
