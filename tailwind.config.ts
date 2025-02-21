import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // Enable dark mode using a CSS class
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1d4a5d",
        light: "#ffffff",
        navy: "#111827",
      },
    },
  },
  plugins: [],
};

export default config;
