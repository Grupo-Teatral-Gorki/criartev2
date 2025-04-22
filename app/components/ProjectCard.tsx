import React from "react";
import Button from "./Button";

export interface Project {
  projectId: string;
  projectName: string;
  projectStatus: string;
  projectTitle: string;
  userId: string;
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

  const statusClasses: Record<string, string> = {
    enviado:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    habilitacao:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    recurso:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  const normalizedStatus = status ? normalizeStatus(status) : "";

  return (
    statusClasses[normalizedStatus] ||
    "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
  );
};

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div
      className="bg-white dark:bg-primary p-6 rounded-lg shadow-md dark:shadow-lg"
      key={project.projectId}
    >
      <div className="flex justify-between gap-1 items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {project.projectName}
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
          <strong>Nº de inscrição:</strong> {project.projectId}
        </p>
        <p>
          <strong>Título do edital:</strong> {project.projectTitle}
        </p>
        <p>
          <strong>Modalidade:</strong> {"Pessoa Física"}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 justify-end">
        <Button label="Habilitação" variant="outlined" size="small" />
        <Button label="Recurso" variant="outlined" size="small" />
        <Button label="Excluir" variant="danger" size="small" />
        <Button label="Editar" variant="outlined" size="small" />
      </div>
    </div>
  );
};

export default ProjectCard;
