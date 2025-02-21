"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as
      | "light"
      | "dark"
      | null;
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const initialTheme = storedTheme || (prefersDark ? "dark" : "light");
    setTheme(initialTheme);

    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-8 flex items-center rounded-full transition-colors
        ${theme === "dark" ? "bg-navy" : "bg-primary"}`}
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
