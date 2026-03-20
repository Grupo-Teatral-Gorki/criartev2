"use client";

import React, { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getFirestore,
} from "firebase/firestore";
import { SelectInput } from "@/app/components/SelectInput";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";

interface FieldOption {
  value: string;
  label: string;
}

type ProponenteTipo = "fisica" | "juridica" | "coletivo";

interface FieldItem {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "multiselect" | "radio" | "checkbox" | "file";
  required?: boolean;
  placeholder?: string;
  options?: FieldOption[];
}

type Fields = {
  [key: string]: FieldItem[];
};

interface Project {
  name: string;
  label: string;
  description: string;
  available: boolean;
  acceptedProponentTypes?: ProponenteTipo[];
  fields: Fields;
}

const DEFAULT_PROPONENT_TYPES: ProponenteTipo[] = ["fisica", "juridica", "coletivo"];

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto Longo" },
  { value: "select", label: "Seleção Única" },
  { value: "multiselect", label: "Seleção Múltipla" },
  { value: "radio", label: "Opções (Radio)" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "Arquivo" },
];

const SECTION_OPTIONS = [
  { value: "generalInfo", label: "Informações Gerais" },
  { value: "projectDocs", label: "Documentos do Projeto" },
  { value: "budget", label: "Planilha Orçamentária" },
];

const PROJECT_TYPE_OPTIONS = [
  { value: "fomento", label: "Fomento" },
  { value: "premiacao", label: "Premiação" },
];

const FILE_ONLY_SECTIONS = ["projectDocs", "budget"];

const PROPONENT_TYPE_OPTIONS: { value: ProponenteTipo; label: string }[] = [
  { value: "fisica", label: "Pessoa Física" },
  { value: "juridica", label: "Pessoa Jurídica" },
  { value: "coletivo", label: "Coletivo" },
];

