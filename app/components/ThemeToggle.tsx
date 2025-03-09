"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-8 flex items-center rounded-full transition-colors bg-navy`}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white flex items-center justify-center transition-transform duration-300 transform
          ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
      >
        {theme === "dark" ? (
          <Sun size={16} className="text-primary" />
        ) : (
          <Moon size={16} className="text-navy" />
        )}
      </div>
    </button>
  );
}
