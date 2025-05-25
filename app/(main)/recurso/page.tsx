/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import Button from "@/app/components/Button";
import Toast from "@/app/components/Toast";
import UploadFiles from "@/app/components/UploadFiles";
import { db, storage } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const Recurso = () => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const router = useRouter();
  const { dbUser } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  const handleUpload = async () => {
    setUploading(true);

    if (!projectId) {
      console.error("Missing user projectId.");
      setUploading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "projects", projectId);

      const [fieldName, files] = Object.entries(selectedFiles)[0] || [];

      if (!fieldName || !files?.length) {
        console.error("No file selected.");
        setUploading(false);
        return;
      }

      const file = files[0]; // Upload only the first file
      const path = `project-docs/${projectId}/recurso/${uuidv4()}-${file.name}`;
      const imageRef = ref(storage, path);

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      // Replace the recurso field with a new array containing one file object
      await updateDoc(userDocRef, {
        recurso: [{ fileName: fieldName, url: downloadURL }],
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

  return (
    <div className="w-full overflow-y-auto flex flex-col sm:px-36">
      {/* ajustar centralização */}
      <div className="w-full flex gap-12 bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
        />
        <h2 className="text-2xl font-bold">Recurso</h2>
      </div>
      <div className="flex flex-col items-center justify-center px-4">
        <div className="mt-4 w-full flex justify-end">
          <Button
            className="mr-4"
            size="medium"
            variant="inverted"
            label={"Enviar Recurso"}
            onClick={() => handleUpload()}
            disabled={Object.keys(selectedFiles).length === 0}
          />
        </div>
        {!uploading && (
          <div className="bg-navy m-8 w-full sm:w-[60%]">
            <UploadFiles
              name={"argumentoRecurso"}
              label={"Argumento do Recurso"}
              onFilesChange={(files) =>
                handleFileChange("argumentoRecurso", files)
              }
            />
          </div>
        )}

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

export default Recurso;
