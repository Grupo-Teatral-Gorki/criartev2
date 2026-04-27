"use client";

import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { SelectInput } from "@/app/components/SelectInput";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import { Trash2, Plus, ChevronDown, ChevronUp, Edit2, X, GripVertical, FileDown } from "lucide-react";
import {
  EXTRA_FIELDS_DEFAULT,
  type ExtraFieldsConfig,
  type ExtraFieldGroup,
} from "@/app/(main)/criar/secoes/InfoGerais";

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
  disableOther?: boolean;
}

type Fields = {
  [key: string]: FieldItem[];
};

const FIELD_TYPES = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Texto Longo" },
  { value: "select", label: "Seleção Única" },
  { value: "multiselect", label: "Seleção Múltipla" },
  { value: "radio", label: "Opções (Radio)" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "Arquivo" },
];

interface Project {
  name: string;
  label: string;
  description: string;
  available: boolean;
  acceptedProponentTypes?: ProponenteTipo[];
  fields: Fields;
  extraGeneralInfo?: boolean;
  extraFields?: ExtraFieldsConfig;
  editalLink?: string;
  baseType?: string;
}

interface ProjectTypeTemplate {
  id: string;
  name: string;
  description?: string;
  project: Project;
}

type City = {
  id: string;
  cityId?: string;
  name: string;
  uf: string;
  typesOfProjects?: Project[];
  enforceUniqueFichaTecnicaCpf?: boolean;
};

const SECTION_OPTIONS = [
  { value: "generalInfo", label: "Informações Gerais" },
  { value: "projectDocs", label: "Documentos do Projeto" },
  { value: "budget", label: "Planilha Orçamentária" },
];

// Sections that only allow file type fields
const FILE_ONLY_SECTIONS = ["projectDocs", "budget"];

const PROJECT_TYPE_OPTIONS = [
  { value: "fomento", label: "Fomento" },
  { value: "premiacao", label: "Premiação" },
];

const PROPONENT_TYPE_OPTIONS: { value: ProponenteTipo; label: string }[] = [
  { value: "fisica", label: "Pessoa Física" },
  { value: "juridica", label: "Pessoa Jurídica" },
  { value: "coletivo", label: "Coletivo" },
];

const DEFAULT_PROPONENT_TYPES: ProponenteTipo[] = ["fisica", "juridica", "coletivo"];

const toFieldKey = (label: string) =>
  label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const OTHER_OPTION: FieldOption = { value: "outro", label: "Outro" };

const getOptionsWithOther = (options?: FieldOption[]) => {
  const safeOptions = Array.isArray(options) ? options : [];
  return safeOptions.some((opt) => opt.value === OTHER_OPTION.value)
    ? safeOptions
    : [...safeOptions, OTHER_OPTION];
};

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[;,.]+$/g, "")
    .replace(/\s+/g, " ");

const mapLegacySelectionToOptionValue = (
  rawValue: string,
  options: FieldOption[]
) => {
  if (options.some((opt) => opt.value === rawValue)) {
    return rawValue;
  }

  const rawNormalized = normalizeText(rawValue);
  const rawKey = toFieldKey(rawValue);

  const matchedOption = options.find((opt) => {
    const optionLabelNormalized = normalizeText(opt.label || "");
    const optionValueNormalized = normalizeText(opt.value || "");
    const optionLabelKey = toFieldKey(opt.label || "");
    const optionValueKey = toFieldKey(opt.value || "");

    return (
      rawNormalized === optionLabelNormalized ||
      rawNormalized === optionValueNormalized ||
      rawKey === optionLabelKey ||
      rawKey === optionValueKey ||
      rawKey === opt.value
    );
  });

  if (matchedOption) {
    return matchedOption.value;
  }

  if (rawNormalized === "outro" || rawNormalized === "outra") {
    return OTHER_OPTION.value;
  }

  return rawValue;
};

