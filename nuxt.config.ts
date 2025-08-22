// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-12-12",
  devtools:{enabled:true}
  vite: {
    optimizeDeps: {
      exclude: ["vee-validate"],
    },
  },
  runtimeConfig: {
    // 公共配置 (客户端可用)
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000",
    },
  },
  routeRules: {
    "/docs/**": {
      prerender: true,
    },
    "/blog/**": {
      prerender: true,
    },
  },
  devtools: { enabled: true },
  components: [
    { path: "@/modules/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/shared/components", pathPrefix: false },
    { path: "@/modules/marketing/home/components", pathPrefix: false },
    { path: "@/modules/ai/components", pathPrefix: false },
    { path: "@/modules/marketing/blog/components", pathPrefix: false },
    { path: "@/modules/marketing/faq/components", pathPrefix: false },
    { path: "@/modules/marketing/changelog/components", pathPrefix: false },
    { path: "@/modules/marketing/content/components", pathPrefix: false },
    { path: "@/modules/marketing/pricing/components", pathPrefix: false },
    { path: "@/modules/saas/admin/components", pathPrefix: false },
    { path: "@/modules/saas/auth/components", pathPrefix: false },
    { path: "@/modules/saas/dashboard/components", pathPrefix: false },
    { path: "@/modules/saas/onboarding/components", pathPrefix: false },
    { path: "@/modules/saas/settings/components", pathPrefix: false },
    { path: "@/modules/saas/shared/components", pathPrefix: false },
  ],

  imports: {
    dirs: [
      "modules/saas/auth/composables/**",
      "modules/saas/dashboard/composables/**",
      "modules/saas/shared/**",
      "modules/shared/composables/**",
      "modules/shared/utils/**",
      "modules/ui/lib/**",
      "modules/marketing/content/**",
      "modules/billing/composables/**",
      "modules/billing/utils/**",
    ],
  },

  modules: [
    "@nuxtjs/tailwindcss",
    "nuxt-lucide-icons",
    "@vueuse/nuxt",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxtjs/supabase",
    "@nuxt/content",
    "@nuxtjs/robots",
    "@nuxtjs/sitemap",
    "@pinia/nuxt",
  ],

  //shadcn
  shadcn: {
    prefix: "",
    componentDir: "./modules/ui/components",
  },

  // supabase
  supabase: {
    redirectOptions: {
      login: "/auth/signin",
      callback: "/dashboard",
      include: ["/dashboard/*", "/dashboard"],
      exclude: [],
      cookieRedirect: true,
    },
    cookieOptions: {
      domain: "",
      path: "/",
      sameSite: "lax",
    },
  },

  // @nuxt/content
  content: {
    highlight: {
      theme: "github-dark",
      preload: ["sql", "bash", "javascript", "typescript", "vue", "markdown"],
    },
    documentDriven: false,
    markdown: {
      toc: {
        depth: 3,
        searchDepth: 3,
      },
    },
  },

  // @nuxtjs/color-mode
  colorMode: {
    preference: "light",
    fallback: "light",
    classSuffix: "",
    storageKey: "NUXT_COLOR_MODE",
  },

  // nitro
  nitro: {
    prerender: {
      routes: ["/sitemap.xml", "/robots.txt"],
    },
  },

  // site
  sitemap: {
    autoLastmod: true,
    include: ["/**"],
    discoverImages: true,
    sources: ["/api/__sitemap__/urls"],
  },
  robots: {
    sitemap: `${process.env.NUXT_PUBLIC_SITE_URL}/sitemap.xml`,
  },
});
