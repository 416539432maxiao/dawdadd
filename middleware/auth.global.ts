/**
 * 全局认证中间件
 * 1. 用于处理邮箱验证链接问题
 */
export default defineNuxtRouteMiddleware((to, from) => {
  // 处理邮箱验证链接
  if (to.path === '/' && 
      (to.query.error === 'access_denied' || to.hash.includes('error=access_denied')) &&
      (to.query.error_code === 'otp_expired' || to.hash.includes('error_code=otp_expired'))) {
    // 如果是在首页遇到邮箱验证错误，重定向到验证页面
    return navigateTo('/auth/callback' + to.fullPath.substring(1));
  }
  
  // 捕获任何含有 access_token 和 refresh_token 的请求，重定向到回调处理页面
  if ((to.hash && to.hash.includes('access_token')) || 
      (to.query.access_token && to.query.refresh_token)) {
    if (to.path !== '/auth/callback') {
      return navigateTo('/auth/callback' + to.fullPath.substring(1));
    }
  }
}); 