const toFieldKey = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const ProjectTypeTemplatesPage = () => {
  const db = getFirestore();

  const [saving, setSaving] = useState(false);
  const [creatingTemplate, setCreatingTemplate] = useState(false);

  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [newSectionKey, setNewSectionKey] = useState("");
  const [addingFieldToSection, setAddingFieldToSection] = useState<string | null>(null);
  const [newField, setNewField] = useState<FieldItem>({
    name: "",
    label: "",
    type: "text",
    required: false,
    options: [],
  });
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");

  const [newProject, setNewProject] = useState<Project>({
    name: "",
    label: "",
    description: "",
    available: true,
    acceptedProponentTypes: [...DEFAULT_PROPONENT_TYPES],
    fields: {},
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const cloneProject = (project: Project): Project => ({
    ...project,
    acceptedProponentTypes: project.acceptedProponentTypes
      ? [...project.acceptedProponentTypes]
      : [...DEFAULT_PROPONENT_TYPES],
    fields: Object.fromEntries(
      Object.entries(project.fields || {}).map(([sectionKey, sectionFields]) => [
        sectionKey,
        sectionFields.map((field) => ({
          ...field,
          options: field.options ? [...field.options] : [],
        })),
      ])
    ),
  });

  useEffect(() => {
    if (newProject.name && !newTemplateName.trim()) {
      setNewTemplateName(newProject.label || newProject.name);
    }
  }, [newProject.name, newProject.label, newTemplateName]);

  const handleToggleNewProjectProponentType = (tipo: ProponenteTipo) => {
    setNewProject((prev) => {
      const currentTypes =
        prev.acceptedProponentTypes && prev.acceptedProponentTypes.length > 0
          ? prev.acceptedProponentTypes
          : [...DEFAULT_PROPONENT_TYPES];

      const updatedTypes = currentTypes.includes(tipo)
        ? currentTypes.filter((item) => item !== tipo)
        : [...currentTypes, tipo];

      return { ...prev, acceptedProponentTypes: updatedTypes };
    });
  };

  const handleAddSection = () => {
    if (!newSectionKey.trim()) return;

    setNewProject((prev) => {
      if (prev.fields[newSectionKey]) return prev;
      return { ...prev, fields: { ...prev.fields, [newSectionKey]: [] } };
    });

    setNewSectionKey("");
  };

  const handleRemoveSection = (sectionKey: string) => {
    if (!confirm(`Remover seção "${sectionKey}" e todos os seus campos?`)) return;

    setNewProject((prev) => {
      const nextFields = { ...prev.fields };
      delete nextFields[sectionKey];
      return { ...prev, fields: nextFields };
    });
  };

  const resetNewField = () => {
    setNewField({ name: "", label: "", type: "text", required: false, options: [] });
    setNewOptionValue("");
    setNewOptionLabel("");
  };

  const handleAddField = (sectionKey: string) => {
    if (!newField.name.trim() || !newField.label.trim()) return;

    const fieldToAdd: FieldItem = FILE_ONLY_SECTIONS.includes(sectionKey)
      ? { ...newField, type: "file", options: [] }
      : { ...newField, options: newField.options || [] };

    setNewProject((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [sectionKey]: [...(prev.fields[sectionKey] || []), fieldToAdd],
      },
    }));

    setAddingFieldToSection(null);
    resetNewField();
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim() || !newProject.name || !newProject.label) {
      setToastType("error");
      setToastMessage("Preencha nome do modelo, nome interno e rótulo.");
      setShowToast(true);
      return;
    }

    setCreatingTemplate(true);
    setSaving(true);
    try {
      await addDoc(collection(db, "projectTypeTemplates"), {
        name: newTemplateName.trim(),
        description: newTemplateDescription.trim(),
        project: cloneProject(newProject),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setNewTemplateName("");
      setNewTemplateDescription("");
      setNewSectionKey("");
      setAddingFieldToSection(null);
      resetNewField();
      setNewProject({
        name: "",
        label: "",
        description: "",
        available: true,
        acceptedProponentTypes: [...DEFAULT_PROPONENT_TYPES],
        fields: {},
      });

      setToastType("success");
      setToastMessage("Modelo criado com sucesso!");
      setShowToast(true);
    } catch (error) {
      console.error("Error creating template:", error);
      setToastType("error");
      setToastMessage("Erro ao criar modelo.");
      setShowToast(true);
    } finally {
      setCreatingTemplate(false);
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center flex-col justify-center gap-6 px-4 py-8">
      <div className="p-6 w-full max-w-6xl rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft-lg">
        <h2 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">Modelos de Tipo de Projeto</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5">
          Crie modelos do zero para reutilizar depois nos municípios.
        </p>

        <div className="mt-6 border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/90 dark:bg-slate-900/50">
          <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">Criar novo modelo do zero</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 p-2 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              placeholder="Nome do modelo"
            />
            <input
              type="text"
              value={newTemplateDescription}
              onChange={(e) => setNewTemplateDescription(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 p-2 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
              placeholder="Descrição curta (opcional)"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
            <SelectInput
              options={PROJECT_TYPE_OPTIONS}
              label="Nome interno do tipo"
              value={newProject.name}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setNewProject((prev) => ({ ...prev, name: e.target.value }))
              }
            />
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Rótulo visível</label>
              <input
                type="text"
                value={newProject.label}
                onChange={(e) =>
                  setNewProject((prev) => ({ ...prev, label: e.target.value }))
                }
                className="border border-slate-200 dark:border-slate-600 p-2 rounded text-sm text-slate-900 dark:text-slate-100 w-full bg-white dark:bg-slate-800"
                placeholder="Ex: Fomento Cultural"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">Descrição do tipo</label>
            <textarea
              value={newProject.description}
              onChange={(e) =>
                setNewProject((prev) => ({ ...prev, description: e.target.value }))
              }
              className="border border-slate-200 dark:border-slate-600 p-2 rounded text-sm text-slate-900 dark:text-slate-100 w-full bg-white dark:bg-slate-800"
              rows={3}
              placeholder="Descrição do tipo de projeto"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">Tipos de proponente aceitos</label>
            <div className="flex flex-wrap gap-3">
              {PROPONENT_TYPE_OPTIONS.map((option) => {
                const checked = (newProject.acceptedProponentTypes || DEFAULT_PROPONENT_TYPES).includes(option.value);
                return (
                  <label key={option.value} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleNewProjectProponentType(option.value)}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mb-4 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 p-3">
            <h4 className="font-medium mb-2 text-slate-900 dark:text-slate-100">Seções e campos</h4>
            <div className="flex flex-col lg:flex-row gap-2 mb-3">
              <SelectInput
                options={SECTION_OPTIONS}
                value={newSectionKey}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewSectionKey(e.target.value)}
                label="Adicionar seção"
              />
              <Button label="Adicionar Seção" onClick={handleAddSection} size="small" />
            </div>

            {Object.keys(newProject.fields).length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Nenhuma seção adicionada.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(newProject.fields).map(([sectionKey, fields]) => (
                  <div key={sectionKey} className="border border-slate-200 dark:border-slate-700 rounded p-3 bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {SECTION_OPTIONS.find((s) => s.value === sectionKey)?.label || sectionKey}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAddingFieldToSection(sectionKey)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          + Campo
                        </button>
                        <button
                          onClick={() => handleRemoveSection(sectionKey)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          Remover Seção
                        </button>
                      </div>
                    </div>

                    {addingFieldToSection === sectionKey && (
                      <div className="mb-2 p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Nome (key)"
                            value={newField.name}
                            readOnly
                            className="border border-slate-200 dark:border-slate-600 p-1 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                          />
                          <input
                            type="text"
                            placeholder="Rótulo"
                            value={newField.label}
                            onChange={(e) =>
                              setNewField((prev) => {
                                const label = e.target.value;
                                return {
                                  ...prev,
                                  label,
                                  name: toFieldKey(label),
                                };
                              })
                            }
                            className="border border-slate-200 dark:border-slate-600 p-1 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                          />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 mb-2">
                          {FILE_ONLY_SECTIONS.includes(sectionKey) ? (
                            <div className="flex items-center text-sm text-slate-500">
                              <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700/60 rounded text-slate-700 dark:text-slate-200">Tipo: Arquivo</span>
                            </div>
                          ) : (
                            <select
                              value={newField.type}
                              onChange={(e) =>
                                setNewField((prev) => ({ ...prev, type: e.target.value as FieldItem["type"] }))
                              }
                              className="border border-slate-200 dark:border-slate-600 p-1 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                            >
                              {FIELD_TYPES.map((fieldType) => (
                                <option key={fieldType.value} value={fieldType.value}>
                                  {fieldType.label}
                                </option>
                              ))}
                            </select>
                          )}
                          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={newField.required || false}
                              onChange={(e) =>
                                setNewField((prev) => ({ ...prev, required: e.target.checked }))
                              }
                            />
                            Obrigatório
                          </label>
                        </div>

                        {!FILE_ONLY_SECTIONS.includes(sectionKey) &&
                          ["select", "multiselect", "radio"].includes(newField.type) && (
                            <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded mb-2">
                              <p className="text-xs font-medium mb-1 text-slate-700 dark:text-slate-200">Opções do campo</p>
                              {(newField.options || []).map((opt, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs mb-1 text-slate-700 dark:text-slate-300">
                                  <span>{opt.label} ({opt.value})</span>
                                  <button
                                    onClick={() =>
                                      setNewField((prev) => ({
                                        ...prev,
                                        options: prev.options?.filter((_, optionIdx) => optionIdx !== idx),
                                      }))
                                    }
                                    className="text-red-500"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))}

                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 mt-2">
                                <input
                                  type="text"
                                  value={newOptionValue}
                                  onChange={(e) => setNewOptionValue(e.target.value)}
                                  className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                  placeholder="Valor"
                                />
                                <input
                                  type="text"
                                  value={newOptionLabel}
                                  onChange={(e) => setNewOptionLabel(e.target.value)}
                                  className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                  placeholder="Rótulo"
                                />
                                <button
                                  onClick={() => {
                                    if (!newOptionValue || !newOptionLabel) return;
                                    setNewField((prev) => ({
                                      ...prev,
                                      options: [
                                        ...(prev.options || []),
                                        { value: newOptionValue, label: newOptionLabel },
                                      ],
                                    }));
                                    setNewOptionValue("");
                                    setNewOptionLabel("");
                                  }}
                                  className="bg-blue-600 text-white text-xs rounded px-2 py-1"
                                >
                                  Adicionar opção
                                </button>
                              </div>
                            </div>
                          )}

                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleAddField(sectionKey)}
                            className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                          >
                            Adicionar campo
                          </button>
                          <button
                            onClick={() => {
                              setAddingFieldToSection(null);
                              resetNewField();
                            }}
                            className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-xs"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {fields.length === 0 ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum campo nessa seção.</p>
                    ) : (
                      <ul className="space-y-1">
                        {fields.map((field, idx) => (
                          <li key={idx} className="text-xs bg-white dark:bg-slate-800 rounded p-2 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70">
                            <span className="font-medium">{field.label}</span> ({field.name})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            label={creatingTemplate ? "Criando..." : "Criar modelo do zero"}
            onClick={handleCreateTemplate}
            disabled={
              creatingTemplate ||
              !newTemplateName.trim() ||
              !newProject.name ||
              !newProject.label ||
              saving
            }
            size="small"
          />
        </div>
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

export default ProjectTypeTemplatesPage;
