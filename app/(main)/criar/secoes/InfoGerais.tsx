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

type FormValues = Record<string, string | string[]>;
type GeneralInfoField = {
  name: string;
  label?: string;
  value?: string;
};

type ProjectDetails = {
  name?: string | null;
  fields?: {
    generalInfo?: GeneralInfoField[];
  };
};

const InfoGerais = () => {
  const [detalhesProjeto, setDetalhesProjetos] = useState<GeneralInfoField[]>([]);
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
      
      case "select":
        return (
          <SelectInput
            key={field.name}
            label={field.label}
            options={field.options || []}
            value={fieldValue as string}
            onChange={(e: any) => handleChange(field.name, e)}
          />
        );
      
      case "multiselect":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy">{field.label}</label>
            <div className="flex flex-wrap items-center gap-2 px-3 border border-gray-200 rounded-lg bg-white h-[52px]">
              {(field.options || []).map((opt) => {
                const isChecked = Array.isArray(fieldValue) ? fieldValue.includes(opt.value) : false;
                return (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${
                      isChecked
                        ? "bg-navy text-white border-navy"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
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
                          }));
                        }
                      }}
                    />
                    {isChecked && (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {opt.label}
                  </label>
                );
              })}
            </div>
          </div>
        );
      
      case "radio":
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy">{field.label}</label>
            <div className="flex flex-wrap items-center gap-2 px-3 border border-gray-200 rounded-lg bg-white h-[52px]">
              {(field.options || []).map((opt) => {
                const isSelected = fieldValue === opt.value;
                return (
                  <label
                    key={opt.value}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all border ${
                      isSelected
                        ? "bg-navy text-white border-navy"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
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
        );
      
      case "checkbox":
        const isCheckedBox = fieldValue === "true";
        return (
          <div key={field.name} className="flex flex-col gap-2">
            <label className="text-sm font-medium text-navy">{field.label}</label>
            <div className="flex items-center px-3 border border-gray-200 rounded-lg bg-white h-[52px]">
            <label className="inline-flex items-center gap-3 cursor-pointer hover:bg-gray-50 transition-colors w-full">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                isCheckedBox ? "bg-navy border-navy" : "bg-white border-gray-300"
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
              <span className="text-sm text-gray-700">Sim</span>
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
