"use client";

import React, { useState } from "react";
import cities from "@/data/cities.json";
import { SelectInput } from "@/app/components/SelectInput";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Toast from "@/app/components/Toast";
import ConfigProcess from "./ConfigProcess";
import { TextInput } from "@/app/components/TextInput";

interface FieldItem {
  name: string;
  label: string;
}

type Fields = {
  [key: string]: FieldItem[];
};

interface Project {
  name: string;
  label: string;
  description: string;
  available: boolean;
  fields: Fields;
}

interface FormState {
  idCidade: string;
  uf: string;
  cityLogoUrl: string;
  name: string;
  typesOfProjects: Project[];
  processStage: string;
}

const ConfigNewCity = () => {
  const [selectedUF, setSelectedUF] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [cityLogoUrl, setCityLogoUrl] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const [form, setForm] = useState<FormState>({
    idCidade: "",
    processStage: "open",
    cityLogoUrl: "",
    name: "",
    uf: "",
    typesOfProjects: [],
  });

  const [newProject, setNewProject] = useState<Project>({
    name: "",
    label: "",
    description: "",
    available: true,
    fields: {},
  });
  const [newFieldKey, setNewFieldKey] = useState<string>("");
  const [selectedFieldKey, setSelectedFieldKey] = useState<string>("");
  const [newFieldItem, setNewFieldItem] = useState<FieldItem>({
    name: "",
    label: "",
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
    try {
      const docRef = await addDoc(collection(db, "cities"), form);
      setShowToast(true);
      setToastType("success");
      setToastMessage(`Documento salvo com ID: ${docRef.id}`);
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      setShowToast(true);
      setToastType("error");
      setToastMessage("Erro ao salvar.");
    }
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.label) return;
    setForm((prev) => ({
      ...prev,
      typesOfProjects: [...prev.typesOfProjects, newProject],
    }));
    setNewProject({
      name: "",
      label: "",
      description: "",
      available: true,
      fields: {},
    });
    setSelectedFieldKey("");
  };

  const handleAddFieldKey = () => {
    if (!newFieldKey.trim()) return;
    setNewProject((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [newFieldKey]: [],
      },
    }));
    setSelectedFieldKey(newFieldKey);
    setNewFieldKey("");
  };

  const handleAddFieldItem = () => {
    if (!selectedFieldKey || !newFieldItem.name || !newFieldItem.label) return;
    setNewProject((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [selectedFieldKey]: [
          ...(prev.fields[selectedFieldKey] || []),
          newFieldItem,
        ],
      },
    }));
    setNewFieldItem({ name: "", label: "" });
  };

  return (
    <div className="flex items-center flex-col md:flex-row justify-center gap-10">
      <div className="p-6 max-w-4xl bg-white shadow-lg rounded-lg mt-8 min-w-[250px]">
        <ConfigProcess />
      </div>
      <div className="p-6 max-w-4xl bg-white shadow-lg rounded-lg mt-8 max-h-[694px] overflow-y-auto min-w-[250px]">
        <h2 className="text-2xl font-bold mb-4 text-navy">Novo Município</h2>

        {/* UF e Cidade */}
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            label={"Selecione UF"}
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
              }));
            }}
          />
          <SelectInput
            label={"Selecione Cidade"}
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
        {/* Novo Projeto */}
        <div className="border-t pt-4 mt-4">
          <h3 className="text-xl font-semibold mb-2 text-navy">
            Novo Tipo Edital
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              options={[
                { value: "fomento", label: "Fomento" },
                { value: "premiacao", label: "Premiação" },
              ]}
              label="Nome Interno"
              value={newProject.name}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewProject((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <input
              type="text"
              placeholder="Rótulo Visível"
              value={newProject.label}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, label: e.target.value }))
              }
              className="border p-2 rounded w-full text-navy"
            />
          </div>
          <textarea
            placeholder="Descrição"
            value={newProject.description}
            onChange={(e) =>
              setNewProject((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            className="border p-2 rounded w-full text-navy mt-4"
            rows={3}
          />

          {/* Campos Dinâmicos */}
          <div className="container mx-auto p-4">
            <div className="mt-6 border-t pt-4">
              <h4 className="font-semibold text-navy mb-2">
                Seções do Projeto
              </h4>
              <div className="flex gap-2 mb-4">
                <select
                  value={newFieldKey}
                  onChange={(e) => setNewFieldKey(e.target.value)}
                  className="border p-2 rounded w-full text-navy"
                >
                  <option value="">Selecione uma seção</option>
                  {/* Add options here dynamically or statically */}
                  <option value="generalInfo">Informações Gerais</option>
                  <option value="projectDocs">Documentos do Projeto</option>
                </select>
                <button
                  onClick={handleAddFieldKey}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Adicionar Chave
                </button>
              </div>

              {Object.keys(newProject.fields).length > 0 && (
                <div className="mb-4">
                  <select
                    value={selectedFieldKey}
                    onChange={(e) => setSelectedFieldKey(e.target.value)}
                    className="border p-2 rounded text-navy w-full"
                  >
                    <option value="">Selecione uma chave</option>
                    {Object.keys(newProject.fields).map((key) => (
                      <option key={key} value={key}>
                        {key}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedFieldKey && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Nome do Campo"
                    value={newFieldItem.name}
                    onChange={(e) =>
                      setNewFieldItem((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="border p-2 rounded w-full text-navy"
                  />
                  <input
                    type="text"
                    placeholder="Rótulo do Campo"
                    value={newFieldItem.label}
                    onChange={(e) =>
                      setNewFieldItem((prev) => ({
                        ...prev,
                        label: e.target.value,
                      }))
                    }
                    className="border p-2 rounded w-full text-navy"
                  />
                  <button
                    onClick={handleAddFieldItem}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Adicionar Campo
                  </button>
                  <ul className="list-disc pl-5 mt-2">
                    {newProject.fields[selectedFieldKey]?.map((item, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        <span className="font-medium">{item.label}</span>{" "}
                        <span className="text-xs text-gray-500">
                          ({item.name})
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <button
              className="mt-6 bg-navy text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              onClick={handleAddProject}
            >
              Adicionar Projeto
            </button>
            <button
              className="mt-6 bg-navy text-white px-4 py-2 rounded hover:bg-blue-800 transition"
              onClick={handleSubmitToFirebase}
            >
              Salvar
            </button>
          </div>
          {/* Lista de Projetos Adicionados */}
          {form.typesOfProjects.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h4 className="text-lg font-semibold text-navy mb-2">
                Projetos Adicionados
              </h4>
              <ul className="space-y-3">
                {form.typesOfProjects.map((proj, idx) => (
                  <li
                    key={idx}
                    className="border p-3 rounded shadow-sm bg-gray-50"
                  >
                    <div className="font-bold text-navy">{proj.label}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      {proj.description}
                    </div>
                    {Object.entries(proj.fields).map(([sectionKey, fields]) => (
                      <div key={sectionKey} className="ml-4 mb-2">
                        <div className="text-sm font-semibold text-gray-700">
                          {sectionKey}
                        </div>
                        <ul className="list-disc pl-5 text-sm text-gray-800">
                          {fields.map((field, fieldIdx) => (
                            <li key={fieldIdx}>
                              {field.label}{" "}
                              <span className="text-gray-500">
                                ({field.name})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Toast
          message={toastMessage}
          show={showToast}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default ConfigNewCity;
