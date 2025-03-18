/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useEffect, useState } from "react";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import InputError from "./InputError";
import { citiesConstant } from "../utils/constants";

interface RegisterFormProps {
  handleRegister: (
    email: string,
    password: string,
    selectedCityCode: string
  ) => void;
}

export default function RegisterForm({ handleRegister }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    selectedCityCode: "",
  });

  const [passwordError, setPasswordError] = useState("");

  const handleChange = (e: any, name: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData, // Keep existing values
      [name]: e.target.value, // Update only this field
    }));
  };

  useEffect(() => {
    console.log("formData", formData);
  }, [formData]);

  const validatePassword = useCallback((): boolean => {
    const { password, confirmPassword } = formData;
    const minLength = 8;
    const isSafe = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!password || !confirmPassword) {
      setPasswordError("Os campos de senha são obrigatórios.");
      return false;
    }

    if (password.length < minLength) {
      setPasswordError("A senha deve ter pelo menos 8 caracteres.");
      return false;
    }

    if (!isSafe.test(password)) {
      setPasswordError(
        "A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial."
      );
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("As senhas não coincidem.");
      return false;
    }

    setPasswordError("");
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (validatePassword()) {
        console.log("Cadastro enviado", formData);
        handleRegister(
          formData.email,
          formData.password,
          formData.selectedCityCode
        );
      }
    },
    [formData, handleRegister, validatePassword]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col gap-4 my-4">
        <TextInput
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => handleChange(e, "email")}
        />
        <TextInput
          type="password"
          name="password"
          placeholder="Senha"
          value={formData.password}
          onChange={(e) => handleChange(e, "password")}
          onBlur={validatePassword}
        />
        <TextInput
          type="password"
          name="confirmPassword"
          placeholder="Confirme a senha"
          value={formData.confirmPassword}
          onChange={(e: any) => handleChange(e, "confirmPassword")}
          onBlur={validatePassword}
        />
        <SelectInput
          name="selectedCityCode"
          options={citiesConstant}
          value={formData.selectedCityCode}
          onChange={(e: any) => handleChange(e, "selectedCityCode")}
        />
        {passwordError && <InputError message={passwordError} />}
      </div>
      <button
        type="submit"
        className="w-full p-2 bg-primary text-light rounded"
      >
        Cadastrar
      </button>
    </form>
  );
}
