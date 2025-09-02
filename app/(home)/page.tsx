"use client";

import { useState } from "react";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import ThemeToggle from "../components/ThemeToggle";
import Footer from "../components/Footer";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { theme } = useTheme(); // Theme Context
  const [tab, setTab] = useState<"login" | "register">("login");

  const renderForm = () => {
    return tab === "login" ? <LoginForm /> : <RegisterForm />;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-accent-100/20 dark:from-primary-900/10 dark:to-accent-900/10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-10 p-8 rounded-3xl shadow-soft-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 w-96 animate-fade-in-up">
        <div className="flex-grow flex justify-center mb-8">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
            <Image
              src={
                theme === "dark"
                  ? "https://styxx-public.s3.sa-east-1.amazonaws.com/logo-criarte.png"
                  : "https://styxx-public.s3.sa-east-1.amazonaws.com/logo_criarte_black.png"
              }
              alt="Logo Criarte"
              width={120}
              height={40}
              className="object-contain"
            />
          </div>
        </div>
        
        <div className="flex justify-center mb-6 bg-slate-100 dark:bg-slate-700/50 rounded-2xl p-1">
          {["login", "register"].map((type) => (
            <button
              key={type}
              className={`flex-1 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                tab === type
                  ? "bg-white dark:bg-slate-600 text-primary-600 dark:text-primary-400 shadow-soft"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
              onClick={() => setTab(type as "login" | "register")}
            >
              {type === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {renderForm()}
      </div>
      <Footer />
    </div>
  );
}
