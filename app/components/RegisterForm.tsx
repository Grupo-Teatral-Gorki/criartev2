"use client";

import { useState } from "react";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import InputError from "./InputError";
import { citiesConstant } from "../utils/constants";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebaseconfig";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    selectedCityCode: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    register: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    const isValid = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!password || !confirmPassword) {
      return "Os campos de senha são obrigatórios.";
    }

    if (!isValid.test(password)) {
      return "A senha deve conter pelo menos uma letra maiúscula, um número e um caractere especial.";
    }

    if (password !== confirmPassword) {
      return "As senhas não coincidem.";
    }

    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ password: "", register: "" });

    const passwordError = validatePassword();
    if (passwordError) {
      setErrors((prev) => ({ ...prev, password: passwordError }));
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userRef = doc(db, "users", userCredential.user.uid);

      await setDoc(userRef, {
        cityId: formData.selectedCityCode,
        email: formData.email,
        createdAt: new Date(),
      });

      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      router.push("/home");
    } catch (err: any) {
      setErrors((prev) => ({
        ...prev,
        register: err.message || "Erro ao tentar registrar.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

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
          onBlur={() =>
            setErrors((prev) => ({
              ...prev,
              password: validatePassword(),
            }))
          }
        />
        <TextInput
          type="password"
          name="confirmPassword"
          placeholder="Confirme a senha"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={() =>
            setErrors((prev) => ({
              ...prev,
              password: validatePassword(),
            }))
          }
        />
        <SelectInput
          name="selectedCityCode"
          options={citiesConstant}
          value={formData.selectedCityCode}
          onChange={handleChange}
        />

        {errors.password && <InputError message={errors.password} />}
        {errors.register && <InputError message={errors.register} />}
      </div>

      <button
        type="submit"
        className="w-full p-2 bg-primary text-light rounded"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
