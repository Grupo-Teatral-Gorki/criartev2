"use client";

import { useState, useCallback } from "react";
import { TextInput } from "./TextInput";
import InputError from "./InputError";

interface LoginFormProps {
  handleLogin: (email: string, password: string) => void;
}

export default function LoginForm({ handleLogin }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      try {
        handleLogin(formData.email, formData.password);
      } catch (err) {
        setIsLoading(false);
        setLoginError("Falha ao entrar. Verifique suas credenciais.");
        console.log("Failed to login:", err);
      }
    },
    [formData, handleLogin]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 my-4">
        <TextInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <TextInput
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={handleChange}
        />
        {!isLoading && loginError && <InputError message={loginError} />}
      </div>

      <button
        type="submit"
        className="w-full p-2 bg-primary text-light rounded"
      >
        Entrar
      </button>
    </form>
  );
}
