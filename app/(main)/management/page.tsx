"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { Newspaper } from "lucide-react";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";

const Management = () => {
  const { user } = useAuth();
  const { city: userCity } = useCity();

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
  const [citiesToSelect, setCitiesToSelect] = useState<
    { label: string; value: string }[]
  >([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [projectStatusCounts, setProjectStatusCounts] = useState({
    rascunho: 0,
    enviado: 0,
    recurso: 0,
    habilitacao: 0,
  });

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

  const fetchCityProjects = async (cityId: string) => {
    const formattedCityId = cityId.padStart(4, "0");
    console.log("Fetching projects for cityId:", formattedCityId);

    try {
      const q = query(
        collection(db, "projects"),
        where("cityId", "==", formattedCityId)
      );

      const snapshot = await getDocs(q);

      console.log("Number of projects fetched:", snapshot.size);

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

      const statusCounts = {
        rascunho: 0,
        enviado: 0,
        recurso: 0,
        habilitacao: 0,
      };

      projectsData.forEach((project) => {
        const status = project.projectStatus?.toLowerCase();
        if (status && statusCounts.hasOwnProperty(status)) {
          statusCounts[status as keyof typeof statusCounts]++;
        }
      });

      setProjects(projectsData);
      setProjectStatusCounts(statusCounts);
    } catch (error) {
      console.error("Error fetching city projects:", error);
    }
  };

  const fetchCities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cities"));

      const cities = snapshot.docs.map((doc) => ({
        label: `${doc.data().name} - ${doc.data().uf}`,
        value: doc.data().cityId,
      }));
      setCitiesToSelect(cities);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // Load cities and set initial selected city from context
  useEffect(() => {
    if (!user || !userCity) return;

    fetchCities();
    setSelectedCityId(userCity.idCidade);
  }, [user, userCity]);

  // Fetch projects when selected city changes
  useEffect(() => {
    if (selectedCityId) {
      fetchCityProjects(selectedCityId);
    }
  }, [selectedCityId]);

  const downloadFileFromUrl = async (url: string, filename: string) => {
    console.log("Downloading file from URL:", url);
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to download file: ${url}`);
      return;
    }
    const blob = await response.blob();

    const a = document.createElement("a");
    const urlBlob = URL.createObjectURL(blob);
    a.href = urlBlob;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(urlBlob);
  };

  const triggerDownload = async (cityId: string) => {
    const formattedCityId = cityId.padStart(4, "0");

    try {
      const q = query(
        collection(db, "projects"),
        where("cityId", "==", formattedCityId)
      );
      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const safeProjectTitle = (data.projectTitle || doc.id).replace(
          /[^\w\s-]/gi,
          ""
        );
        await downloadFileFromUrl(
          data.planilhaOrcamentaria,
          `${safeProjectTitle}.pdf`
        );

        if (Array.isArray(data.projectDocs)) {
          for (const fileUrl of data.projectDocs) {
            // Extract filename from URL or fallback
            const parts = fileUrl.split("/");
            const fileNameFromUrl = parts[parts.length - 1].split("?")[0];
            const fileName = `${safeProjectTitle}_${fileNameFromUrl}`;

            await downloadFileFromUrl(fileUrl, fileName);
          }
        } else {
          console.log(`No files array found in project ${doc.id}`);
        }
      }
    } catch (error) {
      console.error("Error downloading project files:", error);
    }
  };

  return (
    <div className="flex flex-col gap-4 px-32">
      <div className="p-4 flex gap-4 w-full items-center justify-evenly">
        <div className="flex gap-4 w-full items-center justify-evenly">
          <Button label={"Voltar"} size="medium" variant="inverted" />
          <SelectInput
            label="Selecione uma cidade"
            options={citiesToSelect}
            value={selectedCityId ?? ""}
            onChange={(e: any) => setSelectedCityId(e.target.value)}
          />
        </div>

        <div className="flex gap-4 w-full items-center justify-evenly">
          {[
            {
              label: "Rascunhos",
              value: projectStatusCounts.rascunho,
              color: "text-yellow-400",
            },
            {
              label: "Enviados",
              value: projectStatusCounts.enviado,
              color: "text-green-500",
            },
            {
              label: "Habilitação",
              value: projectStatusCounts.habilitacao,
              color: "text-blue-500",
            },
            {
              label: "Recurso",
              value: projectStatusCounts.recurso,
              color: "text-red-400",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <Newspaper className={`h-4 w-4 ${item.color}`} />
                <p className="text-sm font-bold">{item.label}</p>
              </div>
              <p className="text-sm font-extrabold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 w-full items-center justify-evenly">
          <Button
            label={"Baixar Dados"}
            size="medium"
            variant="inverted"
            onClick={() => triggerDownload(selectedCityId || userCity.idCidade)}
          />
          <Button label={"Gerar Lista"} size="medium" variant="inverted" />
          <Button label={"Reportar Problema"} size="medium" variant="red" />
        </div>
      </div>

      <div className="overflow-x-auto p-10 bg-navy rounded-lg shadow-lg">
        <table className="min-w-full border border-gray-300">
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
