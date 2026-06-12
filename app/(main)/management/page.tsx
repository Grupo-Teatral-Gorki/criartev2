"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { Newspaper } from "lucide-react";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import JSZip from "jszip";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";
import ProjectsTab from "./components/ProjectsTab";

type Project = {
  projectId: string;
  projectTitle: string;
  registrationNumber: string;
  proponentId: string;
  proponentName?: string;
  proponentType?: string;
  projectStatus?: string;
  projectType?: string;
  generalInfo?: Record<string, any>;
  updatedAt?: any;
  sentDate?: any;
};

const PROPONENT_TYPE_LABELS: Record<string, string> = {
  fisica: "Pessoa Física",
  juridica: "Pessoa Jurídica",
  coletivo: "Coletivo",
};

const Management = () => {
  const { dbUser } = useAuth();
  const { city: userCity } = useCity();
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [cities, setCities] = useState<{
    label: string;
    value: string;
    logoUrl?: string;
    typesOfProjects?: { name: string; label: string; fields?: Record<string, { name: string; label: string; options?: { value: string; label: string }[] }[]> }[]
  }[]>([]);
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
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getProponentInfo = async (id: string): Promise<{ name: string | null; tipo: string | null }> => {
    if (!id || id === "undefined" || id === undefined || id === null) {
      return { name: null, tipo: null };
    }

    try {
      // Primary: lookup by Firestore doc ID in 'proponentes' collection
      const proponenteRef = doc(db, "proponentes", id);
      const proponenteSnap = await getDoc(proponenteRef);

      if (proponenteSnap.exists()) {
        const data = proponenteSnap.data() as Record<string, any>;
        const name =
          data?.dadosPessoais?.nomeCompleto ||
          data?.dadosPessoaJuridica?.razaoSocial ||
          data?.dadosColetivo?.nomeColetivo ||
          data?.fullName ||
          data?.corporateName ||
          null;
        return { name, tipo: data?.tipo || null };
      }

      // Fallback: some legacy records may have stored a custom proponentId field
      const legacyQuery = query(
        collection(db, "proponentes"),
        where("proponentId", "==", id)
      );
      const legacySnapshot = await getDocs(legacyQuery);
      if (!legacySnapshot.empty) {
        const data = legacySnapshot.docs[0].data() as Record<string, any>;
        return {
          name: data?.dadosPessoais?.nomeCompleto ||
            data?.dadosPessoaJuridica?.razaoSocial ||
            data?.dadosColetivo?.nomeColetivo ||
            data?.fullName ||
            data?.corporateName ||
            null,
          tipo: data?.tipo || null,
        };
      }

      return { name: null, tipo: null };
    } catch (error) {
      console.error("Error fetching proponent info for ID:", id, error);
      return { name: "Erro ao buscar nome", tipo: null };
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
          const hasProponentId = !!(
            data.proponentId &&
            data.proponentId !== "undefined"
          );
          const proponentInfo = hasProponentId
            ? await getProponentInfo(data.proponentId)
            : { name: null, tipo: null };

          let displayName: string;
          if (!hasProponentId) {
            displayName = "Proponente não cadastrado ainda";
          } else if (!proponentInfo.name) {
            displayName = "ID não encontrado";
          } else {
            displayName = proponentInfo.name;
          }

          return {
            projectId: doc.id,
            projectTitle: data.projectTitle,
            projectStatus: data.projectStatus,
            projectType: data.projectType,
            registrationNumber: data.registrationNumber,
            proponentId: data.proponentId,
            proponentName: displayName,
            proponentType: proponentInfo.tipo || undefined,
            generalInfo: data.generalInfo || undefined,
            updatedAt: data.updatedAt ?? null,
            sentDate: data.sentDate ?? null,
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
        logoUrl: doc.data().cityLogoUrl || undefined,
        typesOfProjects: doc.data().typesOfProjects || [],
        extraFields: doc.data().extraFields || undefined,
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

  const loadImageAsBase64 = (src: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const MAX = 200;
        let w = img.naturalWidth;
        let h = img.naturalHeight;
        if (w > MAX || h > MAX) {
          const scale = Math.min(MAX / w, MAX / h);
          w = Math.round(w * scale);
          h = Math.round(h * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const generateExcel = () => {
    const cityLabel = cities.find((c) => c.value === selectedCityId)?.label || selectedCityId || "";
    const now = new Date();

    const selectedCity = cities.find((c) => c.value === selectedCityId);

    // Build name → label map from city config
    const typeLabels: Record<string, string> = {};
    const cityTypes = selectedCity?.typesOfProjects || [];
    cityTypes.forEach((t: { name: string; label: string }) => {
      if (t.name && t.label) typeLabels[t.name] = t.label;
    });

    // Build module value → label map
    const moduloLabels: Record<string, string> = {};
    cityTypes.forEach((t: any) => {
      const allFields: { name: string; options?: { value: string; label: string }[] }[] = [];
      Object.values(t.fields || {}).forEach((sectionFields: any) => {
        if (Array.isArray(sectionFields)) allFields.push(...sectionFields);
      });
      const moduloField = allFields.find((f: any) => f.name === "escolha_o_modulo");
      if (moduloField?.options) {
        moduloField.options.forEach((o: { value: string; label: string }) => {
          if (o.value && o.label) moduloLabels[o.value] = o.label;
        });
      }
    });

    // Deduplicate: keep only latest sentDate per (title + proponent)
    const dedupedMap = new Map<string, Project>();
    filteredProjects.forEach((p) => {
      const key = `${p.projectTitle || ""}::${p.proponentName || ""}`;
      const existing = dedupedMap.get(key);
      if (!existing) {
        dedupedMap.set(key, p);
      } else {
        const existingDate = existing.sentDate?.toDate?.() || existing.sentDate || new Date(0);
        const pDate = p.sentDate?.toDate?.() || p.sentDate || new Date(0);
        if (pDate > existingDate) dedupedMap.set(key, p);
      }
    });
    const dedupedProjects = Array.from(dedupedMap.values());

    // Group projects by type
    const grouped: Record<string, typeof dedupedProjects> = {};
    dedupedProjects.forEach((p) => {
      const type = p.projectType || "Sem tipo";
      const displayLabel = typeLabels[type] || type;
      if (!grouped[displayLabel]) grouped[displayLabel] = [];
      grouped[displayLabel].push(p);
    });

    const wb = XLSX.utils.book_new();

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 10 },
      fill: { fgColor: { rgb: "1D4A5D" } },
      alignment: { horizontal: "center" as const, vertical: "center" as const },
      border: {
        top: { style: "thin" as const, color: { rgb: "1D4A5D" } },
        bottom: { style: "thin" as const, color: { rgb: "1D4A5D" } },
        left: { style: "thin" as const, color: { rgb: "1D4A5D" } },
        right: { style: "thin" as const, color: { rgb: "1D4A5D" } },
      },
    };

    const subHeaderStyle = {
      font: { bold: true, sz: 12, color: { rgb: "1D4A5D" } },
      fill: { fgColor: { rgb: "F0F4F7" } },
      alignment: { horizontal: "left" as const, vertical: "center" as const },
      border: {
        top: { style: "thin" as const, color: { rgb: "1D4A5D" } },
        bottom: { style: "thin" as const, color: { rgb: "1D4A5D" } },
      },
    };

    const moduleStyle = {
      font: { bold: true, sz: 10, color: { rgb: "1D4A5D" } },
      alignment: { horizontal: "left" as const, vertical: "center" as const },
      fill: { fgColor: { rgb: "D8E2E8" } },
      border: {
        top: { style: "thin" as const, color: { rgb: "B8C8D0" } },
        bottom: { style: "thin" as const, color: { rgb: "B8C8D0" } },
      },
    };

    const evenRowStyle = {
      fill: { fgColor: { rgb: "F8FAFC" } },
      border: {
        top: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        bottom: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        left: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        right: { style: "thin" as const, color: { rgb: "E2E8F0" } },
      },
    };

    const oddRowStyle = {
      border: {
        top: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        bottom: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        left: { style: "thin" as const, color: { rgb: "E2E8F0" } },
        right: { style: "thin" as const, color: { rgb: "E2E8F0" } },
      },
    };

    const typeNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    const usedSheetNames = new Set<string>();

    typeNames.forEach((typeName) => {
      const wsData: any[][] = [];
      const merges: XLSX.Range[] = [];
      const cellStyles: { r: number; c: number; style: any }[] = [];

      // Title rows
      wsData.push(["Relatório de Projetos"]);
      cellStyles.push({ r: 0, c: 0, style: { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } } });
      merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

      wsData.push([cityLabel]);
      cellStyles.push({ r: 1, c: 0, style: { font: { sz: 10 }, alignment: { horizontal: "center" } } });
      merges.push({ s: { r: 1, c: 0 }, e: { r: 1, c: 3 } });

      let infoRow = 2;
      if (statusFilter) {
        const statusLabel = statusFilter === "rascunho" ? "Rascunhos" : statusFilter === "enviado" ? "Enviados" : statusFilter === "habilitacao" ? "Habilitação" : "Recurso";
        wsData.push([`Filtro de status: ${statusLabel}`]);
        cellStyles.push({ r: infoRow, c: 0, style: { font: { sz: 9 }, alignment: { horizontal: "center" } } });
        merges.push({ s: { r: infoRow, c: 0 }, e: { r: infoRow, c: 3 } });
        infoRow++;
      }
      if (searchTerm.trim()) {
        wsData.push([`Busca: "${searchTerm}"`]);
        cellStyles.push({ r: infoRow, c: 0, style: { font: { sz: 9 }, alignment: { horizontal: "center" } } });
        merges.push({ s: { r: infoRow, c: 0 }, e: { r: infoRow, c: 3 } });
        infoRow++;
      }

      wsData.push([]);
      infoRow++;

      const typeRow = infoRow;
      wsData.push([`${typeName} (${grouped[typeName].length})`]);
      cellStyles.push({ r: typeRow, c: 0, style: subHeaderStyle });
      merges.push({ s: { r: typeRow, c: 0 }, e: { r: typeRow, c: 3 } });
      infoRow++;

      // Group by module within this type
      const findModulo = (gi: Record<string, any> | undefined): string | undefined => gi?.escolha_o_modulo || undefined;
      const byModule: Record<string, Project[]> = {};
      grouped[typeName].forEach((p) => {
        const mod = findModulo(p.generalInfo) || "Sem módulo";
        const modLabel = moduloLabels[mod] || mod;
        if (!byModule[modLabel]) byModule[modLabel] = [];
        byModule[modLabel].push(p);
      });
      const moduleNames = Object.keys(byModule).sort((a, b) => a.localeCompare(b));

      moduleNames.forEach((modName) => {
        const modProjects = byModule[modName];

        // Module subtitle
        wsData.push([`${modName} (${modProjects.length})`]);
        cellStyles.push({ r: infoRow, c: 0, style: moduleStyle });
        merges.push({ s: { r: infoRow, c: 0 }, e: { r: infoRow, c: 3 } });
        infoRow++;

        // Table headers
        wsData.push(["Nº Inscrição", "Título do Projeto", "Proponente", "Tipo de Proponente"]);
        for (let c = 0; c < 4; c++) {
          cellStyles.push({ r: infoRow, c, style: headerStyle });
        }
        infoRow++;

        // Table rows with alternating colors
        modProjects.forEach((p, rowIdx) => {
          wsData.push([
            p.registrationNumber || "—",
            p.projectTitle || "—",
            p.proponentName || "—",
            PROPONENT_TYPE_LABELS[p.proponentType || ""] || p.proponentType || "—",
          ]);
          const rowStyle = rowIdx % 2 === 0 ? evenRowStyle : oddRowStyle;
          for (let c = 0; c < 4; c++) {
            cellStyles.push({ r: infoRow, c, style: rowStyle });
          }
          infoRow++;
        });

        wsData.push([]);
        infoRow++;
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      ws["!merges"] = merges;

      // Apply column widths
      ws["!cols"] = [
        { wch: 14 },
        { wch: 45 },
        { wch: 35 },
        { wch: 20 },
      ];

      // Apply styles to cells
      cellStyles.forEach(({ r, c, style }) => {
        const addr = XLSX.utils.encode_cell({ r, c });
        if (!ws[addr]) ws[addr] = { v: wsData[r][c] || "" };
        ws[addr].s = style;
      });

      // Ensure all cells have a value
      wsData.forEach((row, r) => {
        row.forEach((val, c) => {
          const addr = XLSX.utils.encode_cell({ r, c });
          if (!ws[addr]) ws[addr] = { v: val || "" };
        });
      });

      let safeTypeName = typeName.replace(/[\\/*?\[\]:]/g, "").substring(0, 31);
      let idx = 1;
      let uniqueName = safeTypeName;
      while (usedSheetNames.has(uniqueName)) {
        uniqueName = `${safeTypeName.substring(0, 29)}_${idx}`;
        idx++;
      }
      usedSheetNames.add(uniqueName);
      XLSX.utils.book_append_sheet(wb, ws, uniqueName);
    });

    // Summary sheet
    const summaryData: any[][] = [["Resumo"], [], ["Total geral de projetos", dedupedProjects.length]];
    if (statusFilter) {
      const statusLabel = statusFilter === "rascunho" ? "Rascunhos" : statusFilter === "enviado" ? "Enviados" : statusFilter === "habilitacao" ? "Habilitação" : "Recurso";
      summaryData.push(["Status filtrado", statusLabel]);
    }
    if (searchTerm.trim()) {
      summaryData.push(["Termo de busca", searchTerm]);
    }
    summaryData.push(["Cidade", cityLabel]);
    summaryData.push(["Gerado em", now.toLocaleString("pt-BR")]);

    const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
    summaryWs["!cols"] = [{ wch: 25 }, { wch: 40 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumo");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, `projetos_${cityLabel.replace(/\s/g, "_")}_${now.toISOString().slice(0, 10)}.xlsx`);
  };

  const generatePDF = async () => {
    const doc = new jsPDF({ orientation: "landscape" });
    const pageWidth = doc.internal.pageSize.getWidth();

    const cityLabel = cities.find((c) => c.value === selectedCityId)?.label || selectedCityId || "";
    const now = new Date();

    // Load images
    const pnabBase64 = await loadImageAsBase64("/assets/pnab.webp");
    const selectedCity = cities.find((c) => c.value === selectedCityId);
    const brasaoBase64 = selectedCity?.logoUrl ? await loadImageAsBase64(selectedCity.logoUrl) : null;

    const pnabW = 30;
    const pnabH = 30;
    const brasaoW = 20;
    const brasaoH = 20;

    // Header height calculation
    let headerTextBottom = 19;
    if (statusFilter) headerTextBottom += 5;
    if (searchTerm.trim()) headerTextBottom += 5;
    const headerHeight = Math.max(headerTextBottom + 3, pnabH + 8);

    // Draw header function (called on every page)
    const drawHeader = () => {
      if (pnabBase64) {
        doc.addImage(pnabBase64, "PNG", 14, 3, pnabW, pnabH);
      }
      if (brasaoBase64) {
        doc.addImage(brasaoBase64, "PNG", pageWidth - 14 - brasaoW, 5, brasaoW, brasaoH);
      }
      doc.setFontSize(14);
      doc.text("Relatório de Projetos", pageWidth / 2, 12, { align: "center" });
      doc.setFontSize(10);
      doc.text(cityLabel, pageWidth / 2, 19, { align: "center" });

      let infoY = 26;
      if (statusFilter) {
        const statusLabel = statusFilter === "rascunho" ? "Rascunhos" : statusFilter === "enviado" ? "Enviados" : statusFilter === "habilitacao" ? "Habilitação" : "Recurso";
        doc.text(`Filtro de status: ${statusLabel}`, pageWidth / 2, infoY, { align: "center" });
        infoY += 5;
      }
      if (searchTerm.trim()) {
        doc.text(`Busca: "${searchTerm}"`, pageWidth / 2, infoY, { align: "center" });
      }
    };

    // Draw header on first page
    drawHeader();

    // Build name → label map from city config
    const typeLabels: Record<string, string> = {};
    const cityTypes = selectedCity?.typesOfProjects || [];
    cityTypes.forEach((t: { name: string; label: string }) => {
      if (t.name && t.label) typeLabels[t.name] = t.label;
    });

    // Build module value → label map by searching for "escolha_o_modulo" field in all project type configs
    const moduloLabels: Record<string, string> = {};
    cityTypes.forEach((t: any) => {
      const allFields: { name: string; options?: { value: string; label: string }[] }[] = [];
      Object.values(t.fields || {}).forEach((sectionFields: any) => {
        if (Array.isArray(sectionFields)) allFields.push(...sectionFields);
      });
      const moduloField = allFields.find((f: any) => f.name === "escolha_o_modulo");
      if (moduloField?.options) {
        moduloField.options.forEach((o: { value: string; label: string }) => {
          if (o.value && o.label) moduloLabels[o.value] = o.label;
        });
      }
    });

    // Deduplicate: keep only latest sentDate per (title + proponent)
    const dedupedMap = new Map<string, Project>();
    filteredProjects.forEach((p) => {
      const key = `${p.projectTitle || ""}::${p.proponentName || ""}`;
      const existing = dedupedMap.get(key);
      if (!existing) {
        dedupedMap.set(key, p);
      } else {
        const existingDate = existing.sentDate?.toDate?.() || existing.sentDate || new Date(0);
        const pDate = p.sentDate?.toDate?.() || p.sentDate || new Date(0);
        if (pDate > existingDate) {
          dedupedMap.set(key, p);
        }
      }
    });
    const dedupedProjects = Array.from(dedupedMap.values());

    // Group projects by type
    const grouped: Record<string, typeof dedupedProjects> = {};
    dedupedProjects.forEach((p) => {
      const type = p.projectType || "Sem tipo";
      const displayLabel = typeLabels[type] || type;
      if (!grouped[displayLabel]) grouped[displayLabel] = [];
      grouped[displayLabel].push(p);
    });

    const typeNames = Object.keys(grouped).sort((a, b) => a.localeCompare(b));
    let currentY = headerHeight;

    typeNames.forEach((typeName, idx) => {
      const groupProjects = grouped[typeName];

      // Each type starts on a new page (except the first)
      if (idx > 0) {
        doc.addPage();
        drawHeader();
        currentY = headerHeight;
      }

      // Section title for the type
      const titleY = currentY + 2;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`${typeName} (${groupProjects.length})`, 14, titleY);
      doc.setFont("helvetica", "normal");

      // Helper: read modulo directly from generalInfo.escolha_o_modulo
      const findModulo = (gi: Record<string, any> | undefined): string | undefined => {
        return gi?.escolha_o_modulo || undefined;
      };

      // Group by module within this type
      const byModule: Record<string, Project[]> = {};
      groupProjects.forEach((p) => {
        const mod = findModulo(p.generalInfo) || "Sem módulo";
        const modLabel = moduloLabels[mod] || mod;
        if (!byModule[modLabel]) byModule[modLabel] = [];
        byModule[modLabel].push(p);
      });
      const moduleNames = Object.keys(byModule).sort((a, b) => a.localeCompare(b));

      let moduleY = titleY + 8;

      moduleNames.forEach((modName, mIdx) => {
        const modProjects = byModule[modName];

        // Module subtitle
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${modName} (${modProjects.length})`, 18, moduleY);
        doc.setFont("helvetica", "normal");

        const tableData = modProjects.map((p) => [
          p.registrationNumber || "—",
          p.projectTitle || "—",
          p.proponentName || "—",
          PROPONENT_TYPE_LABELS[p.proponentType || ""] || p.proponentType || "—",
        ]);

        autoTable(doc, {
          startY: moduleY + 4,
          head: [["Nº Inscrição", "Título do Projeto", "Proponente", "Tipo de Proponente"]],
          body: tableData,
          styles: { fontSize: 8, cellPadding: 2 },
          headStyles: { fillColor: [29, 74, 93], textColor: 255, fontStyle: "bold" },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { top: headerHeight },
          didDrawPage: () => {
            drawHeader();
          },
        });

        moduleY = (doc as any).lastAutoTable.finalY + 10;

        // Page break between modules if tight space
        if (mIdx < moduleNames.length - 1 && moduleY > doc.internal.pageSize.getHeight() - 30) {
          doc.addPage();
          drawHeader();
          moduleY = headerHeight;
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 8;
    });

    doc.setFontSize(8);
    doc.text(`Total geral: ${filteredProjects.length} projeto(s)`, 14, (doc as any).lastAutoTable.finalY + 8);

    doc.save(`projetos_${cityLabel.replace(/\s/g, "_")}_${now.toISOString().slice(0, 10)}.pdf`);
  };

  // Filtered projects (search + status filter)
  const filteredProjects = projects.filter((project) => {
    // Status filter
    if (statusFilter) {
      const projectStatus = project.projectStatus?.toLowerCase() || "";
      if (projectStatus !== statusFilter) return false;
    }
    // Search filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (project.proponentName || "").toLowerCase().includes(term) ||
      (project.projectTitle || "").toLowerCase().includes(term) ||
      (project.registrationNumber || "").toLowerCase().includes(term)
    );
  });

  // Reset to first page when search, city or status filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCityId, statusFilter]);

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
              filterKey: "rascunho",
              activeRing: "ring-yellow-400",
              activeBg: "bg-yellow-50 dark:bg-yellow-900/20",
            },
            {
              label: "Enviados",
              value: statusCounts.enviado,
              color: "text-green-500",
              filterKey: "enviado",
              activeRing: "ring-green-500",
              activeBg: "bg-green-50 dark:bg-green-900/20",
            },
            {
              label: "Habilitação",
              value: statusCounts.habilitacao,
              color: "text-blue-500",
              filterKey: "habilitacao",
              activeRing: "ring-blue-500",
              activeBg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Recurso",
              value: statusCounts.recurso,
              color: "text-red-400",
              filterKey: "recurso",
              activeRing: "ring-red-400",
              activeBg: "bg-red-50 dark:bg-red-900/20",
            },
          ].map((item) => {
            const isActive = statusFilter === item.filterKey;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setStatusFilter(isActive ? null : item.filterKey)}
                className={`flex flex-col items-center rounded-lg p-2 md:px-3 md:py-2 transition-all cursor-pointer ${
                  isActive
                    ? `ring-2 ${item.activeRing} ${item.activeBg} scale-105`
                    : "bg-white dark:bg-slate-800 md:bg-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50"
                }`}
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <Newspaper className={`h-3 w-3 md:h-4 md:w-4 ${item.color}`} />
                  <p className="text-xs md:text-sm font-bold">{item.label}</p>
                </div>
                <p className="text-sm md:text-base font-extrabold">{item.value}</p>
              </button>
            );
          })}
        </div>

        {dbUser?.userRole.includes("admin") && (
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto">
            <Button label="Reportar Problema" size="medium" variant="red" />
            <Button
              label="Gerar Lista de Inscritos"
              size="medium"
              onClick={generatePDF}
            />
            <Button
              label="Exportar Excel"
              size="medium"
              onClick={generateExcel}
            />
          </div>
        )}
      </div>

      {statusFilter && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700 text-sm">
          <span className="font-medium text-primary-700 dark:text-primary-300">
            Filtrando por: <strong>{statusFilter === "rascunho" ? "Rascunhos" : statusFilter === "enviado" ? "Enviados" : statusFilter === "habilitacao" ? "Habilitação" : "Recurso"}</strong>
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter(null)}
            className="ml-2 text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 font-bold"
          >
            ✕ Limpar filtro
          </button>
        </div>
      )}

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
