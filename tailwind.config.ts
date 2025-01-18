import type { Config } from "tailwindcss";

export default {
  darkMode: "class"
  ,
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        "ctab": { max: "910px" },
        "cphone": { max: "600px" }
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'gradient-start': '#0795ec75', 'gradient-end': '#222e5575'
      },
      keyframes: {
        "skeleton": {
          "0%": { opacity: "0%" },
          "50%": { opacity: "100%" },
          "100%": { opacity: "0%" }
        }
      },
      animation: {
        "skeleton": "skeleton 1.4s infinite"
      }

    },
  },
  plugins: [
    require("tailwind-scrollbar"),
  ],
} satisfies Config;
