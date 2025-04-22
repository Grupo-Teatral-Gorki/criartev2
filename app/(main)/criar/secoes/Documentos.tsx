import Button from "@/app/components/Button";
import UploadFiles from "@/app/components/UploadFiles";
import { useCity } from "@/app/context/CityConfigContext";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import React, { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/app/config/firebaseconfig";
import { doc, updateDoc } from "firebase/firestore";
import Toast from "@/app/components/Toast";

const Documentos = () => {
  const { city } = useCity();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const projectType = searchParams.get("state");
  const [showToast, setShowToast] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [projectDocsState, setProjectDocsState] = useState<any>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const projectDetails = city.typesOfProjects.find(
      (project: { name: string | null }) => project.name === projectType
    );
    const projectDocs = projectDetails.fields.find(
      (obj: { projectDocs: any }) => obj.projectDocs
    );
    setProjectDocsState(projectDocs.projectDocs);
  }, [city]);

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
          const path = `project-docs/${projectId}/${uuidv4()}-${file.name}`;
          const imageRef = ref(storage, path);

          await uploadBytes(imageRef, file);
          const downloadURL = await getDownloadURL(imageRef);

          uploadedUrls.push(downloadURL);
        }
      }

      const userDocRef = doc(db, "projects", projectId);
      await updateDoc(userDocRef, {
        projectDocs: uploadedUrls, // You can use another field name if needed
      });
      setShowToast(true); // Show the toast message
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col mt-4">
      <div className="mt-4 w-full flex justify-end">
        <Button
          className="mr-4"
          size="medium"
          label={"Enviar Documentos"}
          onClick={handleUpload}
          disabled={Object.keys(selectedFiles).length === 0}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {!uploading &&
          projectDocsState.map((file: { name: string; label: string }) => (
            <UploadFiles
              key={file.name}
              name={file.name}
              label={file.label}
              onFilesChange={(files) => handleFileChange(file.name, files)}
            />
          ))}
      </div>
      <Toast
        message="Arquivos enviados com sucesso!"
        show={showToast}
        type="success"
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default Documentos;
