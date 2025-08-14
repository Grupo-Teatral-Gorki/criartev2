/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import UploadFiles from "@/app/components/UploadFiles";
import { db, storage } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { doc, updateDoc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSearchParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Download } from "lucide-react";

type UploadedPlanilhaWithPath = {
  name: string;
  url: string;
  storagePath: string;
};

const PlanilhaOrcamentaria = () => {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [uploading, setUploading] = useState(false);
  const [uploadedPlanilhas, setUploadedPlanilhas] = useState<string[]>([]);
  const [planilhaMessage, setPlanilhaMessage] = useState("");
  const projectId = searchParams.get("projectId");
  const { dbUser } = useAuth();

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
      const uploadedUrls: string[] = [];

      for (const files of Object.values(selectedFiles)) {
        for (const file of files) {
          const path = `project-docs/${projectId}/planilha-orcamentaria/${uuidv4()}-${
            file.name
          }`;
          const imageRef = ref(storage, path);

          await uploadBytes(imageRef, file);
          const downloadURL = await getDownloadURL(imageRef);

          uploadedUrls.push(downloadURL);
        }
      }

      const userDocRef = doc(db, "projects", projectId);
      await updateDoc(userDocRef, {
        planilhaOrcamentaria: uploadedUrls,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      
      setToastMessage("Planilha orçamentária enviada com sucesso!");
      setToastType("success");
      setShowToast(true);
      
      // Refresh the uploaded files
      getProjectFromDb(projectId);
      
      // Clear selected files
      setSelectedFiles({});
    } catch (error) {
      console.error("Upload error:", error);
      setToastMessage("Erro ao enviar planilha orçamentária");
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
        const savedPlanilhas: string[] = data.planilhaOrcamentaria || [];
        setUploadedPlanilhas(savedPlanilhas);

        if (savedPlanilhas.length > 0) {
          setPlanilhaMessage(
            "Você já enviou a planilha orçamentária. Caso precise substituir, basta fazer o upload novamente."
          );
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      getProjectFromDb(projectId);
    }
  }, [projectId]);

  const getFilePreviewUrl = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const renderPlanilhaCard = () => {
    const selectedFile = selectedFiles["planilhaOrcamentaria"]?.[0];
    const hasUploadedFiles = uploadedPlanilhas.length > 0;
    const hasFile = selectedFile || hasUploadedFiles;
    
    // Get preview URL
    let previewUrl = '';
    let fileName = '';
    if (selectedFile) {
      previewUrl = getFilePreviewUrl(selectedFile);
      fileName = selectedFile.name;
    } else if (hasUploadedFiles) {
      previewUrl = uploadedPlanilhas[0];
      fileName = 'Planilha Orçamentária';
    }

    return (
      <div className="border rounded-lg p-4 mb-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h4 className="font-medium text-gray-800">Planilha Orçamentária</h4>
            
            {/* Icon-sized iframe preview above the text */}
            {hasFile && previewUrl && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-36 h-36 border rounded overflow-hidden flex-shrink-0 relative">
                  <iframe
                    src={previewUrl}
                    className="absolute border-0"
                    title={`Preview of ${fileName}`}
                    style={{ 
                      pointerEvents: 'none',
                      width: '900px',
                      height: '900px',
                      transform: 'scale(0.2)',
                      transformOrigin: 'top left',
                      left: '0',
                      top: '0'
                    }}
                  />
                </div>
                <div className="flex-1">
                  {selectedFile && (
                    <p className="text-sm text-green-600">
                      Arquivo selecionado: {selectedFile.name}
                    </p>
                  )}
                  {hasUploadedFiles && !selectedFile && (
                    <p className="text-sm text-blue-600">
                      Planilha enviada
                    </p>
                  )}
                </div>
              </div>
            )}
            
          </div>

        </div>
        
        <UploadFiles
          name="planilhaOrcamentaria"
          label="Planilha Orçamentária"
          onFilesChange={(files) => handleFileChange("planilhaOrcamentaria", files)}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col mt-4">
      {planilhaMessage && (
        <p className="col-span-full text-white-600 mt-4 text-xl text-center">
          {planilhaMessage}
        </p>
      )}
      
      {renderPlanilhaCard()}
      
      <div className="mt-4 w-full flex justify-end">
        <Button
          className="mr-4"
          size="medium"
          label={uploading ? "Enviando..." : "Enviar Planilha Orçamentária"}
          onClick={handleUpload}
          disabled={Object.keys(selectedFiles).length === 0 || uploading}
        />
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

export default PlanilhaOrcamentaria;
