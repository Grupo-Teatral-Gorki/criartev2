"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { loginUser, registerUser } from "../utils/auth";
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";
import ThemeToggle from "../components/ThemeToggle";
import Modal from "../components/Modal";
import TermsAndConditions from "../components/TermsAndConditions";
import InputError from "../components/InputError";
import Footer from "../components/Footer";
import Image from "next/image";
import { useTheme } from "../context/ThemeContext";

export default function Home() {
  const { login } = useAuth(); // Auth Context
  const { theme } = useTheme(); // Theme Context
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setError(null);
      try {
        const response = await loginUser(email, password);

        if (response && response.token && response.user?.data) {
          login(response); // Saves user data & token to context/localStorage
          router.push("/home"); // Redirects to home after login
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        setError("Falha ao entrar. Verifique suas credenciais.");
        console.error("Failed to login:", err);
      }
    },
    [login, router]
  );

  const handleRegister = useCallback(
    async (email: string, password: string, idCidade: string) => {
      setError(null);
      try {
        const response = await registerUser(email, password, idCidade);

        if (response && response.token && response.user?.data) {
          console.log("Registro bem-sucedido, tentando login...");

          await handleLogin(email, password);
        } else {
          throw new Error("Invalid response structure");
        }
      } catch (err) {
        setError("Falha ao cadastrar. Tente novamente.");
        console.error("Failed to register:", err);
      }
    },
    [handleLogin]
  );

  const renderForm = useMemo(() => {
    return tab === "login" ? (
      <LoginForm handleLogin={handleLogin} />
    ) : (
      <RegisterForm handleRegister={handleRegister} />
    );
  }, [tab, handleLogin, handleRegister]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} terms>
        <TermsAndConditions onClose={() => setIsOpen(false)} />
      </Modal>
      <div className="p-8 rounded-lg shadow-lg bg-slate-200 dark:bg-gray-900 w-96">
        <div className="flex-grow flex justify-center mb-4">
          <Image
            src={
              theme === "dark"
                ? "https://styxx-public.s3.sa-east-1.amazonaws.com/logo-criarte.png"
                : "https://styxx-public.s3.sa-east-1.amazonaws.com/logo_criarte_black.png"
            }
            alt="Logo"
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

        {renderForm}

        {error && (
          <div className="mt-4">
            <InputError message={error} />
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
