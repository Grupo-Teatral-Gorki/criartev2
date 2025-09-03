import React, { useState } from "react";
import Button from "./Button";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { useCity } from "../context/CityConfigContext";
import { useLogging } from "../hooks/useLogging";

export interface Project {
  projectId: string;
  registrationNumber: string;
  projectName: string;
  projectStatus: string;
  projectTitle: string;
  userId: string;
  projectType: string;
  processStage: string;
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
      "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300",
    Habilitação:
      "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300",
    Recurso: "bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300",
    Rascunho: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
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
    "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();
  const city = useCity().city;
  const loggingService = useLogging();

  const formatType = (type: string) => {
    switch (type) {
      case "premiacao":
        return "Premiação";
      case "fomento":
        return "Fomento";
      default:
        return type;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await loggingService.logDelete("project", id, {
        projectType: project.projectType,
        projectStatus: project.projectStatus
      });
      const projectRef = doc(db, "projects", id);
      await deleteDoc(projectRef);
      setConfirmDelete(false);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };
  return (
    <div
      className="theme-card p-6"
      key={project.projectId}
    >
      <div className="flex justify-between gap-1 items-center">
        <h2 className="text-xl font-semibold theme-text-primary">
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
      <div className="mt-4 space-y-2 theme-text-secondary">
        <p>
          <strong>Nº de inscrição:</strong> {project.registrationNumber}
        </p>
        <p>
          <strong>Modalidade:</strong> {formatType(project.projectType)}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button
          label="Habilitação"
          variant="outlined"
          size="small"
          disabled={city.processStage !== "habilitacao"}
          onClick={async () => {
            await loggingService.logNavigation("/meusprojetos", `/habilitacao?id=${project.projectId}`, {
              buttonType: "habilitacao",
              projectId: project.projectId,
              projectType: project.projectType,
              projectStatus: project.projectStatus
            });
            router.push(`/habilitacao?id=${project.projectId}`);
          }}
        />
        <Button
          label="Recurso"
          variant="outlined"
          size="small"
          disabled={city.processStage !== "recurso"}
          onClick={async () => {
            await loggingService.logNavigation("/meusprojetos", `/recurso?id=${project.projectId}`, {
              buttonType: "recurso",
              projectId: project.projectId,
              projectType: project.projectType,
              projectStatus: project.projectStatus
            });
            router.push(`/recurso?id=${project.projectId}`);
          }}
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
          disabled={project.projectStatus == "enviado"}
          onClick={async () => {
            await loggingService.logNavigation("/meusprojetos", `/criar?edit=true&projectId=${project.projectId}&state=${project.projectType}`, {
              buttonType: "editar_projeto",
              projectId: project.projectId,
              projectType: project.projectType,
              projectStatus: project.projectStatus
            });
            router.push(
              `criar?edit=true&projectId=${project.projectId}&state=${project.projectType}`
            );
          }}
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
