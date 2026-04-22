import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import { TextAreaInput } from "@/app/components/TextAreaInput";
import { TextInput } from "@/app/components/TextInput";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { useLogging } from "@/app/hooks/useLogging";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

interface FieldOption {
  value: string;
  label: string;
}

interface FieldConfig {
  name: string;
  label?: string;
  type?: "text" | "textarea" | "select" | "multiselect" | "radio" | "checkbox" | "file";
  required?: boolean;
  options?: FieldOption[];
  disableOther?: boolean;
}

const OTHER_OPTION: FieldOption = { value: "outro", label: "Outro" };

const getOptionsWithOther = (options?: FieldOption[]) => {
  const safeOptions = Array.isArray(options) ? options : [];
  return safeOptions.some((opt) => opt.value === OTHER_OPTION.value)
    ? safeOptions
    : [...safeOptions, OTHER_OPTION];
};

const getOtherFieldKey = (fieldName: string) => `${fieldName}__outro`;

type FormValues = Record<string, string | string[]>;
type ProjectDetails = {
  name?: string | null;
  itapeviExtraGeneralInfo?: boolean;
  itapeviExtraFields?: Partial<ItapeviExtraFieldsConfig>;
  fields?: {
    generalInfo?: FieldConfig[];
  };
};

export type ItapeviFieldGroup = {
  label: string;
  options: FieldOption[];
};

export type ItapeviExtraFieldsConfig = {
  eixo: ItapeviFieldGroup;
  moduloEixo1: ItapeviFieldGroup;
  moduloEixo2: ItapeviFieldGroup;
};

export const ITAPEVI_EXTRA_FIELDS_DEFAULT: ItapeviExtraFieldsConfig = {
  eixo: {
    label: "Escolha o Eixo",
    options: [
      { value: "eixo_1", label: "Eixo 1 – Demais Áreas" },
      { value: "eixo_2", label: "Eixo 2 - Áreas Periféricas" },
    ],
  },
  moduloEixo1: {
    label: "Escolha o módulo",
    options: [
      { value: "modulo_i", label: "Módulo I" },
      { value: "modulo_ii", label: "Módulo II" },
      { value: "modulo_iii", label: "Módulo III" },
    ],
  },
  moduloEixo2: {
    label: "Escolha o módulo",
    options: [{ value: "modulo_unico", label: "Módulo Único" }],
  },
};

const mergeItapeviExtraConfig = (
  config: Partial<ItapeviExtraFieldsConfig> | undefined
): ItapeviExtraFieldsConfig => ({
  eixo: {
    label: config?.eixo?.label || ITAPEVI_EXTRA_FIELDS_DEFAULT.eixo.label,
    options: config?.eixo?.options && config.eixo.options.length > 0
      ? config.eixo.options
      : ITAPEVI_EXTRA_FIELDS_DEFAULT.eixo.options,
  },
  moduloEixo1: {
    label: config?.moduloEixo1?.label || ITAPEVI_EXTRA_FIELDS_DEFAULT.moduloEixo1.label,
    options: config?.moduloEixo1?.options && config.moduloEixo1.options.length > 0
      ? config.moduloEixo1.options
      : ITAPEVI_EXTRA_FIELDS_DEFAULT.moduloEixo1.options,
  },
  moduloEixo2: {
    label: config?.moduloEixo2?.label || ITAPEVI_EXTRA_FIELDS_DEFAULT.moduloEixo2.label,
    options: config?.moduloEixo2?.options && config.moduloEixo2.options.length > 0
      ? config.moduloEixo2.options
      : ITAPEVI_EXTRA_FIELDS_DEFAULT.moduloEixo2.options,
  },
});

