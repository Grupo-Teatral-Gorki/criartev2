import Button from "@/app/components/Button";
import UploadFiles from "@/app/components/UploadFiles";
import { useCity } from "@/app/context/CityConfigContext";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "@/app/config/firebaseconfig";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import Toast from "@/app/components/Toast";
import { useAuth } from "@/app/context/AuthContext";
import { useLogging } from "@/app/hooks/useLogging";

interface ProjectDoc {
  name: string;
  label: string;
}

type ProjectDetails = {
  name?: string | null;
  fields?: {
    projectDocs?: ProjectDoc[];
  };
};

type UploadedDocWithPath = {
  name: string;
  url: string;
  storagePath: string;
};

const Documentos = () => {
  const { city } = useCity();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const projectType = searchParams.get("state");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [projectDocs, setProjectDocs] = useState<ProjectDoc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [projectDocsMessage, setProjectDocsMessage] = useState("");
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocWithPath[]>([]);

  const { dbUser } = useAuth();
  const loggingService = useLogging();

  useEffect(() => {
    const availableTypes: ProjectDetails[] = Array.isArray(city?.typesOfProjects)
      ? city.typesOfProjects
      : [];

    const projectDetails = availableTypes.find(
      (project) => project?.name === projectType
    );

    const projectDocsField = Array.isArray(projectDetails?.fields?.projectDocs)
      ? projectDetails.fields.projectDocs
      : [];

    if (projectDocsField) {
      setProjectDocs(projectDocsField);
    }
  }, [city, projectType]);

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  const handleUpload = async () => {
    setUploading(true);

    if (!projectId) {
      setToastMessage("Missing project ID");
      setToastType("error");
      setShowToast(true);
      setUploading(false);
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      const projectSnap = await getDoc(projectRef);

      if (!projectSnap.exists()) {
        throw new Error("Project not found");
      }

      const projectData = projectSnap.data();
      const registrationNumber = projectData.registrationNumber;

      if (!registrationNumber) {
        throw new Error("Project is missing a registration number");
      }

      const currentDocs: UploadedDocWithPath[] = projectData.projectDocs || [];

      const uploadPromises: Promise<UploadedDocWithPath>[] = [];

      for (const [docName, files] of Object.entries(selectedFiles)) {
        const docDefinition = projectDocs.find((doc) => doc.name === docName);
        if (!docDefinition) {
          console.warn(`No docDefinition found for: ${docName}`);
          continue;
        }

        // 🔁 Delete previous file if it exists for this docName
        const existing = currentDocs.find((d) => d.name === docName);
        if (existing && existing.storagePath) {
          try {
            const oldRef = ref(storage, existing.storagePath);
            await deleteObject(oldRef);
          } catch (err) {
            console.warn("Could not delete previous file:", err);
          }
        }

        for (const file of files) {
          const storagePath = `project-docs/${registrationNumber}/${docName}/${uuidv4()}`;
          const fileRef = ref(storage, storagePath);

          const uploadPromise = uploadBytes(fileRef, file)
            .then(() => getDownloadURL(fileRef))
            .then((url) => ({
              name: docName,
              url,
              storagePath,
            }));

          uploadPromises.push(uploadPromise);
        }
      }

      const newUploads = await Promise.all(uploadPromises);
      const combined = [...currentDocs, ...newUploads];

      // ✅ Deduplicate: Keep only the latest per docName
      const dedupedMap = new Map<string, UploadedDocWithPath>();
      combined.forEach((doc) => dedupedMap.set(doc.name, doc));

      const deduplicatedDocs = Array.from(dedupedMap.values());

      await updateDoc(projectRef, {
        projectDocs: deduplicatedDocs,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      setUploadedDocs(deduplicatedDocs);
      setSelectedFiles({});

      const allRequiredUploaded = projectDocs.every((doc) =>
        deduplicatedDocs.some((uploaded) => uploaded.name === doc.name)
      );

      if (allRequiredUploaded) {
        setProjectDocsMessage(
          "Você já enviou todos os documentos obrigatórios, não é necessário enviar novamente. Caso precise substituir algum documento, basta fazer o upload novamente."
        );
      }

      setToastMessage("Arquivos enviados com sucesso!");
      setToastType("success");
      setShowToast(true);

      // Log update with email notification
      const projectTitle = projectData.projectTitle || projectId;
      await loggingService.logProjectUpdate(
        projectId,
        "documentos",
        { projectType },
        dbUser?.email,
        `${dbUser?.firstName} ${dbUser?.lastName}`,
        projectTitle
      );
    } catch (error) {
      console.error("Upload error:", error);
      setToastMessage("Erro ao enviar arquivos");
      setToastType("error");
      setShowToast(true);
    } finally {
      setUploading(false);
    }
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

      if (projectDoc) {
        const data = projectDoc.data();
        const savedDocs: UploadedDocWithPath[] = data.projectDocs || [];
        setUploadedDocs(savedDocs);

        const allDocsHaveFiles = projectDocs.every((doc) =>
          savedDocs.some((uploaded) => uploaded.name === doc.name)
        );

        if (allDocsHaveFiles) {
          setProjectDocsMessage(
            "Você já enviou todos os documentos obrigatórios, não é necessário enviar novamente. Caso precise substituir algum documento, basta fazer o upload novamente."
          );
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    if (projectId && projectDocs.length > 0) {
      getProjectFromDb(projectId);
    }
  }, [projectId, projectDocs]);

  const getFilePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };


  const renderDocumentCard = (doc: ProjectDoc) => {
    const selectedFile = selectedFiles[doc.name]?.[0];
    const uploadedDoc = uploadedDocs.find(uploaded => uploaded.name === doc.name);
    const hasFile = selectedFile || uploadedDoc;
    
    // Get preview URL
    let previewUrl = '';
    let fileName = '';
    if (selectedFile) {
      previewUrl = getFilePreviewUrl(selectedFile);
      fileName = selectedFile.name;
    } else if (uploadedDoc) {
      previewUrl = uploadedDoc.url;
      fileName = uploadedDoc.name;
    }

    const isUploaded = uploadedDoc && !selectedFile;
    const isSelected = !!selectedFile;

    return (
      <div 
        key={doc.name} 
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border-2 transition-all duration-200 overflow-hidden ${
          isUploaded 
            ? 'border-green-200 dark:border-green-800' 
            : isSelected 
              ? 'border-orange-200 dark:border-orange-800' 
              : 'border-gray-100 dark:border-slate-700 hover:border-gray-200 dark:hover:border-slate-600'
        }`}
      >
        {/* Header */}
        <div className={`px-4 py-3 border-b ${
          isUploaded 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' 
            : isSelected 
              ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' 
              : 'bg-gray-50 dark:bg-slate-700/50 border-gray-100 dark:border-slate-700'
        }`}>
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">{doc.label}</h4>
            {isUploaded && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Enviado
              </span>
            )}
            {isSelected && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                Pendente
              </span>
            )}
          </div>
        </div>

        {/* Preview Section */}
        {hasFile && previewUrl && (
          <div className="p-4 bg-gray-50 dark:bg-slate-900/50">
            <div className="flex items-start gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-gray-200 dark:border-slate-600 overflow-hidden flex-shrink-0 relative bg-white shadow-inner">
                <iframe
                  src={previewUrl}
                  className="absolute border-0"
                  title={`Preview of ${fileName}`}
                  style={{ 
                    pointerEvents: 'none',
                    width: '600px',
                    height: '600px',
                    transform: 'scale(0.16)',
                    transformOrigin: 'top left',
                    left: '0',
                    top: '0'
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {selectedFile?.name || 'Documento'}
                </p>
                {selectedFile && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
                {isUploaded && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    Clique abaixo para substituir
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="p-2">
          <UploadFiles
            name={doc.name}
            label={hasFile ? "Substituir arquivo" : `Enviar ${doc.label}`}
            onFilesChange={(files) => handleFileChange(doc.name, files)}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-4">
      {projectDocsMessage && (
        <p className="col-span-full text-white-600 mt-4 text-xl text-center">
          {projectDocsMessage}
        </p>
      )}
      <div className="mt-4 w-full flex justify-end">
        <Button
          className="mr-4"
          size="medium"
          label={
            projectDocsMessage ? "Substituir Documento" : "Enviar Documentos"
          }
          onClick={handleUpload}
          disabled={Object.keys(selectedFiles).length === 0 || uploading}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {!uploading && projectDocs.map(renderDocumentCard)}
        {!uploading && projectDocs.length === 0 && (
          <p className="text-sm text-slate-500 dark:text-slate-400 col-span-full">
            Configuração de documentos indisponível para este tipo de projeto no momento.
          </p>
        )}
      </div>
      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Documentos;
