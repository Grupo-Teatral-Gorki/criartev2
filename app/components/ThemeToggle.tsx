"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-9 flex items-center rounded-full transition-all duration-300 p-1 ${
        theme === "dark" 
          ? "bg-gradient-to-r from-slate-700 to-slate-800 theme-shadow-sm" 
          : "bg-gradient-to-r from-accent-400 to-accent-500 theme-shadow-sm"
      } hover:scale-105 border border-white/20`}
    >
      <div
        className={`w-7 h-7 rounded-full bg-white flex items-center justify-center transition-all duration-300 transform theme-shadow-sm ${
          theme === "dark" ? "translate-x-6" : "translate-x-0"
        } hover:scale-110`}
      >
        {theme === "dark" ? (
          <Sun size={16} className="text-accent-500" />
        ) : (
          <Moon size={16} className="text-slate-600" />
        )}
      </div>
    </button>
  );
}
