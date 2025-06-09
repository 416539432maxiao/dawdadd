export type FileType = "document" | "image" | "audio" | "video" | "custom";

export const FILE_TYPES = {
  document: {
    extensions: [
      "txt",
      "md",
      "markdown",
      "pdf",
      "html",
      "xlsx",
      "xls",
      "docx",
      "csv",
      "eml",
      "msg",
      "pptx",
      "ppt",
      "xml",
      "epub",
    ],
    mimeTypes: [
      "text/plain",
      "text/markdown",
      "text/xml",
      "application/pdf",
      "text/html",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/csv",
      "message/rfc822",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-powerpoint",
      "application/xml",
      "application/epub+zip",
    ] as const,
  },
  image: {
    extensions: ["jpg", "jpeg", "png", "gif", "webp", "svg"],
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ] as const,
  },
  audio: {
    extensions: ["mp3", "m4a", "wav", "webm", "amr"],
    mimeTypes: [
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
      "audio/webm",
      "audio/amr",
    ] as const,
  },
  video: {
    extensions: ["mp4", "mov", "mpeg", "mpga"],
    mimeTypes: [
      "video/mp4",
      "video/quicktime",
      "video/mpeg",
      "audio/mpeg",
    ] as const,
  },
} as const;

export type MimeType =
  (typeof FILE_TYPES)[keyof typeof FILE_TYPES]["mimeTypes"][number];

// 根据文件获取filetype
export const getFileTypeByFile = (file: File): FileType => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  const mimeType = file.type;

  for (const [fileType, config] of Object.entries(FILE_TYPES)) {
    if (
      (extension && config.extensions.includes(extension as never)) ||
      config.mimeTypes.includes(mimeType as never)
    ) {
      return fileType as FileType;
    }
  }

  return "custom";
};

// 计算允许的文件类型
export const getAllowedMimeTypes = (
  allowedFileTypes?: FileType[]
): string[] => {
  if (!allowedFileTypes?.length) return [];

  return allowedFileTypes.flatMap((type) => {
    if (type === "custom") return [];
    return FILE_TYPES[type as keyof typeof FILE_TYPES]?.mimeTypes || [];
  });
};

// 计算允许的文件扩展名
export const getAllowedExtensions = (
  allowedFileTypes?: FileType[]
): string[] => {
  if (!allowedFileTypes?.length) return [];

  return allowedFileTypes.flatMap((type) => {
    if (type === "custom") return [];
    return FILE_TYPES[type as keyof typeof FILE_TYPES]?.extensions || [];
  });
};

// 验证文件类型
export const validateFileType = (
  file: File,
  allowedFileTypes?: FileType[]
): boolean => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const extensions = getAllowedExtensions(allowedFileTypes);
  const mimeTypes = getAllowedMimeTypes(allowedFileTypes);

  const isValidExtension =
    extensions.length === 0 || (extension && extensions.includes(extension));

  const isValidMimeType =
    mimeTypes.length === 0 ||
    mimeTypes.some((mimeType) => file.type === mimeType);

  // 如果允许自定义类型，则不需要验证
  if (allowedFileTypes?.includes("custom")) {
    return true;
  }
  return Boolean(isValidExtension && isValidMimeType);
};

// 计算文件选择器的 accept 属性
export const getInputAccept = (allowedFileTypes?: FileType[]): string => {
  if (!allowedFileTypes?.length) return "";

  const acceptTypes: string[] = [];

  allowedFileTypes.forEach((type) => {
    if (type === "custom") return;
    const fileType = FILE_TYPES[type as keyof typeof FILE_TYPES];
    if (fileType) {
      // 添加 MIME 类型
      acceptTypes.push(...fileType.mimeTypes);
      // 添加文件扩展名
      acceptTypes.push(...fileType.extensions.map((ext) => `.${ext}`));
    }
  });

  return acceptTypes.join(",");
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// 根据mime类型获取文件类型
export const getFileTypeByMimeType = (mimeType: string): FileType => {
  for (const [fileType, config] of Object.entries(FILE_TYPES)) {
    if (config.mimeTypes.includes(mimeType as never)) {
      return fileType as FileType;
    }
  }
  return "custom";
};
