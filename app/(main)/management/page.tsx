"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { Newspaper } from "lucide-react";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type Project = {
  projectId: string;
  projectTitle: string;
  registrationNumber: string;
  proponentId: string;
  proponentName?: string;
  projectStatus?: string;
  projectType?: string;
};

const Management = () => {
  const { user } = useAuth();
  const { city: userCity } = useCity();

  const [projects, setProjects] = useState<Project[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState({
    rascunho: 0,
    enviado: 0,
    recurso: 0,
    habilitacao: 0,
  });

  const getProponentName = async (id: string): Promise<string | null> => {
    const q = query(
      collection(db, "proponents"),
      where("proponentId", "==", id)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const data = snapshot.docs[0].data();
    return data.fullName || data.corporateName || null;
  };

  const loadProjects = async (cityId: string) => {
    const formattedId = cityId.padStart(4, "0");

    try {
      const q = query(
        collection(db, "projects"),
        where("cityId", "==", formattedId)
      );
      const snapshot = await getDocs(q);

      const fetchedProjects = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          const proponentName = await getProponentName(data.proponentId);

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

      const counts = { rascunho: 0, enviado: 0, recurso: 0, habilitacao: 0 };
      fetchedProjects.forEach((project) => {
        const status = project.projectStatus?.toLowerCase();
        if (status && counts.hasOwnProperty(status)) {
          counts[status as keyof typeof counts]++;
        }
      });

      setProjects(fetchedProjects);
      setStatusCounts(counts);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    }
  };

  const loadCities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cities"));
      const citiesList = snapshot.docs.map((doc) => ({
        label: `${doc.data().name} - ${doc.data().uf}`,
        value: doc.data().cityId,
      }));
      setCities(citiesList);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
    }
  };

  // Utility to extract extension from URL or fallback to content-type
  function getExtensionFromUrlOrContentType(
    url: string,
    contentType: string
  ): string {
    const urlParts = url.split("/");
    const lastSegment = urlParts[urlParts.length - 1].split("?")[0];
    const extMatch = lastSegment.match(/\.(\w+)$/);
    if (extMatch) return extMatch[1];

    // fallback based on contentType
    if (contentType.includes("pdf")) return "pdf";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
    if (contentType.includes("png")) return "png";
    if (contentType.includes("zip")) return "zip";

    return "bin"; // generic binary extension fallback
  }

  const handleDownload = async (cityId: string) => {
    const formattedId = cityId.padStart(4, "0");
    const zip = new JSZip();

    try {
      const q = query(
        collection(db, "projects"),
        where("cityId", "==", formattedId)
      );
      const snapshot = await getDocs(q);

      for (const doc of snapshot.docs) {
        const data = doc.data();

        // Clean project title for folder name, fallback to doc.id
        const folderName = (data.projectTitle || doc.id)
          .replace(/[^\w\s-]/gi, "")
          .replace(/\s+/g, "_");

        const folder = zip.folder(folderName);

        // Download planilhaOrcamentaria (spreadsheet)
        if (typeof data.planilhaOrcamentaria === "string") {
          const url = data.planilhaOrcamentaria;
          const response = await fetch(url);
          const blob = await response.blob();
          const ext = getExtensionFromUrlOrContentType(
            url,
            response.headers.get("content-type") || ""
          );
          folder?.file(`Planilha_Orcamentaria.${ext}`, blob);
        }

        // Download projectDocs (array or single)
        const docs = Array.isArray(data.projectDocs)
          ? data.projectDocs
          : data.projectDocs
          ? [data.projectDocs]
          : [];

        for (const file of docs) {
          if (file?.url) {
            const url = file.url;
            const response = await fetch(url);
            const blob = await response.blob();

            // Determine filename with extension
            const urlParts = url.split("/");
            const filenameFromUrl = urlParts[urlParts.length - 1].split("?")[0];
            const ext = getExtensionFromUrlOrContentType(
              url,
              response.headers.get("content-type") || ""
            );
            const baseName = file.name
              ? file.name.replace(/[^\w\s-]/gi, "").replace(/\s+/g, "_")
              : filenameFromUrl.split(".")[0];

            const filename = baseName.includes(".")
              ? baseName
              : `${baseName}.${ext}`;

            folder?.file(filename, blob);
          }
        }
      }

      // Generate the zip file and trigger download
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `projetos_${formattedId}.zip`);
    } catch (error) {
      console.error("Erro no download dos arquivos:", error);
    }
  };

  useEffect(() => {
    if (user && userCity) {
      loadCities();
      setSelectedCityId(userCity.idCidade);
    }
  }, [user, userCity]);

  useEffect(() => {
    if (selectedCityId) {
      loadProjects(selectedCityId);
    }
  }, [selectedCityId]);

  return (
    <div className="flex flex-col gap-6 px-32 w-full">
      <div className="flex gap-4 p-4 w-full items-center justify-between">
        <div className="flex gap-4 justify-evenly items-center">
          <Button label="Voltar" size="medium" variant="inverted" />
          <SelectInput
            className="w-full"
            label="Selecione uma cidade"
            options={cities}
            value={selectedCityId ?? ""}
            onChange={(e: any) => setSelectedCityId(e.target.value)}
          />
        </div>

        <div className="flex gap-8 justify-evenly items-center">
          {[
            {
              label: "Rascunhos",
              value: statusCounts.rascunho,
              color: "text-yellow-400",
            },
            {
              label: "Enviados",
              value: statusCounts.enviado,
              color: "text-green-500",
            },
            {
              label: "Habilitação",
              value: statusCounts.habilitacao,
              color: "text-blue-500",
            },
            {
              label: "Recurso",
              value: statusCounts.recurso,
              color: "text-red-400",
            },
          ].map((item) => (
            <div key={item.label} className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <Newspaper className={`h-4 w-4 ${item.color}`} />
                <p className="text-sm font-bold">{item.label}</p>
              </div>
              <p className="text-base font-extrabold">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-evenly items-center">
          <Button
            label="Baixar Dados"
            size="medium"
            variant="inverted"
            onClick={() => handleDownload(selectedCityId || userCity.idCidade)}
          />
          <Button label="Gerar Lista" size="medium" variant="inverted" />
          <Button label="Reportar Problema" size="medium" variant="red" />
        </div>
      </div>

      <div className="overflow-x-auto p-6 bg-navy rounded-lg shadow-lg">
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
                <td className="px-4 py-2 border-b">{project.proponentName}</td>
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
