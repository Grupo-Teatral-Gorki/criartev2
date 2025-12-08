"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { Newspaper } from "lucide-react";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useRouter } from "next/navigation";
import ProjectsTab from "./components/ProjectsTab";

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
  const { dbUser } = useAuth();
  const { city: userCity } = useCity();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    rascunho: 0,
    enviado: 0,
    recurso: 0,
    habilitacao: 0,
  });

  // Single search state
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getProponentName = async (id: string): Promise<string | null> => {
    if (!id || id === "undefined" || id === undefined || id === null) {
      console.warn(
        "Management: Invalid proponentId provided to getProponentName:",
        id
      );
      return "ID não encontrado";
    }

    try {
      const q = query(
        collection(db, "proponents"),
        where("proponentId", "==", id)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const data = snapshot.docs[0].data();
      return data.fullName || data.corporateName || null;
    } catch (error) {
      console.error("Error fetching proponent name for ID:", id, error);
      return "Erro ao buscar nome";
    }
  };

  const loadProjects = async (cityId: string) => {
    if (isLoadingProjects) {
      console.log("Management: Already loading projects, skipping...");
      return;
    }

    console.log(
      "Management: loadProjects called with cityId:",
      cityId,
      "type:",
      typeof cityId
    );

    if (
      !cityId ||
      cityId === "undefined" ||
      cityId === undefined ||
      cityId === null
    ) {
      console.error("Management: Invalid cityId provided:", cityId);
      return;
    }

    try {
      setIsLoadingProjects(true);

      const q = query(
        collection(db, "projects"),
        where("cityId", "==", cityId)
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
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const loadCities = async () => {
    try {
      const snapshot = await getDocs(collection(db, "cities"));
      const citiesList = snapshot.docs.map((doc) => ({
        label: `${doc.data().name} - ${doc.data().uf}`,
        value: doc.data().cityId,
      })).sort((a, b) => a.label.localeCompare(b.label));
      setCities(citiesList);
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
    }
  };

  function getExtensionFromUrlOrContentType(
    url: string,
    contentType: string
  ): string {
    const urlParts = url.split("/");
    const lastSegment = urlParts[urlParts.length - 1].split("?")[0];
    const extMatch = lastSegment.match(/\.(\w+)$/);
    if (extMatch) return extMatch[1];

    if (contentType.includes("pdf")) return "pdf";
    if (contentType.includes("jpeg") || contentType.includes("jpg"))
      return "jpg";
    if (contentType.includes("png")) return "png";
    if (contentType.includes("zip")) return "zip";

    return "bin";
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

        const folderName = (data.registrationNumber || doc.id)
          .replace(/[^\w\s-]/gi, "")
          .replace(/\s+/g, "_");

        const folder = zip.folder(folderName);

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
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `projetos_${formattedId}.zip`);
    } catch (error) {
      console.error("Erro no download dos arquivos:", error);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  useEffect(() => {
    console.log(
      "Management: useEffect - userCity:",
      userCity,
      "dbUser cityId:",
      dbUser?.cityId
    );

    if (userCity && userCity.cityId) {
      console.log(
        "Management: Setting selectedCityId from userCity:",
        userCity.cityId
      );
      setSelectedCityId(userCity.cityId);
    } else if (dbUser?.cityId) {
      console.log(
        "Management: Setting selectedCityId from dbUser:",
        dbUser.cityId
      );
      setSelectedCityId(dbUser.cityId);
    } else {
      console.log(
        "Management: No valid cityId found, userCity:",
        userCity,
        "dbUser:",
        dbUser
      );
    }
  }, [userCity, dbUser]);

  useEffect(() => {
    console.log(
      "Management: selectedCityId useEffect - selectedCityId:",
      selectedCityId,
      "type:",
      typeof selectedCityId,
      "isLoadingProjects:",
      isLoadingProjects
    );

    if (selectedCityId && !isLoadingProjects) {
      loadProjects(selectedCityId);
    }
  }, [selectedCityId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const generatePDF = async () => {
    const res = await fetch("/api/generate-pdf");
    if (!res.ok) {
      alert("Failed to generate PDF");
      return;
    }
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.pdf";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filtered projects (single search bar)
  const filteredProjects = projects.filter((project) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (project.proponentName || "").toLowerCase().includes(term) ||
      (project.projectTitle || "").toLowerCase().includes(term) ||
      (project.registrationNumber || "").toLowerCase().includes(term)
    );
  });

  // Reset to first page when search or city changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCityId]);

  // Pagination calculations
  const totalItems = filteredProjects.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredProjects.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredProjects, currentPage, rowsPerPage]);

  return (
    <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-8 lg:px-32 w-full pb-8 md:pb-12">
      <div className="flex flex-col md:flex-row gap-4 p-4 w-full items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Button
            label="Voltar"
            size="medium"
            variant="inverted"
            onClick={() => router.back()}
          />
          {dbUser?.userRole.includes("admin") && (
            <SelectInput
              className="w-full md:w-64"
              options={cities}
              value={selectedCityId ?? ""}
              onChange={(e: any) => setSelectedCityId(e.target.value)}
            />
          )}
        </div>
        <div className="grid grid-cols-2 md:flex gap-4 md:gap-8 w-full md:w-auto">
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
            <div key={item.label} className="flex flex-col items-center bg-white dark:bg-slate-800 rounded-lg p-2 md:p-0 md:bg-transparent">
              <div className="flex items-center gap-1 md:gap-2">
                <Newspaper className={`h-3 w-3 md:h-4 md:w-4 ${item.color}`} />
                <p className="text-xs md:text-sm font-bold">{item.label}</p>
              </div>
              <p className="text-sm md:text-base font-extrabold">{item.value}</p>
            </div>
          ))}
        </div>

        {dbUser?.userRole.includes("admin") && (
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <Button
              label="Baixar Dados"
              size="medium"
              variant="inverted"
              onClick={() =>
                handleDownload(selectedCityId || userCity.idCidade)
              }
            />
            <Button label="Gerar Lista" size="medium" variant="inverted" />
            <Button label="Reportar Problema" size="medium" variant="red" />
          </div>
        )}
      </div>

      <ProjectsTab
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredProjects={filteredProjects}
        paginatedProjects={paginatedProjects}
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        selectedCityId={selectedCityId}
      />
    </div>
  );
};

export default Management;