const EditCityProjects = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedProject, setExpandedProject] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [templates, setTemplates] = useState<ProjectTypeTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [enforceUniqueFichaTecnicaCpf, setEnforceUniqueFichaTecnicaCpf] = useState(false);
  
  // New project form state
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState<Project>({
    name: "",
    label: "",
    description: "",
    available: true,
    acceptedProponentTypes: [...DEFAULT_PROPONENT_TYPES],
    fields: {},
  });

  // Edit field state
  const [editingField, setEditingField] = useState<{
    projectIdx: number;
    sectionKey: string;
    fieldIdx: number;
  } | null>(null);
  const [editFieldValue, setEditFieldValue] = useState<FieldItem>({ name: "", label: "", type: "text", options: [] });

  // New field state
  const [newFieldSection, setNewFieldSection] = useState<string>("");
  const [newField, setNewField] = useState<FieldItem>({ name: "", label: "", type: "text", required: false, options: [] });
  const [addingFieldToProject, setAddingFieldToProject] = useState<number | null>(null);

  // New section state
  const [newSectionKey, setNewSectionKey] = useState<string>("");
  const [addingSectionToProject, setAddingSectionToProject] = useState<number | null>(null);

  // Option input state (for adding options to fields)
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newOptionLabel, setNewOptionLabel] = useState("");
  const [editOptionValue, setEditOptionValue] = useState("");
  const [editOptionLabel, setEditOptionLabel] = useState("");
  const [editingProjectDescriptionIdx, setEditingProjectDescriptionIdx] = useState<number | null>(null);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [editingProjectLabelIdx, setEditingProjectLabelIdx] = useState<number | null>(null);
  const [labelDraft, setLabelDraft] = useState("");
  const [nameDraft, setNameDraft] = useState("");

  // Drag and drop state for field reordering
  const [draggedField, setDraggedField] = useState<{
    projectIdx: number;
    sectionKey: string;
    fieldIdx: number;
  } | null>(null);

  const db = getFirestore();

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

  const fetchTemplates = async () => {
    try {
      const templatesCol = collection(db, "projectTypeTemplates");
      const snapshot = await getDocs(templatesCol);
      const templateList = snapshot.docs.map((templateDoc) => {
        const data = templateDoc.data() as Omit<ProjectTypeTemplate, "id">;
        return {
          id: templateDoc.id,
          name: data.name,
          description: data.description || "",
          project: data.project,
        };
      });

      setTemplates(templateList);
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const citiesCol = collection(db, "cities");
      const snapshot = await getDocs(citiesCol);
      const cityList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as City[];
      setCities(cityList);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  useEffect(() => {
    fetchCities();
    fetchTemplates();

    const handleConfigRefresh = () => {
      fetchCities();
      fetchTemplates();
    };

    window.addEventListener("city-config-updated", handleConfigRefresh);

    return () => {
      window.removeEventListener("city-config-updated", handleConfigRefresh);
    };
  }, [db]);

  useEffect(() => {
    if (selectedCityId) {
      const city = cities.find((c) => c.id === selectedCityId);
      setSelectedCity(city || null);
      setProjects(city?.typesOfProjects || []);
      setEnforceUniqueFichaTecnicaCpf(Boolean(city?.enforceUniqueFichaTecnicaCpf));
      setExpandedProject(null);
      setShowAddProject(false);
    } else {
      setSelectedCity(null);
      setProjects([]);
      setEnforceUniqueFichaTecnicaCpf(false);
    }
  }, [selectedCityId, cities]);

  const persistProjects = async (nextProjects: Project[], successMessage: string) => {
    if (!selectedCityId) return;

    setSaving(true);
    try {
      const cityRef = doc(db, "cities", selectedCityId);
      await updateDoc(cityRef, {
        typesOfProjects: nextProjects,
        enforceUniqueFichaTecnicaCpf,
        updatedAt: new Date(),
      });

      await fetchCities();
      window.dispatchEvent(new Event("city-config-updated"));

      setCities((prev) =>
        prev.map((c) =>
          c.id === selectedCityId
            ? {
                ...c,
                typesOfProjects: nextProjects,
                enforceUniqueFichaTecnicaCpf,
              }
            : c
        )
      );

      setProjects(nextProjects);
      setToastType("success");
      setToastMessage(successMessage);
      setShowToast(true);
    } catch (error) {
      console.error("Error updating city projects:", error);
      setToastType("error");
      setToastMessage("Erro ao salvar alterações.");
      setShowToast(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedCityId) return;

    await persistProjects(projects, "Estrutura de projetos atualizada com sucesso!");
  };

  
  const handleApplyTemplate = () => {
    if (!selectedCityId) {
      setToastType("error");
      setToastMessage("Selecione um município para aplicar o modelo.");
      setShowToast(true);
      return;
    }

    if (!selectedTemplateId) {
      setToastType("error");
      setToastMessage("Selecione um modelo para aplicar.");
      setShowToast(true);
      return;
    }

    const template = templates.find((item) => item.id === selectedTemplateId);
    if (!template) {
      setToastType("error");
      setToastMessage("Modelo não encontrado.");
      setShowToast(true);
      return;
    }

    const appliedProject = cloneProject(template.project);
    appliedProject.baseType = template.project.baseType || template.project.name;
    setProjects((prev) => [...prev, appliedProject]);
    setToastType("success");
    setToastMessage(`Modelo \"${template.name}\" aplicado. Agora você pode editar e salvar no município.`);
    setShowToast(true);
  };

  const handleToggleAvailable = (projectIdx: number) => {
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === projectIdx ? { ...p, available: !p.available } : p
      )
    );
  };

  const handleRemoveProject = (projectIdx: number) => {
    if (confirm("Tem certeza que deseja remover este tipo de projeto?")) {
      setProjects((prev) => prev.filter((_, idx) => idx !== projectIdx));
    }
  };

  const handleOpenDescriptionModal = (projectIdx: number) => {
    setEditingProjectDescriptionIdx(projectIdx);
    setDescriptionDraft(projects[projectIdx]?.description || "");
  };

  const handleSaveDescription = () => {
    if (editingProjectDescriptionIdx === null) return;

    setProjects((prev) =>
      prev.map((project, idx) =>
        idx === editingProjectDescriptionIdx
          ? { ...project, description: descriptionDraft.trim() }
          : project
      )
    );

    setEditingProjectDescriptionIdx(null);
    setDescriptionDraft("");
  };

  const handleCancelDescriptionEdit = () => {
    setEditingProjectDescriptionIdx(null);
    setDescriptionDraft("");
  };

  const handleCloneProject = (projectIdx: number) => {
    const source = projects[projectIdx];
    if (!source) return;

    const existingNames = new Set(projects.map((p) => p.name));
    const baseName = `${source.name}_copia`;
    let newName = baseName;
    let suffix = 2;
    while (existingNames.has(newName)) {
      newName = `${baseName}_${suffix}`;
      suffix += 1;
    }

    const clone: Project = JSON.parse(JSON.stringify(source));
    clone.name = newName;
    clone.label = `${source.label} (cópia)`;
    clone.baseType = source.baseType || source.name;

    setProjects((prev) => {
      const next = [...prev];
      next.splice(projectIdx + 1, 0, clone);
      return next;
    });
    setExpandedProject(projectIdx + 1);
  };

  const handleStartEditLabel = (projectIdx: number) => {
    setEditingProjectLabelIdx(projectIdx);
    setLabelDraft(projects[projectIdx]?.label || "");
    setNameDraft(projects[projectIdx]?.name || "");
  };

  const migrateProjectTypeName = async (oldName: string, newName: string) => {
    if (!selectedCity?.cityId || oldName === newName) return 0;
    const q = query(
      collection(db, "projects"),
      where("cityId", "==", selectedCity.cityId),
      where("projectType", "==", oldName)
    );
    const snapshot = await getDocs(q);
    await Promise.all(
      snapshot.docs.map((projectDoc) =>
        updateDoc(doc(db, "projects", projectDoc.id), {
          projectType: newName,
          updatedAt: new Date(),
        })
      )
    );
    return snapshot.size;
  };

  const handleSaveLabel = async () => {
    if (editingProjectLabelIdx === null) return;
    const trimmedLabel = labelDraft.trim();
    const trimmedName = nameDraft.trim();
    if (!trimmedLabel || !trimmedName) return;

    const nameTaken = projects.some(
      (p, idx) => idx !== editingProjectLabelIdx && p.name === trimmedName
    );
    if (nameTaken) {
      setToastType("error");
      setToastMessage(`Já existe um tipo de projeto com o nome interno "${trimmedName}".`);
      setShowToast(true);
      return;
    }

    const previousName = projects[editingProjectLabelIdx]?.name || "";
    const nameChanged = previousName && previousName !== trimmedName;

    if (nameChanged) {
      const confirmed = confirm(
        `Renomear de "${previousName}" para "${trimmedName}" também atualizará os projetos existentes com esse tipo neste município. Continuar?`
      );
      if (!confirmed) return;
    }

    setProjects((prev) =>
      prev.map((project, idx) =>
        idx === editingProjectLabelIdx
          ? {
              ...project,
              label: trimmedLabel,
              name: trimmedName,
              baseType: project.baseType || previousName,
            }
          : project
      )
    );

    setEditingProjectLabelIdx(null);
    setLabelDraft("");
    setNameDraft("");

    if (nameChanged) {
      try {
        const migrated = await migrateProjectTypeName(previousName, trimmedName);
        setToastType("success");
        setToastMessage(
          migrated > 0
            ? `Tipo renomeado. ${migrated} projeto(s) migrado(s) para "${trimmedName}".`
            : `Tipo renomeado. Nenhum projeto existente foi afetado.`
        );
        setShowToast(true);
      } catch (error) {
        console.error("Error migrating project type name:", error);
        setToastType("error");
        setToastMessage("Erro ao migrar projetos existentes para o novo nome.");
        setShowToast(true);
      }
    }
  };

  const handleCancelLabelEdit = () => {
    setEditingProjectLabelIdx(null);
    setLabelDraft("");
    setNameDraft("");
  };

  const handleAddProject = () => {
    if (!newProject.name || !newProject.label) return;
    const projectToAdd: Project = {
      ...newProject,
      baseType: newProject.baseType || newProject.name,
    };
    setProjects((prev) => [...prev, projectToAdd]);
    setNewProject({
      name: "",
      label: "",
      description: "",
      available: true,
      acceptedProponentTypes: [...DEFAULT_PROPONENT_TYPES],
      fields: {},
    });
    setShowAddProject(false);
  };

  const cloneExtraFieldsConfig = (
    config: ExtraFieldsConfig = EXTRA_FIELDS_DEFAULT
  ): ExtraFieldsConfig => ({
    eixo: { label: config.eixo.label, options: config.eixo.options.map((o) => ({ ...o })) },
    moduloEixo1: { label: config.moduloEixo1.label, options: config.moduloEixo1.options.map((o) => ({ ...o })) },
    moduloEixo2: { label: config.moduloEixo2.label, options: config.moduloEixo2.options.map((o) => ({ ...o })) },
    categoria: { label: config.categoria.label, options: config.categoria.options.map((o) => ({ ...o })) },
  });

  const handleToggleExtraGeneralInfo = (projectIdx: number) => {
    setProjects((prev) =>
      prev.map((project, idx) => {
        if (idx !== projectIdx) return project;
        const enabling = !project.extraGeneralInfo;
        return {
          ...project,
          extraGeneralInfo: enabling,
          extraFields:
            enabling && !project.extraFields
              ? cloneExtraFieldsConfig()
              : project.extraFields,
        };
      })
    );
  };

  const updateExtraFieldsGroup = (
    projectIdx: number,
    groupKey: keyof ExtraFieldsConfig,
    updater: (group: ExtraFieldGroup) => ExtraFieldGroup
  ) => {
    setProjects((prev) =>
      prev.map((project, idx) => {
        if (idx !== projectIdx) return project;
        const currentConfig = cloneExtraFieldsConfig(project.extraFields);
        return {
          ...project,
          extraFields: {
            ...currentConfig,
            [groupKey]: updater(currentConfig[groupKey]),
          },
        };
      })
    );
  };

  const handleExtraFieldsGroupLabelChange = (
    projectIdx: number,
    groupKey: keyof ExtraFieldsConfig,
    label: string
  ) => {
    updateExtraFieldsGroup(projectIdx, groupKey, (group) => ({ ...group, label }));
  };

  const handleExtraFieldsOptionLabelChange = (
    projectIdx: number,
    groupKey: keyof ExtraFieldsConfig,
    optionIdx: number,
    label: string
  ) => {
    updateExtraFieldsGroup(projectIdx, groupKey, (group) => ({
      ...group,
      options: group.options.map((opt, i) => (i === optionIdx ? { ...opt, label } : opt)),
    }));
  };

  const handleExtraFieldsAddOption = (
    projectIdx: number,
    groupKey: keyof ExtraFieldsConfig
  ) => {
    updateExtraFieldsGroup(projectIdx, groupKey, (group) => {
      const newValue = `opcao_${group.options.length + 1}_${Date.now()}`;
      return {
        ...group,
        options: [...group.options, { value: newValue, label: "Nova opção" }],
      };
    });
  };

  const handleExtraFieldsRemoveOption = (
    projectIdx: number,
    groupKey: keyof ExtraFieldsConfig,
    optionIdx: number
  ) => {
    updateExtraFieldsGroup(projectIdx, groupKey, (group) => ({
      ...group,
      options: group.options.filter((_, i) => i !== optionIdx),
    }));
  };

  const handleGenerateProjectPDF = (project: Project) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups para gerar o PDF.");
      return;
    }

    const fieldsHtml = Object.entries(project.fields || {})
      .map(([section, fields]) => {
        const sectionLabel = SECTION_OPTIONS.find((s) => s.value === section)?.label || section;
        const fieldsListHtml = (fields as FieldItem[])
          .map(
            (f) =>
              `<li><strong>${f.label}</strong> (${f.name}) - Tipo: ${f.type}${f.required ? " - Obrigatório" : ""}</li>`
          )
          .join("");
        return `<h3>${sectionLabel}</h3><ul>${fieldsListHtml || "<li>Nenhum campo</li>"}</ul>`;
      })
      .join("");

    const proponentTypes = (project.acceptedProponentTypes || DEFAULT_PROPONENT_TYPES)
      .map((t) => PROPONENT_TYPE_OPTIONS.find((o) => o.value === t)?.label || t)
      .join(", ");

    const extraFieldsHtml = project.extraGeneralInfo && project.extraFields
      ? `<h3>Campos Extras</h3>
         <ul>
           ${Object.entries(project.extraFields)
             .map(([key, group]) => `<li><strong>${(group as ExtraFieldGroup).label}</strong>: ${(group as ExtraFieldGroup).options.map((o) => o.label).join(", ") || "Sem opções"}</li>`)
             .join("")}
         </ul>`
      : "";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Resumo - ${project.label}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { color: #1d4f5d; border-bottom: 2px solid #1d4f5d; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 20px; }
          h3 { color: #555; margin-top: 15px; font-size: 14px; }
          ul { margin: 5px 0; padding-left: 20px; }
          li { margin: 5px 0; font-size: 13px; }
          .info { background: #f5f5f5; padding: 10px; border-radius: 5px; margin: 10px 0; }
          .status { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; }
          .active { background: #d4edda; color: #155724; }
          .inactive { background: #f8d7da; color: #721c24; }
          @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${project.label}</h1>
        <div class="info">
          <p><strong>Nome interno:</strong> ${project.name}</p>
          <p><strong>Status:</strong> <span class="status ${project.available ? "active" : "inactive"}">${project.available ? "Ativo" : "Inativo"}</span></p>
          <p><strong>Tipos de proponente:</strong> ${proponentTypes}</p>
        </div>
        <h2>Descrição</h2>
        <p>${project.description || "Sem descrição"}</p>
        ${extraFieldsHtml}
        <h2>Campos do Projeto</h2>
        ${fieldsHtml || "<p>Nenhum campo configurado</p>"}
        <hr style="margin-top: 30px;">
        <p style="font-size: 11px; color: #888;">Gerado em ${new Date().toLocaleString("pt-BR")}</p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleToggleProjectProponentType = (projectIdx: number, tipo: ProponenteTipo) => {
    setProjects((prev) =>
      prev.map((project, idx) => {
        if (idx !== projectIdx) return project;

        const currentTypes =
          project.acceptedProponentTypes && project.acceptedProponentTypes.length > 0
            ? project.acceptedProponentTypes
            : [...DEFAULT_PROPONENT_TYPES];

        const updatedTypes = currentTypes.includes(tipo)
          ? currentTypes.filter((item) => item !== tipo)
          : [...currentTypes, tipo];

        return { ...project, acceptedProponentTypes: updatedTypes };
      })
    );
  };

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

  const handleAddSection = (projectIdx: number) => {
    if (!newSectionKey.trim()) return;
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === projectIdx
          ? { ...p, fields: { ...p.fields, [newSectionKey]: [] } }
          : p
      )
    );
    setNewSectionKey("");
    setAddingSectionToProject(null);
  };

  const handleRemoveSection = (projectIdx: number, sectionKey: string) => {
    if (confirm(`Remover seção "${sectionKey}" e todos os seus campos?`)) {
      setProjects((prev) =>
        prev.map((p, idx) => {
          if (idx !== projectIdx) return p;
          const newFields = { ...p.fields };
          delete newFields[sectionKey];
          return { ...p, fields: newFields };
        })
      );
    }
  };

  const handleAddField = (projectIdx: number, sectionKey: string) => {
    if (!newField.name || !newField.label) return;
    
    // Auto-set type to "file" for file-only sections
    const fieldToAdd = FILE_ONLY_SECTIONS.includes(sectionKey)
      ? { ...newField, type: "file" as const, options: [] }
      : newField;
    
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === projectIdx
          ? {
              ...p,
              fields: {
                ...p.fields,
                [sectionKey]: [...(p.fields[sectionKey] || []), fieldToAdd],
              },
            }
          : p
      )
    );
    setNewField({ name: "", label: "", type: "text", required: false, options: [] });
    setAddingFieldToProject(null);
    setNewFieldSection("");
    setNewOptionValue("");
    setNewOptionLabel("");
  };

  const handleRemoveField = (projectIdx: number, sectionKey: string, fieldIdx: number) => {
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === projectIdx
          ? {
              ...p,
              fields: {
                ...p.fields,
                [sectionKey]: p.fields[sectionKey].filter((_, i) => i !== fieldIdx),
              },
            }
          : p
      )
    );
  };

  const handleStartEditField = (projectIdx: number, sectionKey: string, fieldIdx: number, field: FieldItem) => {
    setEditingField({ projectIdx, sectionKey, fieldIdx });
    // Ensure all properties are properly initialized, especially options array
    setEditFieldValue({
      name: field.name || "",
      label: field.label || "",
      type: field.type || "text",
      required: field.required || false,
      options: field.options ? [...field.options] : [],
      disableOther: field.disableOther || false,
    });
  };

  const handleSaveEditField = () => {
    if (!editingField || !editFieldValue.name || !editFieldValue.label) return;
    const { projectIdx, sectionKey, fieldIdx } = editingField;
    
    // Create complete field object with all properties
    const fieldToSave: FieldItem = {
      name: editFieldValue.name,
      label: editFieldValue.label,
      type: editFieldValue.type,
      required: editFieldValue.required || false,
      options: editFieldValue.options || [],
      disableOther: editFieldValue.disableOther || false,
    };
    
    setProjects((prev) =>
      prev.map((p, idx) =>
        idx === projectIdx
          ? {
              ...p,
              fields: {
                ...p.fields,
                [sectionKey]: p.fields[sectionKey].map((f, i) =>
                  i === fieldIdx ? fieldToSave : f
                ),
              },
            }
          : p
      )
    );
    setEditingField(null);
    setEditFieldValue({ name: "", label: "", type: "text", options: [] });
    setEditOptionValue("");
    setEditOptionLabel("");
  };

  const handleCancelEditField = () => {
    setEditingField(null);
    setEditFieldValue({ name: "", label: "", type: "text", options: [] });
    setEditOptionValue("");
    setEditOptionLabel("");
  };

  const handleDragStart = (projectIdx: number, sectionKey: string, fieldIdx: number) => {
    setDraggedField({ projectIdx, sectionKey, fieldIdx });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (projectIdx: number, sectionKey: string, targetFieldIdx: number) => {
    if (!draggedField) return;
    
    // Only allow reordering within the same section
    if (draggedField.projectIdx !== projectIdx || draggedField.sectionKey !== sectionKey) {
      setDraggedField(null);
      return;
    }

    const sourceIdx = draggedField.fieldIdx;
    if (sourceIdx === targetFieldIdx) {
      setDraggedField(null);
      return;
    }

    setProjects((prev) =>
      prev.map((p, idx) => {
        if (idx !== projectIdx) return p;
        
        const fields = [...p.fields[sectionKey]];
        const [removed] = fields.splice(sourceIdx, 1);
        fields.splice(targetFieldIdx, 0, removed);
        
        return {
          ...p,
          fields: {
            ...p.fields,
            [sectionKey]: fields,
          },
        };
      })
    );

    setDraggedField(null);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  return (
    <div className="text-slate-900 dark:text-slate-100">
      <h2 className="text-2xl font-bold mb-4">Editar Estrutura de Projetos</h2>

      <SelectInput
        options={cities.map((city) => ({
          value: city.id,
          label: `${city.name} - ${city.uf}`,
        }))}
        value={selectedCityId}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          setSelectedCityId(e.target.value)
        }
        label="Selecione o município"
      />

      {selectedCity && (
        <div className="mt-4 p-3 border rounded bg-slate-50 dark:bg-slate-900/40">
          <label className="inline-flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={enforceUniqueFichaTecnicaCpf}
              onChange={(e) => setEnforceUniqueFichaTecnicaCpf(e.target.checked)}
            />
            <span>
              Impedir que o mesmo CPF apareça em mais de uma ficha técnica neste município
            </span>
          </label>
        </div>
      )}

      {selectedCity && (
        <div className="mt-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/40">
          <h3 className="text-base font-semibold mb-2">Aplicar modelo no município</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
            O modelo será copiado para este município. Depois da aplicação, você pode editar livremente sem alterar o modelo original.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 items-end">
            <div className="lg:col-span-2">
              <SelectInput
                options={templates.map((template) => ({
                  value: template.id,
                  label: template.description
                    ? `${template.name} - ${template.description}`
                    : template.name,
                }))}
                value={selectedTemplateId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setSelectedTemplateId(e.target.value)
                }
                label="Selecione o modelo"
              />
            </div>
            <Button
              label="Aplicar Modelo"
              onClick={handleApplyTemplate}
              disabled={!selectedTemplateId}
              size="small"
            />
          </div>
          {templates.length === 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Nenhum modelo encontrado. Crie modelos em /admin/project-type-templates.
            </p>
          )}
        </div>
      )}

      {selectedCity && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">
              Tipos de Projeto - {selectedCity.name}
            </h3>
            <Button
              label="Adicionar Tipo"
              onClick={() => setShowAddProject(true)}
              size="small"
            />
          </div>

          {/* Add New Project Form */}
          {showAddProject && (
            <div className="mb-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <h4 className="font-semibold mb-3">Novo Tipo de Projeto</h4>
              <div className="grid grid-cols-2 gap-4 mb-3">
                <SelectInput
                  options={PROJECT_TYPE_OPTIONS}
                  label="Nome Interno"
                  value={newProject.name}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNewProject((prev) => ({
                      ...prev,
                      name: e.target.value,
                      baseType: e.target.value,
                    }))
                  }
                />
                <div>
                  <label className="block text-sm font-medium mb-1">Rótulo Visível</label>
                  <input
                    type="text"
                    value={newProject.label}
                    onChange={(e) =>
                      setNewProject((prev) => ({ ...prev, label: e.target.value }))
                    }
                    className="border border-slate-200 dark:border-slate-600 p-2 rounded w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                    placeholder="Ex: Fomento Cultural"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) =>
                    setNewProject((prev) => ({ ...prev, description: e.target.value }))
                  }
                  className="border border-slate-200 dark:border-slate-600 p-2 rounded w-full text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  rows={2}
                  placeholder="Descrição do tipo de projeto"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium mb-2">Tipos de proponente aceitos</label>
                <div className="flex flex-wrap gap-3">
                  {PROPONENT_TYPE_OPTIONS.map((option) => {
                    const checked = (newProject.acceptedProponentTypes || DEFAULT_PROPONENT_TYPES).includes(option.value);
                    return (
                      <label key={option.value} className="inline-flex items-center gap-2 text-sm text-slate-700">
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
              <div className="flex gap-2">
                <Button label="Adicionar" onClick={handleAddProject} size="small" />
                <Button
                  label="Cancelar"
                  onClick={() => setShowAddProject(false)}
                  size="small"
                  variant="outlined"
                />
              </div>
            </div>
          )}

          {/* Projects List */}
          {projects.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400">
              Nenhum tipo de projeto configurado.
            </p>
          ) : (
            <div className="space-y-4">
              {projects.map((project, projectIdx) => (
                <div
                  key={projectIdx}
                  className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900"
                >
                  {/* Project Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-800 cursor-pointer"
                    onClick={() =>
                      setExpandedProject(
                        expandedProject === projectIdx ? null : projectIdx
                      )
                    }
                  >
                    <div className="flex items-center gap-3">
                      {expandedProject === projectIdx ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                      <div onClick={(e) => e.stopPropagation()}>
                        {editingProjectLabelIdx === projectIdx ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              value={labelDraft}
                              onChange={(e) => setLabelDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveLabel();
                                if (e.key === "Escape") handleCancelLabelEdit();
                              }}
                              autoFocus
                              placeholder="Rótulo visível"
                              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            />
                            <input
                              type="text"
                              value={nameDraft}
                              onChange={(e) => setNameDraft(e.target.value.replace(/\s+/g, ""))}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveLabel();
                                if (e.key === "Escape") handleCancelLabelEdit();
                              }}
                              placeholder="Nome interno (sem espaços)"
                              className="border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                            />
                            <button
                              onClick={handleSaveLabel}
                              className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelLabelEdit}
                              className="text-xs px-2 py-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="font-semibold">{project.label}</span>
                            <span className="ml-2 text-sm text-slate-500">
                              ({project.name})
                            </span>
                            <button
                              onClick={() => handleStartEditLabel(projectIdx)}
                              className="ml-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 size={12} /> Editar
                            </button>
                          </>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          project.available
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {project.available ? "Ativo" : "Inativo"}
                      </span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleToggleAvailable(projectIdx)}
                        className={`px-3 py-1 text-sm rounded ${
                          project.available
                            ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {project.available ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleCloneProject(projectIdx)}
                        className="px-3 py-1 text-sm rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Clonar
                      </button>
                      <button
                        onClick={() => handleGenerateProjectPDF(project)}
                        className="px-3 py-1 text-sm rounded bg-purple-100 text-purple-700 hover:bg-purple-200 inline-flex items-center gap-1"
                        title="Gerar PDF"
                      >
                        <FileDown size={14} /> PDF
                      </button>
                      <button
                        onClick={() => handleRemoveProject(projectIdx)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Project Content */}
                  {expandedProject === projectIdx && (
                    <div className="p-4 border-t">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {project.description || "placeholder"}
                        </p>
                        <button
                          onClick={() => handleOpenDescriptionModal(projectIdx)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 whitespace-nowrap"
                        >
                          <Edit2 size={14} /> Editar descrição
                        </button>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                          Link do edital
                        </label>
                        <input
                          type="url"
                          value={project.editalLink || ""}
                          onChange={(e) =>
                            setProjects((prev) =>
                              prev.map((p, idx) =>
                                idx === projectIdx ? { ...p, editalLink: e.target.value } : p
                              )
                            )
                          }
                          placeholder="https://..."
                          className="w-full border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          URL aberta ao clicar em &quot;LER OBJETO DO EDITAL&quot; durante a criação do projeto.
                        </p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Tipos de proponente aceitos</p>
                        <div className="flex flex-wrap gap-3">
                          {PROPONENT_TYPE_OPTIONS.map((option) => {
                            const selectedTypes =
                              project.acceptedProponentTypes && project.acceptedProponentTypes.length > 0
                                ? project.acceptedProponentTypes
                                : DEFAULT_PROPONENT_TYPES;

                            return (
                              <label key={`${projectIdx}-${option.value}`} className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                                <input
                                  type="checkbox"
                                  checked={selectedTypes.includes(option.value)}
                                  onChange={() => handleToggleProjectProponentType(projectIdx, option.value)}
                                />
                                {option.label}
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {selectedCity && (
                        <div className="mb-4 p-3 border border-slate-200 dark:border-slate-700 rounded bg-slate-50 dark:bg-slate-900/40">
                          <label className="inline-flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                            <input
                              type="checkbox"
                              checked={Boolean(project.extraGeneralInfo)}
                              onChange={() => handleToggleExtraGeneralInfo(projectIdx)}
                            />
                            <span>
                              Adicionar campos extras antes das Informações Gerais
                            </span>
                          </label>

                          {project.extraGeneralInfo && (() => {
                            const config = project.extraFields || EXTRA_FIELDS_DEFAULT;
                            const groups: { key: keyof ExtraFieldsConfig; title: string }[] = [
                              { key: "eixo", title: "Select: Eixo" },
                              { key: "moduloEixo1", title: "Select: Módulo (quando Eixo 1)" },
                              { key: "moduloEixo2", title: "Select: Módulo (quando Eixo 2)" },
                              { key: "categoria", title: "Select: Categoria" },
                            ];
                            return (
                              <div className="mt-3 space-y-3">
                                {groups.map(({ key, title }) => {
                                  const group = config[key];
                                  return (
                                    <div
                                      key={key}
                                      className="p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-900"
                                    >
                                      <p className="text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
                                        {title}
                                      </p>
                                      <label className="block text-xs mb-1 text-slate-600 dark:text-slate-400">
                                        Rótulo
                                      </label>
                                      <input
                                        type="text"
                                        value={group.label}
                                        onChange={(e) =>
                                          handleExtraFieldsGroupLabelChange(projectIdx, key, e.target.value)
                                        }
                                        className="mb-2 w-full border border-slate-200 dark:border-slate-600 p-1 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                      />
                                      <p className="text-xs font-medium mb-1 text-slate-600 dark:text-slate-400">Opções</p>
                                      <div className="space-y-1">
                                        {group.options.map((opt, optIdx) => (
                                          <div key={opt.value + optIdx} className="grid grid-cols-2 gap-1">
                                            <input
                                              type="text"
                                              value={opt.value}
                                              readOnly
                                              className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800"
                                            />
                                            <div className="flex gap-1">
                                              <input
                                                type="text"
                                                value={opt.label}
                                                onChange={(e) =>
                                                  handleExtraFieldsOptionLabelChange(projectIdx, key, optIdx, e.target.value)
                                                }
                                                className="flex-1 border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                              />
                                              <button
                                                onClick={() => handleExtraFieldsRemoveOption(projectIdx, key, optIdx)}
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <X size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                      <button
                                        onClick={() => handleExtraFieldsAddOption(projectIdx, key)}
                                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                      >
                                        <Plus size={12} /> Adicionar opção
                                      </button>
                                    </div>
                                  );
                                })}
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  O valor (coluna esquerda) é fixo e usado para identificar cada opção internamente.
                                </p>
                              </div>
                            );
                          })()}
                        </div>
                      )}

                      {/* Sections */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium">Seções</h5>
                          <button
                            onClick={() =>
                              setAddingSectionToProject(
                                addingSectionToProject === projectIdx
                                  ? null
                                  : projectIdx
                              )
                            }
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                          >
                            <Plus size={16} /> Adicionar Seção
                          </button>
                        </div>

                        {/* Add Section Form */}
                        {addingSectionToProject === projectIdx && (
                          <div className="flex gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded">
                            <SelectInput
                              options={SECTION_OPTIONS}
                              value={newSectionKey}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setNewSectionKey(e.target.value)
                              }
                              label=""
                            />
                            <button
                              onClick={() => handleAddSection(projectIdx)}
                              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                            >
                              Adicionar
                            </button>
                            <button
                              onClick={() => {
                                setAddingSectionToProject(null);
                                setNewSectionKey("");
                              }}
                              className="px-3 py-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}

                        {Object.keys(project.fields || {}).length === 0 ? (
                          <p className="text-sm text-slate-400">
                            Nenhuma seção configurada.
                          </p>
                        ) : (
                          Object.entries(project.fields).map(
                            ([sectionKey, fields]) => (
                              <div
                                key={sectionKey}
                                className="border rounded p-3 bg-slate-50 dark:bg-slate-800"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-medium text-sm">
                                    {SECTION_OPTIONS.find((s) => s.value === sectionKey)?.label || sectionKey}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        setAddingFieldToProject(projectIdx);
                                        setNewFieldSection(sectionKey);
                                      }}
                                      className="text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      + Campo
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleRemoveSection(projectIdx, sectionKey)
                                      }
                                      className="text-xs text-red-600 hover:text-red-700"
                                    >
                                      Remover Seção
                                    </button>
                                  </div>
                                </div>

                                {/* Add Field Form */}
                                {addingFieldToProject === projectIdx &&
                                  newFieldSection === sectionKey && (
                                    <div className="mb-3 p-3 bg-white dark:bg-slate-700 rounded border border-slate-300">
                                      <div className="grid grid-cols-2 gap-2 mb-2">
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
                                      <div className="grid grid-cols-2 gap-2 mb-2">
                                        {FILE_ONLY_SECTIONS.includes(sectionKey) ? (
                                          <div className="flex items-center text-sm text-slate-500">
                                            <span className="px-2 py-1 bg-slate-100 rounded">Tipo: Arquivo</span>
                                          </div>
                                        ) : (
                                          <select
                                            value={newField.type}
                                            onChange={(e) =>
                                              setNewField((prev) => ({
                                                ...prev,
                                                type: e.target.value as FieldItem["type"],
                                              }))
                                            }
                                            className="border border-slate-200 dark:border-slate-600 p-1 rounded text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                          >
                                            {FIELD_TYPES.map((ft) => (
                                              <option key={ft.value} value={ft.value}>
                                                {ft.label}
                                              </option>
                                            ))}
                                          </select>
                                        )}
                                        <label className="flex items-center gap-2 text-sm">
                                          <input
                                            type="checkbox"
                                            checked={newField.required || false}
                                            onChange={(e) =>
                                              setNewField((prev) => ({
                                                ...prev,
                                                required: e.target.checked,
                                              }))
                                            }
                                          />
                                          Obrigatório
                                        </label>
                                      </div>
                                      
                                      {/* Options for select/multiselect/radio - only show if not file-only section */}
                                      {!FILE_ONLY_SECTIONS.includes(sectionKey) && ["select", "multiselect", "radio"].includes(newField.type) && (
                                        <div className="mb-2 p-2 bg-slate-100 dark:bg-slate-600 rounded">
                                          {["select", "multiselect"].includes(newField.type) && (
                                            <label className="flex items-center gap-2 text-xs mb-2">
                                              <input
                                                type="checkbox"
                                                checked={!newField.disableOther}
                                                onChange={(e) =>
                                                  setNewField((prev) => ({
                                                    ...prev,
                                                    disableOther: !e.target.checked,
                                                  }))
                                                }
                                              />
                                              Incluir opção &quot;Outro&quot;
                                            </label>
                                          )}
                                          <div className="text-xs font-medium mb-1">Opções:</div>
                                          {(newField.options || []).map((opt, optIdx) => (
                                            <div key={optIdx} className="grid grid-cols-2 gap-1 mb-1 text-xs">
                                              <input
                                                type="text"
                                                value={opt.value}
                                                readOnly
                                                className="border border-slate-200 dark:border-slate-500 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                                              />
                                              <div className="flex gap-1">
                                                <input
                                                  type="text"
                                                  value={opt.label}
                                                  onChange={(e) => {
                                                    const label = e.target.value;
                                                    setNewField((prev) => ({
                                                      ...prev,
                                                      options: (prev.options || []).map((existingOpt, i) =>
                                                        i === optIdx
                                                          ? { label, value: toFieldKey(label) }
                                                          : existingOpt
                                                      ),
                                                    }));
                                                  }}
                                                  className="border border-slate-200 dark:border-slate-500 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                                                />
                                              <button
                                                onClick={() =>
                                                  setNewField((prev) => ({
                                                    ...prev,
                                                    options: prev.options?.filter((_, i) => i !== optIdx),
                                                  }))
                                                }
                                                className="text-red-500 hover:text-red-700"
                                              >
                                                <X size={12} />
                                              </button>
                                              </div>
                                            </div>
                                          ))}
                                          <div className="flex gap-1 mt-1">
                                            <input
                                              type="text"
                                              placeholder="Valor"
                                              value={newOptionValue}
                                              readOnly
                                              className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                            />
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 w-full">
                                              Gerado automaticamente pelo rótulo.
                                            </p>
                                            <input
                                              type="text"
                                              placeholder="Rótulo"
                                              value={newOptionLabel}
                                              onChange={(e) => {
                                                const label = e.target.value;
                                                setNewOptionLabel(label);
                                                setNewOptionValue(toFieldKey(label));
                                              }}
                                              className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                            />
                                            <button
                                              onClick={() => {
                                                if (newOptionValue && newOptionLabel) {
                                                  setNewField((prev) => ({
                                                    ...prev,
                                                    options: [...(prev.options || []), { value: newOptionValue, label: newOptionLabel }],
                                                  }));
                                                  setNewOptionValue("");
                                                  setNewOptionLabel("");
                                                }
                                              }}
                                              className="p-1 bg-blue-500 text-white rounded text-xs"
                                            >
                                              <Plus size={12} />
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="flex gap-2 justify-end">
                                        <button
                                          onClick={() =>
                                            handleAddField(projectIdx, sectionKey)
                                          }
                                          className="px-2 py-1 bg-green-600 text-white rounded text-sm"
                                        >
                                          Adicionar
                                        </button>
                                        <button
                                          onClick={() => {
                                            setAddingFieldToProject(null);
                                            setNewFieldSection("");
                                            setNewField({ name: "", label: "", type: "text", required: false, options: [] });
                                          }}
                                          className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-sm"
                                        >
                                          Cancelar
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                {/* Fields List */}
                                {fields.length === 0 ? (
                                  <p className="text-xs text-slate-400">
                                    Nenhum campo.
                                  </p>
                                ) : (
                                  <ul className="space-y-1">
                                    {fields.map((field, fieldIdx) => (
                                      <li
                                        key={fieldIdx}
                                        draggable={!editingField}
                                        onDragStart={() => handleDragStart(projectIdx, sectionKey, fieldIdx)}
                                        onDragOver={handleDragOver}
                                        onDrop={() => handleDrop(projectIdx, sectionKey, fieldIdx)}
                                        onDragEnd={handleDragEnd}
                                        className={`text-sm py-2 px-2 bg-white dark:bg-slate-700 rounded flex items-start gap-2 ${
                                          draggedField?.projectIdx === projectIdx &&
                                          draggedField?.sectionKey === sectionKey &&
                                          draggedField?.fieldIdx === fieldIdx
                                            ? "opacity-50"
                                            : ""
                                        }`}
                                      >
                                        {editingField?.projectIdx === projectIdx &&
                                        editingField?.sectionKey === sectionKey &&
                                        editingField?.fieldIdx === fieldIdx ? (
                                          <div className="space-y-2">
                                            <div className="grid grid-cols-2 gap-2">
                                              <input
                                                type="text"
                                                placeholder="Nome (key)"
                                                value={editFieldValue.name}
                                                readOnly
                                                className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                              />
                                              <input
                                                type="text"
                                                placeholder="Rótulo"
                                                value={editFieldValue.label}
                                                onChange={(e) =>
                                                  setEditFieldValue((prev) => {
                                                    const label = e.target.value;
                                                    return {
                                                      ...prev,
                                                      label,
                                                      name: toFieldKey(label),
                                                    };
                                                  })
                                                }
                                                className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                              />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                              {FILE_ONLY_SECTIONS.includes(sectionKey) ? (
                                                <div className="flex items-center text-xs text-slate-500">
                                                  <span className="px-2 py-1 bg-slate-100 rounded">Tipo: Arquivo</span>
                                                </div>
                                              ) : (
                                                <select
                                                  value={editFieldValue.type}
                                                  onChange={(e) =>
                                                    setEditFieldValue((prev) => ({
                                                      ...prev,
                                                      type: e.target.value as FieldItem["type"],
                                                    }))
                                                  }
                                                  className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                                >
                                                  {FIELD_TYPES.map((ft) => (
                                                    <option key={ft.value} value={ft.value}>
                                                      {ft.label}
                                                    </option>
                                                  ))}
                                                </select>
                                              )}
                                              <label className="flex items-center gap-2 text-xs">
                                                <input
                                                  type="checkbox"
                                                  checked={editFieldValue.required || false}
                                                  onChange={(e) =>
                                                    setEditFieldValue((prev) => ({
                                                      ...prev,
                                                      required: e.target.checked,
                                                    }))
                                                  }
                                                />
                                                Obrigatório
                                              </label>
                                            </div>
                                            {!FILE_ONLY_SECTIONS.includes(sectionKey) && ["select", "multiselect", "radio"].includes(editFieldValue.type) && (
                                              <div className="p-2 bg-slate-100 dark:bg-slate-600 rounded text-xs">
                                                {["select", "multiselect"].includes(editFieldValue.type) && (
                                                  <label className="flex items-center gap-2 text-xs mb-2">
                                                    <input
                                                      type="checkbox"
                                                      checked={!editFieldValue.disableOther}
                                                      onChange={(e) =>
                                                        setEditFieldValue((prev) => ({
                                                          ...prev,
                                                          disableOther: !e.target.checked,
                                                        }))
                                                      }
                                                    />
                                                    Incluir opção &quot;Outro&quot;
                                                  </label>
                                                )}
                                                <div className="font-medium mb-1">Opções:</div>
                                                {(editFieldValue.options || []).map((opt, optIdx) => (
                                                  <div key={optIdx} className="grid grid-cols-2 gap-1 mb-1">
                                                    <input
                                                      type="text"
                                                      value={opt.value}
                                                      readOnly
                                                      className="border border-slate-200 dark:border-slate-500 p-1 rounded text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                                                    />
                                                    <div className="flex gap-1">
                                                      <input
                                                        type="text"
                                                        value={opt.label}
                                                        onChange={(e) => {
                                                          const label = e.target.value;
                                                          setEditFieldValue((prev) => ({
                                                            ...prev,
                                                            options: (prev.options || []).map((existingOpt, i) =>
                                                              i === optIdx
                                                                ? { label, value: toFieldKey(label) }
                                                                : existingOpt
                                                            ),
                                                          }));
                                                        }}
                                                        className="border border-slate-200 dark:border-slate-500 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700"
                                                      />
                                                    <button
                                                      onClick={() =>
                                                        setEditFieldValue((prev) => ({
                                                          ...prev,
                                                          options: prev.options?.filter((_, i) => i !== optIdx),
                                                        }))
                                                      }
                                                      className="text-red-500"
                                                    >
                                                      <X size={12} />
                                                    </button>
                                                    </div>
                                                  </div>
                                                ))}
                                                <div className="flex gap-1 mt-1">
                                                  <input
                                                    type="text"
                                                    placeholder="Valor"
                                                    value={editOptionValue}
                                                    readOnly
                                                    className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                                  />
                                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 w-full">
                                                    Gerado automaticamente pelo rótulo.
                                                  </p>
                                                  <input
                                                    type="text"
                                                    placeholder="Rótulo"
                                                    value={editOptionLabel}
                                                    onChange={(e) => {
                                                      const label = e.target.value;
                                                      setEditOptionLabel(label);
                                                      setEditOptionValue(toFieldKey(label));
                                                    }}
                                                    className="border border-slate-200 dark:border-slate-600 p-1 rounded text-xs flex-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                                                  />
                                                  <button
                                                    onClick={() => {
                                                      if (editOptionValue && editOptionLabel) {
                                                        setEditFieldValue((prev) => ({
                                                          ...prev,
                                                          options: [...(prev.options || []), { value: editOptionValue, label: editOptionLabel }],
                                                        }));
                                                        setEditOptionValue("");
                                                        setEditOptionLabel("");
                                                      }
                                                    }}
                                                    className="p-1 bg-blue-500 text-white rounded"
                                                  >
                                                    <Plus size={12} />
                                                  </button>
                                                </div>
                                              </div>
                                            )}
                                            <div className="flex gap-2 justify-end">
                                              <button
                                                onClick={handleSaveEditField}
                                                className="px-2 py-1 bg-green-600 text-white rounded text-xs"
                                              >
                                                Salvar
                                              </button>
                                              <button
                                                onClick={handleCancelEditField}
                                                className="px-2 py-1 bg-slate-300 text-slate-700 rounded text-xs"
                                              >
                                                Cancelar
                                              </button>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-start justify-between flex-1 min-w-0 gap-2">
                                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                              <GripVertical 
                                                size={16} 
                                                className="text-slate-400 cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5" 
                                              />
                                              <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-1">
                                                  <span className="font-medium break-words">{field.label}</span>
                                                  <span className="ml-2 text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded whitespace-nowrap">
                                                    {FIELD_TYPES.find(ft => ft.value === field.type)?.label || field.type || "texto"}
                                                  </span>
                                                  {field.required && (
                                                    <span className="text-xs text-red-500">*</span>
                                                  )}
                                                  {field.options && field.options.length > 0 && (
                                                    <span className="text-xs text-slate-400 whitespace-nowrap">
                                                      ({field.options.length} opções)
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-xs text-slate-400 break-all">({field.name})</span>
                                              </div>
                                            </div>
                                            <div className="flex gap-1 flex-shrink-0">
                                              <button
                                                onClick={() =>
                                                  handleStartEditField(
                                                    projectIdx,
                                                    sectionKey,
                                                    fieldIdx,
                                                    field
                                                  )
                                                }
                                                className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                              >
                                                <Edit2 size={14} />
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleRemoveField(
                                                    projectIdx,
                                                    sectionKey,
                                                    fieldIdx
                                                  )
                                                }
                                                className="p-1 text-red-600 hover:bg-red-100 rounded"
                                              >
                                                <Trash2 size={14} />
                                              </button>
                                            </div>
                                          </div>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              label={saving ? "Salvando..." : "Salvar Alterações"}
              onClick={handleSaveChanges}
              disabled={saving}
            />
          </div>
        </div>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      {editingProjectDescriptionIdx !== null && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-lg bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Editar descrição do tipo de projeto
              </h4>
            </div>

            <div className="p-4">
              <textarea
                value={descriptionDraft}
                onChange={(e) => setDescriptionDraft(e.target.value)}
                className="w-full min-h-[140px] border border-slate-300 dark:border-slate-600 rounded p-3 text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                placeholder="Digite a descrição do tipo de projeto"
              />
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                onClick={handleCancelDescriptionEdit}
                className="px-3 py-1.5 rounded bg-slate-200 text-slate-800 hover:bg-slate-300 text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveDescription}
                className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditCityProjects;
