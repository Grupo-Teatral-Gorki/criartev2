// components/EvaluateProjectClient.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Tabs from "./Tabs";
import Button from "./Button";
import RenderProject from "./RenderProject";
import RenderDocuments from "./RenderDocument";
import RenderBudget from "./RenderBudget";
import RenderEvaluationForm, { Evaluation } from "./RenderEvaluationForm";

const EvaluateProjectClient = () => {
  const [project, setProject] = useState<any>(null);
  const [evaluationToSend, setEvaluationToSend] = useState<Evaluation | null>(
    null
  );
  const router = useRouter();
  const pathParts = window.location.pathname.split("/");
  const projectId = pathParts[pathParts.length - 1];

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ id: docSnap.id, ...docSnap.data() });
        } else {
          console.warn("No such document!");
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSendEvaluation = async () => {
    if (!evaluationToSend) return;
    console.log("evaluationToSend", evaluationToSend);

    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        evaluation: evaluationToSend,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  if (!project) return <p>Carregando projeto...</p>;

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-4 md:px-36 gap-8">
      <div className="w-full flex justify-between rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label="VOLTAR"
          onClick={() => router.push("/admin/review")}
          size="small"
        />
        <h2 className="text-xl font-semibold sm:text-2xl sm:font-bold text-center">
          Avaliar Projeto
        </h2>
        <Button
          label="Enviar Avaliação"
          onClick={handleSendEvaluation}
          size="small"
        />
      </div>

      <div className="w-full flex flex-col items-center justify-center md:px-8 bg-navy rounded-lg">
        <p className="text-2xl p-4 mt-6 dark:text-white">
          Você está avaliando o projeto com ID: {project.registrationNumber} e
          título: {project.projectTitle}
        </p>

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
            {
              label: "Ficha Avaliativa",
              content: (
                <RenderEvaluationForm
                  setEvaluationToSend={setEvaluationToSend}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
};

export default EvaluateProjectClient;
