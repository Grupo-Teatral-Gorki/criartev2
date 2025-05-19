"use client";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
/* import { TextInput } from "@/app/components/TextInput"; */
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Newspaper } from "lucide-react";
import React, { useEffect, useState } from "react";

const Management = () => {
  const { user } = useAuth();
  const { city } = useCity();

  type Project = {
    projectId: string;
    projectTitle: string;
    registrationNumber: string;
    proponentId: string;
    proponentName?: string;
    projectStatus?: string;
    projectType?: string;
  };

  const [projects, setProjects] = useState<Project[]>([]);
  /* const [filterText, setFilterText] = useState(""); */

  const getProponentById = async (
    proponentId: string
  ): Promise<string | null> => {
    const q = query(
      collection(db, "proponents"),
      where("proponentId", "==", proponentId)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      const data = doc.data();
      return data.fullName || data.corporateName || null;
    }

    return null;
  };

  useEffect(() => {
    if (!user?.uid || !city) return;

    const fetchCityProjects = async () => {
      const formattedCityId = city.idCidade.toString().padStart(4, "0");

      try {
        const q = query(
          collection(db, "projects"),
          where("cityId", "==", formattedCityId)
        );

        const snapshot = await getDocs(q);

        const projectsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            const proponentName = await getProponentById(data.proponentId);

            return {
              projectId: doc.id,
              projectTitle: data.projectTitle,
              projectStatus: data.projectStatus,
              projectType: data.projectType,
              registrationNumber: data.registrationNumber,
              proponentId: data.proponentId,
              proponentName: proponentName || "Não encontrado",
            };
          })
        );

        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching city projects:", error);
      }
    };

    fetchCityProjects();
  }, [user, city]);

  return (
    <div className="flex flex-col gap-4 px-32">
      <div className="p-4 flex gap-4 w-full items-center justify-evenly">
        <div className="flex gap-4 w-full items-center justify-evenly">
          <Button label={"Voltar"} size="medium" variant="inverted" />
          <SelectInput
            label="Selecione uma cidade"
            options={[{ label: "test", value: "another" }]}
          />
        </div>

        <div className="flex gap-4 w-full items-center justify-evenly">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-orange" />
              <p className="text-sm font-bold">Rascunhos</p>
            </div>
            <p className="text-sm font-extrabold">7</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-green-500" />
              <p className="text-sm font-bold">Enviados</p>
            </div>
            <p className="text-sm font-extrabold">4</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-bold">Habilitação</p>
            </div>
            <p className="text-sm font-extrabold">0</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-red-400" />
              <p className="text-sm font-bold">Recurso</p>
            </div>
            <p className="text-sm font-extrabold">0</p>
          </div>
        </div>

        <div className="flex gap-4 w-full items-center justify-evenly">
          <Button label={"Baixar Dados"} size="medium" variant="inverted" />
          <Button label={"Gerar Lista"} size="medium" variant="inverted" />
          <Button label={"Reportar Problema"} size="medium" variant="red" />
        </div>
      </div>

      <div className="overflow-x-auto p-10 bg-navy">
        {/* <TextInput
          placeholder="Filtrar por proponente"
          className="mb-4"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        /> */}
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead className="bg-primary text-white">
            <tr>
              <th className="px-4 py-2 text-left border-b">
                Título do Projeto
              </th>
              <th className="px-4 py-2 text-left border-b">Status</th>
              <th className="px-4 py-2 text-left border-b">
                Número de Registro
              </th>
              <th className="px-4 py-2 text-left border-b">Proponente</th>
              <th className="px-4 py-2 text-left border-b">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr
                key={project.projectId}
                className="hover:bg-primary hover:text-white cursor-pointer even:bg-gray-100 odd:bg-white text-navy"
              >
                <td className="px-4 py-2 border-b">{project.projectTitle}</td>
                <td className="px-4 py-2 border-b">{project.projectStatus}</td>
                <td className="px-4 py-2 border-b">
                  {project.registrationNumber}
                </td>
                <td className="px-4 py-2 border-b">
                  {project.proponentName || "Carregando..."}
                </td>
                <td className="px-4 py-2 border-b">{project.projectType}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Management;
