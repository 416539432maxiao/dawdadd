const aiConfig: AiConfig = {
  enable: true,
  apps: {
    // 应用1： 前端面试（请自行修改）
    interview: {
      id: "interview",
      name: "教案设计",
      description:
        "一个智能的教案设计助手，帮助教师快速生成教案和教学大纲。",
      icon: "👨‍💻‍",
      iconBgColor: "#e0f2fe",
      type: "chat",
      typeName: "聊天助手",
      path: "/ai/completion/interview",
      apikey: "DIFY_API_KEY_APP_INTERVIEW",
    },

  },
};

interface AiConfig {
  enable: boolean;
  apps: {
    [key: string]: DifyAppConfig;
  };
}

export type AppKey = keyof typeof aiConfig.apps;

export interface DifyAppConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBgColor: string;
  type: string;
  typeName: string;
  path: string;
  tags?: string[];
  apikey: string;
}

export default aiConfig;
