"use client";

import React, { useState } from "react";
import cities from "@/data/cities.json";
import { SelectInput } from "@/app/components/SelectInput";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";

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
  name: string;
  typesOfProjects: Project[];
}

const DynamicProjectForm = () => {
  const [selectedUF, setSelectedUF] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState("");

  const [form, setForm] = useState<FormState>({
    idCidade: "",
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
      alert(`Documento salvo com ID: ${docRef.id}`);
    } catch (error) {
      console.error("Erro ao adicionar documento:", error);
      alert("Erro ao salvar no Firebase.");
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
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-navy">Nova Configuração</h2>

      {/* UF and Cidade Select */}
      <div className="grid grid-cols-2 gap-4 mb-4">
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
              idCidade: "",
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
            setSelectedCity(cityId);
            setForm((prev) => ({
              ...prev,
              idCidade: cityId,
              name: cityLabel,
            }));
          }}
        />
      </div>

      {/* New Project Config */}
      <div className="border-t pt-4 mt-4">
        <h3 className="text-xl font-semibold mb-2 text-navy">Novo Tipo</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome Interno"
            value={newProject.name}
            onChange={(e) =>
              setNewProject((prev) => ({ ...prev, name: e.target.value }))
            }
            className="border p-2 rounded w-full text-navy"
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

        {/* Dynamic Fields Section */}
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-navy mb-2">
            Campos Personalizados
          </h4>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Nova Chave (ex: generalInfo)"
              value={newFieldKey}
              onChange={(e) => setNewFieldKey(e.target.value)}
              className="border p-2 rounded text-navy w-full"
            />
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

              {/* Visual List of Added Items */}
              <ul className="list-disc pl-5 mt-2">
                {newProject.fields[selectedFieldKey]?.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-700">
                    <span className="font-medium">{item.label}</span>{" "}
                    <span className="text-xs text-gray-500">({item.name})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
      </div>

      {/* List of Current Projects */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-xl font-semibold mb-4 text-navy">
          Projetos Atuais
        </h3>
        <ul className="space-y-4">
          {form.typesOfProjects.map((proj, idx) => (
            <li key={idx} className="border p-4 rounded shadow-sm bg-gray-50">
              <h4 className="font-bold text-lg text-navy">{proj.label}</h4>
              <p className="text-sm text-gray-700 mb-1">{proj.description}</p>
              <p className="text-xs text-gray-500">ID: {proj.name}</p>
              <div className="mt-2">
                {Object.entries(proj.fields).map(([key, items]) => (
                  <div key={key} className="mb-2">
                    <p className="text-sm font-semibold text-navy">
                      Chave: {key}
                    </p>
                    <ul className="ml-4 list-disc text-sm text-gray-700">
                      {items.map((item, i) => (
                        <li key={i}>
                          {item.label} ({item.name})
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DynamicProjectForm;
