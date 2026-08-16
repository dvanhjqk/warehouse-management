import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'Cambria', 'serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        claude: {
          50: "#FAF2EE",
          100: "#F5E4DB",
          200: "#EBC7B8",
          300: "#E0AA94",
          400: "#D58C71",
          500: "#CC785C", // Claude Primary Terracotta
          600: "#BA664A",
          700: "#9B5038",
          800: "#7B3C28",
          900: "#5C2B1B",
          950: "#3D1A10",
        },
        warm: {
          50: "#FAF8F5", // Claude Background
          100: "#F5F2EB",
          200: "#E8E4DC", // Claude Border
          300: "#D6D1C7",
          400: "#A8A296",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917", // Claude Charcoal
          950: "#141210",
        },
      },
      boxShadow: {
        'claude-xs': '0 1px 2px 0 rgba(25, 23, 22, 0.04)',
        'claude-sm': '0 1px 3px 0 rgba(25, 23, 22, 0.06), 0 1px 2px -1px rgba(25, 23, 22, 0.04)',
        'claude-md': '0 4px 12px -2px rgba(25, 23, 22, 0.08), 0 2px 6px -2px rgba(25, 23, 22, 0.04)',
      },
    },
  },
  plugins: [],
};

export default config;
