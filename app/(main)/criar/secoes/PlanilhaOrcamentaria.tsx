/* eslint-disable @typescript-eslint/no-unused-vars */
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import UploadFiles from "@/app/components/UploadFiles";
import { db, storage } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const PlanilhaOrcamentaria = () => {
  const searchParams = useSearchParams();
  const [showToast, setShowToast] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [uploading, setUploading] = useState(false);
  const projectId = searchParams.get("projectId");
  const { dbUser } = useAuth();

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  const handleUpload = async () => {
    setUploading(true);
    if (!projectId) {
      console.error("Missing user projectId.");
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
        updatedBy: dbUser?.id, // You can use another field name if needed
      });
      setShowToast(true); // Show the toast message
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="mt-4 w-full flex justify-end">
        <Button
          className="mr-4"
          size="medium"
          label={"Enviar Planilha Orçamentária"}
          onClick={handleUpload}
          disabled={Object.keys(selectedFiles).length === 0}
        />
      </div>
      <UploadFiles
        key={"planilhaOrcamentaria"}
        name={"planilhaOrcamentaria"}
        label={"Planilha Orçamentária"}
        onFilesChange={(files) =>
          handleFileChange("planilhaOrcamentaria", files)
        }
      />
      <Toast
        message="Arquivos enviados com sucesso!"
        show={showToast}
        type="success"
        onClose={() => setShowToast(false)}
      />
    </>
  );
};

export default PlanilhaOrcamentaria;
