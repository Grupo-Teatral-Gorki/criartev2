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

interface ProjectDoc {
  name: string;
  label: string;
}

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocWithPath[]>([]);
  const { dbUser } = useAuth();

  useEffect(() => {
    const projectDetails = city.typesOfProjects.find(
      (project: { name: string | null }) => project.name === projectType
    );
    const projectDocsField = projectDetails.fields.projectDocs;

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
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {!uploading &&
          projectDocs.map((file) => (
            <UploadFiles
              key={file.name}
              name={file.name}
              label={file.label}
              onFilesChange={(files) => handleFileChange(file.name, files)}
            />
          ))}
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
