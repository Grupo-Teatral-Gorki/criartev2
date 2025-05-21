import React, { useState } from "react";
import Button from "./Button";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import Modal from "./Modal";
import { useRouter } from "next/navigation";

export interface Project {
  projectId: string;
  registrationNumber: string;
  projectName: string;
  projectStatus: string;
  projectTitle: string;
  userId: string;
  projectType: string;
}

interface ProjectCardProps {
  project: Project;
}

const getStatusStyles = (status?: string) => {
  const normalizeStatus = (status: string) =>
    status
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const rawStatusClasses = {
    Enviado:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Habilitação:
      "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Recurso: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    Rascunho: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  };

  const statusClasses: Record<string, string> = {};
  for (const key in rawStatusClasses) {
    const normalizedKey = normalizeStatus(key);
    statusClasses[normalizedKey] =
      rawStatusClasses[key as keyof typeof rawStatusClasses];
  }

  const normalizedStatus = status ? normalizeStatus(status) : "";

  return (
    statusClasses[normalizedStatus] ||
    "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  const handleDelete = async (id: string) => {
    try {
      const projectRef = doc(db, "projects", id);
      await deleteDoc(projectRef);
      setConfirmDelete(false);
      window.location.reload();
      console.log("Project deleted successfully");
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };
  return (
    <div
      className="bg-white dark:bg-primary p-6 rounded-lg shadow-md dark:shadow-lg"
      key={project.projectId}
    >
      <div className="flex justify-between gap-1 items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {project.projectTitle}
        </h2>
        <span
          className={`px-3 py-1 text-sm font-medium rounded-md ${getStatusStyles(
            project.projectStatus
          )}`}
        >
          {project.projectStatus
            ? project.projectStatus.charAt(0).toUpperCase() +
              project.projectStatus.slice(1).toLowerCase()
            : ""}
        </span>
      </div>
      <div className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
        <p>
          <strong>Nº de inscrição:</strong> {project.registrationNumber}
        </p>
        <p>
          <strong>Modalidade:</strong> {"Pessoa Física"}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button
          label="Habilitação"
          variant="outlined"
          size="small"
          onClick={() => router.push(`/habilitacao?id=${project.projectId}`)}
        />
        <Button
          label="Recurso"
          variant="outlined"
          size="small"
          onClick={() => router.push(`/recurso?id=${project.projectId}`)}
        />
        <Button
          label="Excluir"
          variant="danger"
          size="small"
          onClick={() => setConfirmDelete(true)}
        />
        <Button
          label="Editar"
          variant="outlined"
          size="small"
          onClick={() =>
            router.push(
              `criar?edit=true&projectId=${project.projectId}&state=${project.projectType}`
            )
          }
        />
      </div>
      {confirmDelete && (
        <Modal isOpen={confirmDelete} onClose={() => setConfirmDelete(false)}>
          <div className="flex flex-col items-center justify-center gap-4 p-2 sm:p-8 m-8 ">
            <p className="text-2xl sm:text-3xl text-center">
              Tem certeza que deseja excluir esse projeto?
            </p>
            <Button
              label="Excluir"
              variant="danger"
              onClick={() => handleDelete(project.projectId)}
            />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProjectCard;
