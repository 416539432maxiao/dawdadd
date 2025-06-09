import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const url = new URL(event.node.req.url || "", "http://localhost");
  const code = url.searchParams.get("code");
  // 支持自定义重定向
  const next = url.searchParams.get("next") ?? "/dashboard";

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      code || ""
    );

    if (error) {
      // 重定向到错误页面而不是抛出错误
      return sendRedirect(event, "/auth/auth-code-error");
    }

    // 处理重定向
    const forwardedHost = event.node.req.headers["x-forwarded-host"];
    const origin = process.dev
      ? event.node.req.headers.origin
      : `https://${forwardedHost || event.node.req.headers.host}`;

    return sendRedirect(event, `${origin}${next}`);
  } catch (error: any) {
    return sendRedirect(event, "/auth/auth-code-error");
  }
});
