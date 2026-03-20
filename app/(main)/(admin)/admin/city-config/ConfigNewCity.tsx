"use client";

import React, { useState } from "react";
import cities from "@/data/cities.json";
import { SelectInput } from "@/app/components/SelectInput";
import { addDoc, collection } from "firebase/firestore";
import { db, storage } from "@/app/config/firebaseconfig";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Toast from "@/app/components/Toast";
import Button from "@/app/components/Button";

interface FormState {
  cityId: string;
  uf: string;
  cityLogoUrl: string;
  name: string;
  typesOfProjects: [];
  processStage: string;
}

const ConfigNewCity = () => {
  const MAX_LOGO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
  const [selectedUF, setSelectedUF] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityLogoFile, setCityLogoFile] = useState<File | null>(null);
  const [cityLogoPreviewUrl, setCityLogoPreviewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const compressImageIfNeeded = async (file: File): Promise<File> => {
    if (file.size <= MAX_LOGO_SIZE_BYTES) return file;

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            resolve(file);
            return;
          }

          let width = img.width;
          let height = img.height;
          const maxDimension = 1920;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file);
                return;
              }

              const compressed = new File([blob], file.name, { type: file.type });
              resolve(compressed);
            },
            file.type,
            0.7
          );
        };

        img.src = event.target?.result as string;
      };

      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const [form, setForm] = useState<FormState>({
    cityId: "",
    processStage: "closed",
    cityLogoUrl: "",
    name: "",
    uf: "",
    typesOfProjects: [],
  });

  function getUniqueUFsAsLabelValue() {
    const uniqueUFs = [...new Set(cities.map(({ uf }) => uf))];
    return uniqueUFs.map((uf) => ({ label: uf, value: uf }));
  }

  function getCitiesByUF(uf: string) {
    return cities
      .filter((item) => item.uf === uf)
      .map(({ id, nome }) => ({ value: id, label: nome }));
  }

  function getCityNameById(id: string) {
    const city = cities.find((item) => item.id.toString() === id);
    return city ? city.nome : "";
  }

  const handleSubmitToFirebase = async () => {
    if (!form.name || !form.uf) {
      setShowToast(true);
      setToastType("error");
      setToastMessage("Selecione UF e Cidade.");
      return;
    }

    if (!cityLogoFile) {
      setShowToast(true);
      setToastType("error");
      setToastMessage("Faça o upload do brasão do município.");
      return;
    }

    setSaving(true);
    try {
      const fileToUpload = await compressImageIfNeeded(cityLogoFile);

      if (fileToUpload.size > MAX_LOGO_SIZE_BYTES) {
        setShowToast(true);
        setToastType("error");
        setToastMessage("O brasão deve ter no máximo 5MB após compressão.");
        setSaving(false);
        return;
      }

      const safeFileName = fileToUpload.name.replace(/\s+/g, "-").toLowerCase();
      const logoRef = ref(
        storage,
        `city-logos/${form.cityId}/${Date.now()}-${safeFileName}`
      );

      await uploadBytes(logoRef, fileToUpload);
      const uploadedLogoUrl = await getDownloadURL(logoRef);

      const docRef = await addDoc(collection(db, "cities"), {
        ...form,
        cityLogoUrl: uploadedLogoUrl,
      });
      setShowToast(true);
      setToastType("success");
      setToastMessage(`Município criado com sucesso! ID: ${docRef.id}`);
      window.dispatchEvent(new Event("city-config-updated"));
      // Reset form
      setSelectedUF("");
      setSelectedCity("");
      setCityLogoFile(null);
      setCityLogoPreviewUrl("");
      setForm({
        cityId: "",
        processStage: "closed",
        cityLogoUrl: "",
        name: "",
        uf: "",
        typesOfProjects: [],
      });
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      setShowToast(true);
      setToastType("error");
      setToastMessage("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSizeBytes = MAX_LOGO_SIZE_BYTES;

    if (!allowedTypes.includes(file.type)) {
      setShowToast(true);
      setToastType("error");
      setToastMessage("Formato inválido. Use PNG, JPG ou WEBP.");
      return;
    }

    if (file.size > maxSizeBytes) {
      setShowToast(true);
      setToastType("error");
      setToastMessage("Arquivo muito grande. Tamanho máximo: 5MB.");
      return;
    }

    setCityLogoFile(file);
    setCityLogoPreviewUrl(URL.createObjectURL(file));
  };

  return (
    <div className="text-navy">
      <h2 className="text-2xl font-bold mb-4">Novo Município</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <SelectInput
          label="Selecione UF"
          options={getUniqueUFsAsLabelValue()}
          value={selectedUF}
          onChange={(e: any) => {
            const uf = e.target.value;
            setSelectedUF(uf);
            setSelectedCity("");
            setForm((prev) => ({
              ...prev,
              uf,
              name: "",
              cityId: "",
            }));
          }}
        />
        <SelectInput
          label="Selecione Cidade"
          options={getCitiesByUF(selectedUF)}
          value={selectedCity}
          onChange={(e: any) => {
            const cityId = e.target.value;
            const cityLabel = getCityNameById(cityId);
            const formattedCityId = cityId.toString().padStart(4, "0");
            setSelectedCity(cityId);
            setForm((prev) => ({
              ...prev,
              cityId: formattedCityId,
              name: cityLabel,
            }));
          }}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Upload do brasão do município
        </label>
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleLogoFileChange}
          className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
        />
        <p className="mt-1 text-xs text-slate-500">Formatos: PNG, JPG, WEBP (máx. 5MB)</p>

        {cityLogoPreviewUrl && (
          <div className="mt-3 w-24 h-24 rounded-md border border-slate-200 overflow-hidden bg-slate-50">
            <img
              src={cityLogoPreviewUrl}
              alt="Prévia do brasão"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {form.name && (
        <div className="mt-4 p-3 bg-slate-50 rounded border">
          <p className="text-sm text-slate-600">
            Será criado: <span className="font-semibold">{form.name} - {form.uf}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Após criar o município, use &quot;Editar Estrutura de Projetos&quot; para configurar os tipos de projeto.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Button
          label={saving ? "Salvando..." : "Criar Município"}
          onClick={handleSubmitToFirebase}
          disabled={saving || !form.name || !cityLogoFile}
        />
      </div>

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ConfigNewCity;
