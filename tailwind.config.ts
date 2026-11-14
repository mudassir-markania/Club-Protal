import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f0f4f8",
          100: "#d9e2ec",
          200: "#bcccdc",
          300: "#9fb3c8",
          400: "#829ab1",
          500: "#627d98",
          600: "#486581",
          700: "#334e68",
          800: "#1E3E62",
          900: "#0B192C",
          950: "#060D17",
        },
        brand: {
          primary: "#0B192C",
          secondary: "#1E3E62",
          accent: "#2563EB",
          light: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};
export default config;

