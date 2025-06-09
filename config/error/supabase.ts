export const supabaseErrorMessages: Record<
  string,
  { statusCode: number; message: string }
> = {
  // 认证相关错误
  "Invalid login credentials": { statusCode: 401, message: "邮箱或密码错误" },
  "Email not confirmed": {
    statusCode: 401,
    message: "邮箱未验证，请先验证邮箱",
  },
  "Invalid verification code": {
    statusCode: 400,
    message: "验证码错误或已过期",
  },
  "Password is too weak": {
    statusCode: 400,
    message: "密码强度太弱，请使用包含大小写字母、数字和特殊字符的密码",
  },
  "User already registered": { statusCode: 409, message: "该用户已注册" },
  "Email already registered": {
    statusCode: 409,
    message: "该邮箱已被注册，请直接登录或使用其他邮箱",
  },
  "Phone number already registered": {
    statusCode: 409,
    message: "该手机号已被注册，请直接登录或使用其他手机号",
  },
  "Invalid phone number": {
    statusCode: 400,
    message: "无效的手机号，请检查格式是否正确",
  },
  "Invalid email": {
    statusCode: 400,
    message: "无效的邮箱地址，请检查格式是否正确",
  },
  "Password recovery email sent": {
    statusCode: 200,
    message: "密码重置邮件已发送，请查收",
  },
  "New password is same as old password": {
    statusCode: 400,
    message: "新密码不能与旧密码相同",
  },
  "Password must be at least 6 characters": {
    statusCode: 400,
    message: "密码长度至少为6个字符",
  },
  "Token has expired or is invalid": {
    statusCode: 401,
    message: "验证码已过期或无效，请重新获取",
  },

  // 会话相关错误
  "JWT expired": { statusCode: 401, message: "登录已过期，请重新登录" },
  "Invalid JWT": { statusCode: 401, message: "无效的登录状态，请重新登录" },
  "Session not found": { statusCode: 401, message: "会话已失效，请重新登录" },
  "Session expired": { statusCode: 401, message: "会话已过期，请重新登录" },

  // 权限相关错误
  "Not authorized": {
    statusCode: 403,
    message: "没有操作权限，请确认账号权限",
  },
  "Insufficient permissions": {
    statusCode: 403,
    message: "权限不足，请联系管理员",
  },
  "Role not found": { statusCode: 404, message: "用户角色不存在" },

  // 数据相关错误
  "Database error": { statusCode: 500, message: "数据库操作失败，请稍后重试" },
  "Row not found": { statusCode: 404, message: "未找到相关数据" },
  "Foreign key violation": { statusCode: 409, message: "数据关联错误" },
  "Duplicate key violation": { statusCode: 409, message: "数据重复" },

  // 存储相关错误
  "Storage quota exceeded": {
    statusCode: 507,
    message: "存储空间已满，请清理后重试",
  },
  "File size too large": { statusCode: 413, message: "文件大小超出限制" },
  "Invalid file type": { statusCode: 415, message: "不支持的文件类型" },

  // 通用错误
  "Request failed": { statusCode: 400, message: "请求失败，请稍后重试" },
  "Rate limit exceeded": {
    statusCode: 429,
    message: "请求过于频繁，请稍后再试",
  },
  "Service not available": {
    statusCode: 503,
    message: "服务暂时不可用，请稍后再试",
  },
  "Network error": { statusCode: 503, message: "网络连接错误，请检查网络设置" },
  "Internal server error": {
    statusCode: 500,
    message: "服务器内部错误，请稍后重试",
  },
  "Bad gateway": { statusCode: 502, message: "网关错误，请稍后重试" },
  "Service timeout": { statusCode: 504, message: "服务响应超时，请稍后重试" },
};