const getItapeviExtraFields = (
  eixo: string | string[] | undefined,
  config: ItapeviExtraFieldsConfig
): FieldConfig[] => {
  const eixoValue = typeof eixo === "string" ? eixo : "";
  const base: FieldConfig[] = [
    {
      name: "itapevi_eixo",
      label: config.eixo.label,
      type: "select",
      options: config.eixo.options,
      disableOther: true,
    },
  ];
  if (eixoValue === "eixo_1") {
    return [
      ...base,
      {
        name: "itapevi_modulo",
        label: config.moduloEixo1.label,
        type: "select",
        options: config.moduloEixo1.options,
        disableOther: true,
      },
    ];
  }
  if (eixoValue === "eixo_2") {
    return [
      ...base,
      {
        name: "itapevi_modulo",
        label: config.moduloEixo2.label,
        type: "select",
        options: config.moduloEixo2.options,
        disableOther: true,
      },
    ];
  }
  return base;
};

const ITAPEVI_EXTRA_FIELD_NAMES = ["itapevi_eixo", "itapevi_modulo"];

const InfoGerais = () => {
  const [detalhesProjeto, setDetalhesProjetos] = useState<FieldConfig[]>([]);
  const [showItapeviExtras, setShowItapeviExtras] = useState(false);
  const [itapeviExtraConfig, setItapeviExtraConfig] = useState<ItapeviExtraFieldsConfig>(ITAPEVI_EXTRA_FIELDS_DEFAULT);
  const [formValues, setFormValues] = useState<FormValues>({
    categoria: "",
    modalidade: "",
  });
  const searchParams = useSearchParams();
  const city = useCity();
  const { dbUser } = useAuth();
  const loggingService = useLogging();
  const projectId = searchParams.get("projectId");
  const projectType = searchParams.get("state");

  useEffect(() => {
    const availableTypes: ProjectDetails[] = Array.isArray(city?.city?.typesOfProjects)
      ? city.city.typesOfProjects
      : [];

    const projectDetails = availableTypes.find(
      (project) => project?.name === projectType
    );

    const generalInfoFields = Array.isArray(projectDetails?.fields?.generalInfo)
      ? projectDetails.fields.generalInfo
      : [];

    setDetalhesProjetos(generalInfoFields);

    const enableItapeviExtras =
      Boolean(projectDetails?.itapeviExtraGeneralInfo) && city?.city?.cityId === "3594";
    setShowItapeviExtras(enableItapeviExtras);
    setItapeviExtraConfig(mergeItapeviExtraConfig(projectDetails?.itapeviExtraFields));

    const extraFieldNames = enableItapeviExtras ? ITAPEVI_EXTRA_FIELD_NAMES : [];

    const newFields = Object.fromEntries(
      [
        ...extraFieldNames.map((name) => [name, ""] as const),
        ...generalInfoFields
          .filter((field) => field?.name)
          .map((field) => [field.name, ""] as const),
      ]
    );

    setFormValues((prev) => ({
      ...prev,
      categoria: prev.categoria || "",
      modalidade: prev.modalidade || "",
      ...newFields,
    }));
  }, [city?.city?.typesOfProjects, projectType]);

  useEffect(() => {
    if (!projectId) return;
    getProjectFromDb(projectId);
  }, [projectId]);

  const persistGeneralInfo = async (projectId: string, values: FormValues, { log = true }: { log?: boolean } = {}) => {
    if (!projectId) return console.error("Projeto não encontrado");

    const projectQuery = query(
      collection(db, "projects"),
      where("projectId", "==", projectId)
    );
    const projectSnapshot = await getDocs(projectQuery);

    if (projectSnapshot.empty) {
      console.error("No project found with projectId:", projectId);
      return;
    }

    const projectDoc = projectSnapshot.docs[0];
    const projectRef = doc(db, "projects", projectDoc.id);

    await updateDoc(projectRef, {
      generalInfo: values,
      updatedAt: new Date(),
      updatedBy: dbUser?.id,
    });

    if (log) {
      const projectSnap = await getDoc(projectRef);
      const projectTitle = projectSnap.data()?.projectTitle || projectId;
      await loggingService.logProjectUpdate(
        projectId,
        "infoGerais",
        { projectType },
        dbUser?.email,
        `${dbUser?.firstName} ${dbUser?.lastName}`,
        projectTitle
      );
    }
  };

  const handleChange = (
    key: keyof FormValues,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setFormValues((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "itapevi_eixo" && prev.itapevi_eixo !== value) {
        next.itapevi_modulo = "";
      }
      if ((key === "itapevi_eixo" || key === "itapevi_modulo") && projectId) {
        void persistGeneralInfo(projectId, next, { log: false });
      }
      return next;
    });
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!projectId) return console.error("Projeto não encontrado");
    console.log("Saving generalInfo with projectId:", projectId);
    console.log("formValues to save:", JSON.stringify(formValues, null, 2));

    const projectQuery = query(
      collection(db, "projects"),
      where("projectId", "==", projectId)
    );
    const projectSnapshot = await getDocs(projectQuery);

    if (projectSnapshot.empty) {
      console.error("No project found with projectId:", projectId);
      return;
    }

    const projectDoc = projectSnapshot.docs[0];
    const projectRef = doc(db, "projects", projectDoc.id);

    await updateDoc(projectRef, {
      generalInfo: formValues,
      updatedAt: new Date(),
      updatedBy: dbUser?.id,
    });
    
    console.log("generalInfo saved successfully to doc:", projectDoc.id);

    // Get project title for email
    const projectSnap = await getDoc(projectRef);
    const projectTitle = projectSnap.data()?.projectTitle || projectId;

    // Log update with email notification
    await loggingService.logProjectUpdate(
      projectId,
      "infoGerais",
      { projectType },
      dbUser?.email,
      `${dbUser?.firstName} ${dbUser?.lastName}`,
      projectTitle
    );
  };

  const getProjectFromDb = async (projectId: string) => {
    if (!projectId) return;

    try {
      const projectQuery = query(
        collection(db, "projects"),
        where("projectId", "==", projectId)
      );

      const projectSnapshot = await getDocs(projectQuery);
      const projectDoc = projectSnapshot.docs[0];

      if (!projectDoc) {
        return null;
      }

      const data = projectDoc.data();
      if (data.generalInfo) {
        setFormValues((prev) => ({
          ...prev,
          ...data.generalInfo,
        }));
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  };

  const renderField = (field: FieldConfig) => {
    const fieldType = field.type || "textarea";
    const fieldValue = formValues[field.name] || "";

    switch (fieldType) {
      case "text":
        return (
          <TextInput
            key={field.name}
            label={field.label}
            value={fieldValue as string}
            onChange={(e: any) => handleChange(field.name, e.target.value)}
          />
        );
      
      case "textarea":
        return (
          <TextAreaInput
            key={field.name}
            label={field.label}
            value={fieldValue as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
      
      case "select": {
        const allowOther = !field.disableOther;
        const optionsToShow = allowOther ? getOptionsWithOther(field.options) : (field.options || []);
        const otherFieldKey = getOtherFieldKey(field.name);
        const selectedValue = fieldValue as string;
        const showOtherInput = allowOther && selectedValue === OTHER_OPTION.value;
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <SelectInput
              label={field.label}
              options={optionsToShow}
              value={selectedValue}
              onChange={(e: any) => {
                const nextValue = e?.target?.value || "";
                setFormValues((prev) => {
                  const next: FormValues = { ...prev, [field.name]: nextValue };
                  if (allowOther) {
                    next[otherFieldKey] =
                      nextValue === OTHER_OPTION.value
                        ? typeof prev[otherFieldKey] === "string"
                          ? (prev[otherFieldKey] as string)
                          : ""
                        : "";
                  }
                  if (field.name === "itapevi_eixo" && prev.itapevi_eixo !== nextValue) {
                    next.itapevi_modulo = "";
                  }
                  if ((field.name === "itapevi_eixo" || field.name === "itapevi_modulo") && projectId) {
                    void persistGeneralInfo(projectId, next, { log: false });
                  }
                  return next;
                });
              }}
            />
            {showOtherInput && (
              <TextInput
                label="Outro"
                value={(formValues[otherFieldKey] as string) || ""}
                onChange={(e: any) => handleChange(otherFieldKey, e.target.value)}
                placeholder="Digite o outro"
              />
            )}
          </div>
        );
      }
      
      case "multiselect": {
        const multiselectOptionsWithOther = getOptionsWithOther(field.options);
        const multiselectValues = Array.isArray(fieldValue) ? fieldValue : [];
        const multiselectOtherFieldKey = getOtherFieldKey(field.name);
        const isOtherSelected = multiselectValues.includes(OTHER_OPTION.value);
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy dark:text-slate-200">{field.label}</label>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 p-3 max-h-56 overflow-y-auto">
              <div className="space-y-2">
                {multiselectOptionsWithOther.map((opt) => {
                  const isChecked = multiselectValues.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-navy"
                        checked={isChecked}
                        onChange={(e) => {
                          const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                          if (e.target.checked) {
                            setFormValues((prev) => ({
                              ...prev,
                              [field.name]: [...currentValues, opt.value],
                            }));
                          } else {
                            setFormValues((prev) => ({
                              ...prev,
                              [field.name]: currentValues.filter((v) => v !== opt.value),
                              [multiselectOtherFieldKey]:
                                opt.value === OTHER_OPTION.value
                                  ? ""
                                  : prev[multiselectOtherFieldKey],
                            }));
                          }
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-slate-200">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              {isOtherSelected && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700">
                  <TextInput
                    label="Outro"
                    value={(formValues[multiselectOtherFieldKey] as string) || ""}
                    onChange={(e: any) =>
                      handleChange(multiselectOtherFieldKey, e.target.value)
                    }
                    placeholder="Digite o outro"
                  />
                </div>
              )}
            </div>
          </div>
        );
      }
      
      case "radio":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy dark:text-slate-200">{field.label}</label>
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 p-3 max-h-40 overflow-y-auto">
              <div className="flex flex-wrap items-start gap-2">
                {(field.options || []).map((opt) => {
                  const isSelected = fieldValue === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-navy text-white border-navy"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700"
                      }`}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={field.name}
                        value={opt.value}
                        checked={isSelected}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                      {isSelected && (
                        <span className="w-2 h-2 bg-white rounded-full" />
                      )}
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case "checkbox":
        const isCheckedBox = fieldValue === "true";
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy dark:text-slate-200">{field.label}</label>
            <div className="flex items-center px-3 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 h-[52px]">
            <label className="inline-flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors w-full rounded px-1">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isCheckedBox ? "bg-navy border-navy" : "bg-white border-gray-300 dark:bg-slate-900 dark:border-slate-600"
              }`}>
                {isCheckedBox && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <input
                type="checkbox"
                className="sr-only"
                checked={isCheckedBox}
                onChange={(e) => handleChange(field.name, e.target.checked ? "true" : "false")}
              />
              <span className="text-sm text-gray-700 dark:text-slate-200">Sim</span>
            </label>
            </div>
          </div>
        );
      
      default:
        return (
          <TextAreaInput
            key={field.name}
            label={field.label}
            value={fieldValue as string}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );
    }
  };

  return (
    <div>
      <div className="mt-4 w-full flex justify-end">
        <Button
          label={"Atualizar Projeto"}
          size="medium"
          onClick={() => {
            if (projectId) {
              handleUpdateProject(projectId);
            }
          }}
          disabled={!projectId}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-5">
        {showItapeviExtras && getItapeviExtraFields(formValues["itapevi_eixo"], itapeviExtraConfig).map((field) => renderField(field))}
        {detalhesProjeto.map((field: FieldConfig) => renderField(field))}
        {detalhesProjeto.length === 0 && !showItapeviExtras && (
          <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
            Configuração de informações gerais indisponível para este tipo de projeto no momento. Continue para as outras abas.
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoGerais;
