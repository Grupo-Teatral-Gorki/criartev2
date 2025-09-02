"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Tabs from "./Tabs";
import Button from "./Button";
import RenderProject from "./RenderProject";
import RenderDocuments from "./RenderDocument";
import RenderBudget from "./RenderBudget";
import RenderEvaluationForm, { Evaluation } from "./RenderEvaluationForm";
import { useAuth } from "../context/AuthContext";

interface Document {
  // define fields of your document here
  id: string;
  name: string;
  url: string;
  // etc
}
interface Project {
  id: string;
  registrationNumber: string;
  projectTitle: string;
  generalInfo: Record<string, any>;
  projectDocs: Document[];
  planilhaOrcamentaria: string[]; // add this line
  [key: string]: any;
}

const EvaluateProjectClient = () => {
  const [project, setProject] = useState<Project | null>(null);
  const [evaluationToSend, setEvaluationToSend] = useState<Evaluation | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const projectId = pathname.split("/").pop() || "";
  const { dbUser } = useAuth();

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data) {
            // Explicitly type data as Project, spreading id and data
            setProject({ id: docSnap.id, ...data } as Project);
          } else {
            setError("Dados do projeto não encontrados.");
          }
        } else {
          setError("Projeto não encontrado.");
        }
      } catch (err) {
        setError("Erro ao carregar o projeto.");
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    } else {
      setError("ID do projeto inválido.");
      setLoading(false);
    }
  }, [projectId]);

  const handleSendEvaluation = async () => {
    if (!evaluationToSend || !projectId) return;

    setSending(true);
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        evaluation: evaluationToSend,
        evaluated: true,
        updatedAt: new Date(),
        updatedBy: dbUser?.id ?? null, // ensure no undefined is sent
      });
      alert("Avaliação enviada com sucesso!");
      router.push("/admin/review");
    } catch (err) {
      console.error("Error updating document:", err);
      alert("Erro ao enviar avaliação.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Carregando projeto...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!project) return null;

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-4 md:px-36 gap-8">
      <div className="w-full flex justify-between rounded-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-4 mt-4 shadow-soft">
        <Button
          label="VOLTAR"
          onClick={() => router.push("/home")}
          size="small"
          disabled={sending}
        />
        {dbUser?.userRole.includes("secretary") ? (
          <h2 className="text-xl font-semibold sm:text-2xl sm:font-bold text-center text-slate-900 dark:text-slate-100">
            Visualizar Projeto
          </h2>
        ) : (
          <>
            <h2 className="text-xl font-semibold sm:text-2xl sm:font-bold text-center text-slate-900 dark:text-slate-100">
              Avaliar Projeto
            </h2>
            <Button
              label={sending ? "Enviando..." : "Enviar Avaliação"}
              onClick={handleSendEvaluation}
              size="small"
              disabled={sending}
            />
          </>
        )}
      </div>

      <div className="w-full flex flex-col items-center justify-center md:px-8 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 rounded-xl shadow-soft">
        {dbUser?.userRole.includes("secretary") ? (
          <p className="text-2xl p-4 mt-6 text-slate-900 dark:text-slate-100">
            Você está visualizando o projeto com ID:{" "}
            {project.registrationNumber} e título: {project.projectTitle}
          </p>
        ) : (
          <p className="text-2xl p-4 mt-6 text-slate-900 dark:text-slate-100">
            Você está avaliando o projeto com ID: {project.registrationNumber} e
            título: {project.projectTitle}
          </p>
        )}

        <Tabs
          tabs={[
            { label: "Projeto", content: <RenderProject project={project} /> },
            {
              label: "Documentos",
              content: <RenderDocuments project={project} />,
            },
            {
              label: "Planilha Orçamentária",
              content: <RenderBudget project={project} />,
            },
            ...(dbUser?.userRole.includes("reviewer") ||
            dbUser?.userRole.includes("admin")
              ? [
                  {
                    label: "Ficha Avaliativa",
                    content: (
                      <RenderEvaluationForm
                        setEvaluationToSend={setEvaluationToSend}
                        evaluationFromDb={project.evaluation || null}
                      />
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
    </div>
  );
};

export default EvaluateProjectClient;
