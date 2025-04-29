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
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="p-8 rounded-lg shadow-lg bg-slate-200 dark:bg-gray-900 w-96">
        <div className="flex-grow flex justify-center mb-4">
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
        <div className="flex justify-around mb-4">
          {["login", "register"].map((type) => (
            <button
              key={type}
              className={`px-4 py-2 transition-colors duration-200 ${
                tab === type
                  ? "border-b-2 border-primary font-semibold"
                  : "text-gray-500"
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
