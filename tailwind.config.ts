import baseConfig from "./config/taiwindcss";

const config = {
  presets: [baseConfig],
  darkMode: "class",
  content: [
    "./layouts/**/*.{vue,ts}",
    "./modules/**/*.{vue,ts}",
    "./pages/**/*.{vue,ts}",
  ],
  safelist: ["ml-2", "ml-4", "ml-6", "ml-8"],
  theme: {
    extend: {
      screens: {
        'xs': '400px', // 或者你觉得合适的最小双列宽度
      },
      maxWidth: {
        '3xl': '1400px',
      },
      typography: {
        DEFAULT: {
          css: {
            "code::before": {
              content: "none",
            },
            "code::after": {
              content: "none",
            },
            code: {
              backgroundColor: "var(--colors-code-bg)",
              color: "var(--colors-code-text)",
              padding: "0.2em 0.4em",
              borderRadius: "0.25rem",
              fontSize: "0.875em",
            },
          },
        },
      },
    },
  },
};

export default config;
