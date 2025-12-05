"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { v4 as uuidv4 } from "uuid";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Edit3, Save, X, User, Mail, MapPin, Calendar, Phone, AlertCircle } from "lucide-react";

import ProfileImageUpload from "@/app/components/ProfileImageUpload";
import Spinner from "@/app/components/Spinner";
import Toast from "@/app/components/Toast";
import { useAuth } from "@/app/context/AuthContext";
import { findCityLabel } from "@/app/utils/validators";
import { isProfileComplete } from "@/app/utils/profileUtils";

// Firebase imports
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { storage, db } from "@/app/config/firebaseconfig";

// Zod schema for profile editing
const profileSchema = z.object({
  firstName: z.string().min(2, "Nome é obrigatório"),
  lastName: z.string().min(2, "Sobrenome é obrigatório"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  bio: z.string().optional(),
}).refine((data) => {
  // Additional validation can be added here if needed
  return true;
}, {
  message: "Perfil incompleto"
});

type ProfileFormData = z.infer<typeof profileSchema>;

type CityOption = {
  value: string;
  label: string;
};

type CityDoc = {
  cityId: string;
  name: string;
};

const Profile: React.FC = () => {
  const { dbUser, refreshUserData } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRequired = searchParams.get('required') === 'true';

  const [uploading, setUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [citiesOptions, setCitiesOptions] = useState<CityOption[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [profileIncomplete, setProfileIncomplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const fetchAllCities = async () => {
    try {
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
    } catch (error) {
      console.error("Error fetching cities: ", error);
    }
  };

  useEffect(() => {
    fetchAllCities();
  }, []);

  useEffect(() => {
    if (dbUser?.photoUrl) {
      setProfileImage(dbUser.photoUrl);
    }
  }, [dbUser]);

  useEffect(() => {
    if (dbUser) {
      const incomplete = !isProfileComplete(dbUser);
      setProfileIncomplete(incomplete);

      // If profile is incomplete and this is a required completion, force edit mode
      if (incomplete && isRequired) {
        setIsEditing(true);
        setToastMessage("Por favor, complete seu perfil para continuar usando o sistema.");
        setToastType("error");
        setShowToast(true);
      }
    }
  }, [dbUser, isRequired]);

  useEffect(() => {
    if (dbUser) {
      // Populate form with current user data
      setValue("firstName", dbUser.firstName || "");
      setValue("lastName", dbUser.lastName || "");
      setValue("email", dbUser.email || "");
      setValue("phone", (dbUser as any).phone || "");
      setValue("bio", (dbUser as any).bio || "");
      setSelectedCity(dbUser.cityId || "");
    }
  }, [dbUser, setValue]);

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  const handleEditToggle = () => {
    // Prevent canceling edit mode if profile is incomplete and required
    if (isEditing && profileIncomplete && isRequired) {
      setToastMessage("Você deve completar seu perfil antes de continuar.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsEditing(!isEditing);
    if (isEditing) {
      // Reset form when canceling edit
      reset();
      if (dbUser) {
        setValue("firstName", dbUser.firstName || "");
        setValue("lastName", dbUser.lastName || "");
        setValue("email", dbUser.email || "");
        setValue("phone", (dbUser as any).phone || "");
        setValue("bio", (dbUser as any).bio || "");
        setSelectedCity(dbUser.cityId || "");
      }
    }
  };

  const onSubmit = async (formData: ProfileFormData) => {
    if (!dbUser?.id) return;

    setIsSubmitting(true);
    try {
      const userDocRef = doc(db, "users", dbUser.id);
      const updateData = {
        ...formData,
        cityId: selectedCity,
        updatedAt: new Date(),
        updatedBy: dbUser.id,
      };

      await updateDoc(userDocRef, updateData);

      // Refresh user data to show changes immediately
      await refreshUserData();

      setToastMessage("Perfil atualizado com sucesso!");
      setToastType("success");
      setShowToast(true);
      setIsEditing(false);

      // If this was a required profile completion, redirect to home immediately
      if (isRequired && isProfileComplete({ ...dbUser, ...updateData })) {
        // Clear the required parameter from URL first
        router.replace('/profile');
        setTimeout(() => {
          router.push('/home');
        }, 1000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setToastMessage("Erro ao atualizar perfil. Tente novamente.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (newImageFile: File) => {
    setUploading(true);

    if (!dbUser?.cityId || !dbUser?.id) {
      console.error("Missing user cityId or id.");
      return;
    }

    try {
      const path = `profile-images/${dbUser.cityId}/${dbUser.id}/${uuidv4()}`;
      const imageRef = ref(storage, path);

      await uploadBytes(imageRef, newImageFile);
      const downloadURL = await getDownloadURL(imageRef);
      setProfileImage(downloadURL);

      const userDocRef = doc(db, "users", dbUser.id);
      await updateDoc(userDocRef, {
        photoUrl: downloadURL,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="bg-primary px-6 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full z-10">
                      <Spinner />
                    </div>
                  )}
                  <div
                    className="w-24 h-24 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg cursor-pointer ring-4 ring-white ring-opacity-30 group relative transition-all duration-200 hover:ring-8 hover:ring-white hover:ring-opacity-50"
                    onClick={handleImageClick}
                  >
                    <Image
                      src={profileImage}
                      alt="profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover transition-all duration-200 group-hover:scale-110"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-full flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center">
                        <Edit3 size={20} className="mx-auto mb-1" />
                        <span className="text-xs font-medium">Alterar</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-white">
                  <h1 className="text-3xl text-gray-900 font-bold">
                    {dbUser?.firstName} {dbUser?.lastName}
                  </h1>
                  <p className="text-blue-600 font-bold mt-1">
                    {findCityLabel(dbUser?.cityId ?? "")}
                  </p>
                  <div className="flex items-center flex-wrap gap-2 mt-2">
                    {(() => {
                      const roleMapping: { [key: string]: string } = {
                        'user': 'Proponente',
                        'secretary': 'Secretário',
                        'reviewer': 'Parecerista',
                        'admin': 'Administrador'
                      };

                      const roles = Array.isArray(dbUser?.userRole) ? dbUser.userRole : [dbUser?.userRole];

                      return roles.filter(Boolean).map((role, index) => (
                        <span key={index} className="bg-blue-500 bg-opacity-50 px-3 py-1 rounded-full text-sm">
                          {roleMapping[role as string] || role}
                        </span>
                      ));
                    })()}
                  </div>
                </div>
              </div>
              <button
                onClick={handleEditToggle}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                {isEditing ? <X size={20} /> : <Edit3 size={20} />}
                <span>{isEditing ? "Cancelar" : "Editar Perfil"}</span>
              </button>
            </div>
          </div>

          {/* Profile Incomplete Warning */}
          {profileIncomplete && isRequired && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Perfil Incompleto
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Você deve completar as informações obrigatórias do seu perfil antes de continuar usando o sistema.
                      Campos obrigatórios: Nome, Sobrenome, Email e Cidade.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Profile Content */}
          <div className="p-6 text-gray-900">
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User size={16} className="mr-2" />
                      Nome *
                    </label>
                    <input
                      {...register("firstName")}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Seu nome"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <User size={16} className="mr-2" />
                      Sobrenome *
                    </label>
                    <input
                      {...register("lastName")}
                      type="text"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Seu sobrenome"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Mail size={16} className="mr-2" />
                      Email *
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <Phone size={16} className="mr-2" />
                      Telefone
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {/* City */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <MapPin size={16} className="mr-2" />
                      Cidade *
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!selectedCity && profileIncomplete ? 'border-red-500' : 'border-gray-300'
                        }`}
                    >
                      <option value="">Selecione uma cidade</option>
                      {citiesOptions.map((city) => (
                        <option key={city.value} value={city.value}>
                          {city.label}
                        </option>
                      ))}
                    </select>
                    {!selectedCity && profileIncomplete && (
                      <p className="text-sm text-red-600">Cidade é obrigatória</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Biografia
                  </label>
                  <textarea
                    {...register("bio")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleEditToggle}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{isSubmitting ? "Salvando..." : "Salvar Alterações"}</span>
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nome Completo</p>
                        <p className="font-medium">{dbUser?.firstName} {dbUser?.lastName}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium">{dbUser?.email}</p>
                      </div>
                    </div>

                    {(dbUser as any)?.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Telefone</p>
                          <p className="font-medium">{(dbUser as any).phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <MapPin size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Cidade</p>
                        <p className="font-medium">{findCityLabel(dbUser?.cityId ?? "")}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Membro desde</p>
                        <p className="font-medium">
                          {dbUser?.createdAt ? new Date((dbUser.createdAt as any).seconds * 1000).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {(dbUser as any)?.bio && (
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-3">Biografia</h3>
                    <p className="text-gray-600 leading-relaxed">{(dbUser as any).bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileImageUpload
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onImageUpload={handleImageUpload}
      />

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Profile;
