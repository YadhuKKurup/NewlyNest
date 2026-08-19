import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#f0f4ff",
          100: "#e0e8ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
        },
        roseGold: {
          50: "#fff1f2",
          100: "#ffe4e6",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(79, 70, 229, 0.25)",
        "glow-emerald": "0 0 25px -5px rgba(16, 185, 129, 0.25)",
        "glow-rose": "0 0 25px -5px rgba(244, 63, 94, 0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
