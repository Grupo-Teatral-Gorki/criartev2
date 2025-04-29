/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import { TextAreaInput } from "@/app/components/TextAreaInput";
import { db } from "@/app/config/firebaseconfig";
import { useCity } from "@/app/context/CityConfigContext";
import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const opcoesCategoria = [
  { value: "musica_bandas_grupos", label: "Música - Bandas Ou Grupos" },
  { value: "musica_duplas_trios", label: "Música - Duplas Ou Trios" },
  {
    value: "musica_artista_solo",
    label: "Música - Artista Vocal E/Ou Instrumental Solo",
  },
  { value: "artes_plasticas", label: "Artes Plásticas" },
  { value: "fotografia", label: "Fotografia" },
  { value: "artesanato", label: "Artesanato" },
  { value: "teatro", label: "Teatro" },
  { value: "danca", label: "Dança" },
  {
    value: "cultura_afro_brasileira",
    label: "Cultura Afro-Brasileira E Tradição",
  },
  { value: "literatura", label: "Literatura" },
  { value: "eventos_mostra", label: "Eventos Culturais - Mostra" },
  { value: "eventos_festival", label: "Eventos Culturais - Festival" },
  { value: "contacao_historias", label: "Contação De Histórias" },
];

const modalidade = [
  { value: "1", label: "Módulo 1" },
  { value: "2", label: "Módulo 2" },
];

type FormValues = Record<string, string>;

const InfoGerais = () => {
  const [detalhesProjeto, setDetalhesProjetos] = useState<any>([]);
  const [formValues, setFormValues] = useState<FormValues>({
    categoria: "",
    modalidade: "",
    ...Object.fromEntries(
      detalhesProjeto.map((field: { value: any }) => [field.value, ""])
    ),
  });
  const searchParams = useSearchParams();
  const city = useCity();
  const projectId = searchParams.get("projectId");
  const projectType = searchParams.get("state");

  useEffect(() => {
    const projectDetails = city.city.typesOfProjects.find(
      (project: { name: string | null }) => project.name === projectType
    );
    const generalInfoFields = projectDetails.fields.find(
      (obj: { generalInfo: any }) => obj.generalInfo
    );
    setDetalhesProjetos(generalInfoFields.generalInfo);

    const newFields = Object.fromEntries(
      generalInfoFields.generalInfo.map((field: { name: any }) => [
        field.name,
        "",
      ])
    ); // Log the new fields
    setFormValues((prev) => ({
      categoria: prev.categoria || "",
      modalidade: prev.modalidade || "",
      ...newFields,
    }));
  }, [city]);

  useEffect(() => {
    if (!projectId) return;
    getProjectFromDb(projectId);
  }, []);

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
      infoGerais: formValues,
    });
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
      if (data.infoGerais) {
        setFormValues((prev) => ({
          ...prev,
          ...data.infoGerais,
        }));
      }
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  };

  const camposSelect = [
    { key: "modalidade", label: "Modalidade do Projeto", options: modalidade },
    {
      key: "categoria",
      label: "Categoria do Projeto",
      options: opcoesCategoria,
    },
  ];

  return (
    <div>
      <div className="mt-4 w-full flex justify-end">
        <Button
          label={"Atualizar Projeto"}
          size="medium"
          onClick={() => handleUpdateProject(projectId!)}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-5">
        {detalhesProjeto.map(
          (field: {
            name: React.Key | null | undefined;
            label: string | undefined;
            value: string;
          }) => (
            <TextAreaInput
              key={field.name}
              label={field.label}
              value={formValues[field.name as string] || ""}
              onChange={(e) =>
                handleChange(field.name as string, e.target.value)
              }
            />
          )
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 gap-5">
        {camposSelect.map((field) => (
          <SelectInput
            key={field.key}
            label={field.label}
            options={field.options}
            value={formValues[field.key] || ""}
            onChange={(e: any) => handleChange(field.key, e)}
          />
        ))}
      </div>
    </div>
  );
};

export default InfoGerais;
