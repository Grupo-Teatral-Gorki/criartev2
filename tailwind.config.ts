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
        bgDark: "#0f2a36",
        light: "#ffffff",
        navy: "#1f2937",
        orange: "#f7a251",
      },
      animation: {
        "fade-in-left": "fadeInLeft 1s ease-out forwards",
      },
      keyframes: {
        fadeInLeft: {
          "0%": { opacity: "0", transform: "translateX(-100%)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
