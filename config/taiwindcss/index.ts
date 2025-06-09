// @ts-ignore
import variablesPlugin from "@mertasan/tailwindcss-variables";
// @ts-ignore
import colorVariable from "@mertasan/tailwindcss-variables/colorVariable";
import containerQueryPlugin from "@tailwindcss/container-queries";
import formsPlugin from "@tailwindcss/forms";
import typographyPlugin from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate";

export const lightVariables = {
  colors: {
    border: "#e2e8f0",
    input: "#e2e8f0",
    ring: "#7c3aed",
    background: "#ffffff",
    foreground: "#020817",
    primary: "#7c3aed",
    "primary-foreground": "#ffffff",
    secondary: "#f1f5f9",
    "secondary-foreground": "#020817",
    destructive: "#ef4444",
    "destructive-foreground": "#ffffff",
    success: "#22c55e",
    "success-foreground": "#ffffff",
    muted: "#f1f5f9",
    "muted-foreground": "#64748b",
    accent: "#f1f5f9",
    "accent-foreground": "#020817",
    popover: "#ffffff",
    "popover-foreground": "#020817",
    card: "#ffffff",
    "card-foreground": "#020817",
    highlight: "#7c3aed",
    "highlight-foreground": "#ffffff",
    "code-bg": "#f1f5f9",
    "code-text": "#334155",
  },
};

export const darkVariables = {
  colors: {
    border: "#27272a",
    input: "#27272a",
    ring: "#7c3aed",
    background: "#09090b",
    foreground: "#fafafa",
    primary: "#7c3aed",
    "primary-foreground": "#ffffff",
    secondary: "#27272a",
    "secondary-foreground": "#fafafa",
    destructive: "#ef4444",
    "destructive-foreground": "#ffffff",
    success: "#22c55e",
    "success-foreground": "#ffffff",
    muted: "#27272a",
    "muted-foreground": "#a1a1aa",
    accent: "#27272a",
    "accent-foreground": "#fafafa",
    popover: "#09090b",
    "popover-foreground": "#fafafa",
    card: "#09090b",
    "card-foreground": "#fafafa",
    highlight: "#7c3aed",
    "highlight-foreground": "#ffffff",
    "code-bg": "#1e293b",
    "code-text": "#e2e8f0",
  },
};

export default {
  content: [],
  darkMode: ["class"],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      boxShadow: {
        sm: "0 2px 8px 0 rgb(0, 0, 0, 0.025), 0 0 1px rgba(0,0,0,0.1)",
        DEFAULT: "0 4px 16px 0 rgb(0, 0, 0, 0.05), 0 0 1px rgba(0,0,0,0.1)",
        md: "0 6px 24px 0 rgb(0, 0, 0, 0.075), 0 0 1px rgba(0,0,0,0.1)",
        lg: "0 8px 32px 0 rgb(0, 0, 0, 0.1), 0 0 1px rgba(0,0,0,0.1)",
        xl: "0 12px 48px 0 rgb(0, 0, 0, 0.125), 0 0 1px rgba(0,0,0,0.1)",
        "2xl": "0 16px 64px 0 rgb(0, 0, 0, 0.15), 0 0 1px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        lg: "0.75rem",
        md: "calc(0.75rem - 2px)",
        sm: "calc(0.75rem - 4px)",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      colors: {
        border: colorVariable("--colors-border"),
        input: colorVariable("--colors-input"),
        ring: colorVariable("--colors-ring"),
        background: colorVariable("--colors-background"),
        foreground: colorVariable("--colors-foreground"),
        primary: {
          DEFAULT: colorVariable("--colors-primary"),
          foreground: colorVariable("--colors-primary-foreground"),
        },
        secondary: {
          DEFAULT: colorVariable("--colors-secondary"),
          foreground: colorVariable("--colors-secondary-foreground"),
        },
        destructive: {
          DEFAULT: colorVariable("--colors-destructive"),
          foreground: colorVariable("--colors-destructive-foreground"),
        },
        success: {
          DEFAULT: colorVariable("--colors-success"),
          foreground: colorVariable("--colors-success-foreground"),
        },
        muted: {
          DEFAULT: colorVariable("--colors-muted"),
          foreground: colorVariable("--colors-muted-foreground"),
        },
        accent: {
          DEFAULT: colorVariable("--colors-accent"),
          foreground: colorVariable("--colors-accent-foreground"),
        },
        popover: {
          DEFAULT: colorVariable("--colors-popover"),
          foreground: colorVariable("--colors-popover-foreground"),
        },
        card: {
          DEFAULT: colorVariable("--colors-card"),
          foreground: colorVariable("--colors-card-foreground"),
        },
        highlight: {
          DEFAULT: colorVariable("--colors-highlight"),
          foreground: colorVariable("--colors-highlight-foreground"),
        },
      },
    },
    variables: {
      DEFAULT: lightVariables,
    },
    darkVariables: {
      DEFAULT: darkVariables,
    },
  },
  plugins: [
    formsPlugin({
      strategy: "base",
    }),
    typographyPlugin,
    animatePlugin,
    containerQueryPlugin,
    variablesPlugin({
      colorVariables: true,
    }),
  ],
} satisfies Config;
