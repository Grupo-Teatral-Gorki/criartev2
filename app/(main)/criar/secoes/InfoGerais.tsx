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
  fields?: {
    generalInfo?: FieldConfig[];
  };
};

const InfoGerais = () => {
  const [detalhesProjeto, setDetalhesProjetos] = useState<FieldConfig[]>([]);
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

    const newFields = Object.fromEntries(
      generalInfoFields
        .filter((field) => field?.name)
        .map((field) => [field.name, ""])
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

  const handleChange = (
    key: keyof FormValues,
    event: string | React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = typeof event === "string" ? event : event.target.value;
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdateProject = async (projectId: string) => {
    if (!projectId) return console.error("Projeto não encontrado");
    const projectRef = doc(db, "projects", projectId);
    await updateDoc(projectRef, {
      generalInfo: formValues,
      updatedAt: new Date(),
      updatedBy: dbUser?.id,
    });

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
        const optionsWithOther = getOptionsWithOther(field.options);
        const otherFieldKey = getOtherFieldKey(field.name);
        const selectedValue = fieldValue as string;
        const showOtherInput = selectedValue === OTHER_OPTION.value;
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <SelectInput
              label={field.label}
              options={optionsWithOther}
              value={selectedValue}
              onChange={(e: any) => {
                const nextValue = e?.target?.value || "";
                setFormValues((prev) => ({
                  ...prev,
                  [field.name]: nextValue,
                  [otherFieldKey]:
                    nextValue === OTHER_OPTION.value
                      ? typeof prev[otherFieldKey] === "string"
                        ? prev[otherFieldKey]
                        : ""
                      : "",
                }));
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
        {detalhesProjeto.map((field: FieldConfig) => renderField(field))}
        {detalhesProjeto.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
            Configuração de informações gerais indisponível para este tipo de projeto no momento.
          </p>
        )}
      </div>
    </div>
  );
};

export default InfoGerais;
