import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#FF6B35",
          secondary: "#F7931E",
          accent: "#FDC830",
          dark: "#2E3440",
          light: "#ECEFF4",
        },
      },
    },
  },
  plugins: [],
};
export default config;

