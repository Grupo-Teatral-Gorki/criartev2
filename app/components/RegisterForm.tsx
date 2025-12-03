"use client";

import { useState, useEffect } from "react";
import { TextInput } from "./TextInput";
import { SelectInput } from "./SelectInput";
import InputError from "./InputError";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../config/firebaseconfig";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import { useRouter } from "next/navigation";
import LoggingService from "../services/loggingService";

type CityOption = {
  value: string;
  label: string;
};

type CityDoc = {
  cityId: string;
  name: string;
};

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
  const [citiesOptions, setCitiesOptions] = useState<CityOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const router = useRouter();

  const fetchAllCities = async () => {
    try {
      setLoadingCities(true);
      const querySnapshot = await getDocs(collection(db, "cities"));

      const docs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as CityDoc),
      }));

      const options = docs.map((item) => ({
        value: item.cityId,
        label: item.name,
      })).sort((a, b) => a.label.localeCompare(b.label));
      setCitiesOptions(options);
      return docs;
    } catch (error) {
      console.error("Error fetching cities: ", error);
      setErrors((prev) => ({
        ...prev,
        register: "Erro ao carregar cidades. Tente novamente.",
      }));
      return [];
    } finally {
      setLoadingCities(false);
    }
  };

  useEffect(() => {
    fetchAllCities();
  }, []);

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
    const loggingService = LoggingService.getInstance();

    try {
      // Log registration attempt
      loggingService.setCurrentUser(formData.email);
      await loggingService.logAction('registro_usuario', {
        email: formData.email,
        cityId: formData.selectedCityCode,
        timestamp: new Date().toISOString()
      });

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const userRef = doc(db, "users", userCredential.user.uid);

      await setDoc(userRef, {
        cityId: formData.selectedCityCode,
        email: formData.email,
        userRole: ["user"],
        createdAt: new Date(),
      });

      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      // Successful login will be logged by AuthContext
      router.push("/home");
    } catch (err: any) {
      // Log failed registration
      await loggingService.logAction('registro_falha', {
        email: formData.email,
        error: err.message || 'Unknown error',
        timestamp: new Date().toISOString()
      });

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
          options={citiesOptions}
          value={formData.selectedCityCode}
          onChange={handleChange}
          placeholder={loadingCities ? "Carregando cidades..." : "Selecione sua cidade"}
          disabled={loadingCities}
        />

        {errors.password && <InputError message={errors.password} />}
        {errors.register && <InputError message={errors.register} />}
      </div>

      <button
        type="submit"
        className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Cadastrando..." : "Cadastrar"}
      </button>
    </form>
  );
}
