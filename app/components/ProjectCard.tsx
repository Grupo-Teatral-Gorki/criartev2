import React, { useState } from "react";
import Button from "./Button";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebaseconfig";
import Modal from "./Modal";
import { useRouter } from "next/navigation";
import { useCity } from "../context/CityConfigContext";
import { useLogging } from "../hooks/useLogging";
import { useAuth } from "../context/AuthContext";
import Toast from "./Toast";

export interface Project {
  projectId: string;
  registrationNumber: string;
  projectName: string;
  projectStatus: string;
  projectTitle: string;
  userId: string;
  projectType: string;
  processStage: string;
  evaluated?: boolean;
  feedbackRequested?: boolean;
  feedbackRequestedAt?: Date;
  feedbackReleased?: boolean;
  feedbackReleasedAt?: Date;
  evaluation?: {
    scores: { id: string; description: string; score: number }[];
    average: number;
    techText: string;
  };
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
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [requestingFeedback, setRequestingFeedback] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [localFeedbackRequested, setLocalFeedbackRequested] = useState(project.feedbackRequested);
  const router = useRouter();
  const city = useCity().city;
  const loggingService = useLogging();
  const { dbUser } = useAuth();

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

  const handleRequestFeedback = async () => {
    setRequestingFeedback(true);
    try {
      const projectRef = doc(db, "projects", project.projectId);
      await updateDoc(projectRef, {
        feedbackRequested: true,
        feedbackRequestedAt: new Date(),
        feedbackRequestedBy: dbUser?.id,
      });
      setLocalFeedbackRequested(true);
      setToastMessage("Solicitação de parecer enviada com sucesso!");
      setToastType("success");
      setShowToast(true);
      setShowFeedbackModal(false);
    } catch (error) {
      console.error("Error requesting feedback:", error);
      setToastMessage("Erro ao solicitar parecer.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setRequestingFeedback(false);
    }
  };

  return (
    <div
      className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-soft dark:shadow-soft-lg border border-slate-200/50 dark:border-slate-700/50"
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
        {project.evaluated && (
          <Button
            label={localFeedbackRequested ? "Parecer Solicitado" : "Solicitar Parecer"}
            variant="outlined"
            size="small"
            disabled={localFeedbackRequested}
            onClick={() => setShowFeedbackModal(true)}
          />
        )}
      </div>

      {/* Released Feedback Display */}
      {project.feedbackReleased && project.evaluation && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Parecer Técnico</h3>
          <p className="text-sm text-blue-700 dark:text-blue-400 mb-2">
            <strong>Nota Final:</strong> {project.evaluation.average?.toFixed(2) || "N/A"}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {project.evaluation.techText || "Nenhum parecer disponível."}
          </p>
        </div>
      )}

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

      {showFeedbackModal && (
        <Modal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}>
          <div className="flex flex-col items-center justify-center gap-4 p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-semibold text-center text-slate-900 dark:text-slate-100">
              Solicitar Parecer
            </h3>
            <p className="text-center text-slate-600 dark:text-slate-400">
              Deseja solicitar o parecer técnico do seu projeto? 
              O administrador irá liberar o parecer assim que possível.
            </p>
            <div className="flex gap-4 mt-4">
              <Button
                label="Cancelar"
                variant="outlined"
                onClick={() => setShowFeedbackModal(false)}
              />
              <Button
                label={requestingFeedback ? "Enviando..." : "Confirmar"}
                onClick={handleRequestFeedback}
                disabled={requestingFeedback}
              />
            </div>
          </div>
        </Modal>
      )}

      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ProjectCard;
