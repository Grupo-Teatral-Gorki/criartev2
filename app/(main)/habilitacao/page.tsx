/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import UploadFiles from "@/app/components/UploadFiles";
import { db, storage } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Habilitacao = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const router = useRouter();
  const { dbUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [uploading, setUploading] = useState(false);

  const habilitacaoDocs = [
    { name: "cndFederal", label: "CND Federal" },
    { name: "cndEstadual", label: "CND Estadual" },
    { name: "cndMunicipal", label: "CND Municipal" },
  ];

  const handleUpload = async () => {
    setUploading(true);
    if (!projectId) {
      console.error("Missing user projectId.");
      return;
    }

    try {
      const userDocRef = doc(db, "projects", projectId);

      // Fetch current document data
      const docSnap = await getDoc(userDocRef);
      const existingData = docSnap.exists() ? docSnap.data() : {};
      const existingFiles: { fileName: string; url: string }[] =
        existingData.habilitacao || [];

      let updatedFiles = [...existingFiles]; // Start with existing files

      for (const [fieldName, files] of Object.entries(selectedFiles)) {
        for (const file of files) {
          const path = `project-docs/${projectId}/habilitacao/${uuidv4()}-${
            file.name
          }`;
          const imageRef = ref(storage, path);

          await uploadBytes(imageRef, file);
          const downloadURL = await getDownloadURL(imageRef);

          // Remove existing file with the same logical fieldName
          updatedFiles = updatedFiles.filter((f) => f.fileName !== fieldName);

          // Add new file using the fieldName (e.g. "cndFederal") as the fileName
          updatedFiles.push({ fileName: fieldName, url: downloadURL });
        }
      }

      // Update Firestore document
      await updateDoc(userDocRef, {
        habilitacao: updatedFiles,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });

      setShowToast(true);

      const updatedDoc = await getDoc(userDocRef);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col sm:px-36">
      {/* ajustar centralização */}
      <div className="w-full flex gap-12 bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
        />
        <h2 className="text-2xl font-bold">Habilitação</h2>
      </div>
      <div className="flex flex-col items-center justify-center px-4">
        <div className="mt-4 w-full flex justify-end">
          <Button
            className="mr-4"
            size="medium"
            label={"Enviar Documentos Habilitação"}
            onClick={handleUpload}
            variant="inverted"
            disabled={Object.keys(selectedFiles).length === 0}
          />
        </div>
        {!uploading &&
          habilitacaoDocs.map((file) => {
            return (
              <div key={file.name} className="bg-navy m-8 w-full sm:w-[60%]">
                <UploadFiles
                  key={file.name}
                  name={file.name}
                  label={file.label}
                  onFilesChange={(files) => handleFileChange(file.name, files)}
                />
              </div>
            );
          })}

        <Toast
          message="Arquivos enviados com sucesso!"
          show={showToast}
          type="success"
          onClose={() => setShowToast(false)}
        />
      </div>
    </div>
  );
};

export default Habilitacao;
