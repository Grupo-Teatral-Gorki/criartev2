"use client";

import React, { useState } from "react";
import cities from "@/data/cities.json";
import { SelectInput } from "@/app/components/SelectInput";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Toast from "@/app/components/Toast";
import { TextInput } from "@/app/components/TextInput";
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
  const [selectedUF, setSelectedUF] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityLogoUrl, setCityLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

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

    setSaving(true);
    try {
      const docRef = await addDoc(collection(db, "cities"), form);
      setShowToast(true);
      setToastType("success");
      setToastMessage(`Município criado com sucesso! ID: ${docRef.id}`);
      // Reset form
      setSelectedUF("");
      setSelectedCity("");
      setCityLogoUrl("");
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

      <TextInput
        type="text"
        label="URL Logo do município"
        value={cityLogoUrl}
        onChange={(e: any) => {
          setCityLogoUrl(e.target.value);
          setForm((prev) => ({
            ...prev,
            cityLogoUrl: e.target.value,
          }));
        }}
      />

      {form.name && (
        <div className="mt-4 p-3 bg-slate-50 rounded border">
          <p className="text-sm text-slate-600">
            Será criado: <span className="font-semibold">{form.name} - {form.uf}</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Após criar o município, use "Editar Estrutura de Projetos" para configurar os tipos de projeto.
          </p>
        </div>
      )}

      <div className="mt-6">
        <Button
          label={saving ? "Salvando..." : "Criar Município"}
          onClick={handleSubmitToFirebase}
          disabled={saving || !form.name}
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
