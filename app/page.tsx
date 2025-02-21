"use client";

import { useState, useCallback, useMemo } from "react";
import { useAuth } from "./context/AuthContext";
import { loginUser, registerUser } from "./utils/auth";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import { useRouter } from "next/navigation";
import InputError from "./components/InputError";
import ThemeToggle from "./components/ThemeToggle";

export default function Home() {
  const { login } = useAuth(); // Auth Context
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
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
    <div className="flex items-center justify-center min-h-screen bg-slate-300 dark:bg-primary text-primary dark:text-light">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="p-8 rounded-lg shadow-lg bg-white dark:bg-gray-900 w-96">
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
            <InputError message={error} />{" "}
          </div>
        )}
      </div>
    </div>
  );
}
