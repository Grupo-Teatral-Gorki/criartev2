"use client";

import { useState } from "react";
import { TextInput } from "./TextInput";
import InputError from "./InputError";
import { auth } from "../config/firebaseconfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import LoggingService from "../services/loggingService";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const loggingService = LoggingService.getInstance();

    try {
      // Log login attempt
      loggingService.setCurrentUser(email);
      await loggingService.logAction('tentativa_login', {
        email,
        loginMethod: 'email_password',
        timestamp: new Date().toISOString()
      });

      await signInWithEmailAndPassword(auth, email, password);
      
      // Successful login will be logged by AuthContext
      router.push("/home");
    } catch (error: any) {
      // Log failed login attempt
      await loggingService.logAction('login_falha', {
        email,
        error: error.message || 'Unknown error',
        loginMethod: 'email_password',
        timestamp: new Date().toISOString()
      });
      
      setError("Falha ao entrar. Verifique suas credenciais.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 my-4">
        <TextInput
          type="email"
          name="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          type="password"
          name="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {!isLoading && error && <InputError message={error} />}
      </div>

      <button
        type="submit"
        className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
