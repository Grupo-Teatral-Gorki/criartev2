"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Fomento from "./tipos/fomento";
import Button from "@/app/components/Button";
import Premiacao from "./tipos/premiacao";
import CulturaViva from "./tipos/culturaviva";
import AreasPerifericas from "./tipos/areasperifericas";
import Subsidio from "./tipos/subsidio";
import { TextInput } from "@/app/components/TextInput";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Toast from "@/app/components/Toast";

const CriarContent = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("state");
  const projectId = searchParams.get("projectId");
  const isEdit = searchParams.get("edit");
  const router = useRouter();
  const [projectTitle, setProjectTitle] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const handleSendProject = async (
    updateTitle?: string,
    updateStatus?: string
  ) => {
    if (!projectId) {
      console.warn("No projectId provided.");
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      const updateData: Record<string, any> = {};

      if (updateTitle) {
        updateData.projectTitle = updateTitle;
      }

      if (updateStatus) {
        updateData.projectStatus = updateStatus;
      }

      if (updateStatus === "enviado") {
        updateData.sentDate = new Date();
      }

      if (Object.keys(updateData).length > 0) {
        await updateDoc(projectRef, updateData);

        const messages: string[] = [];

        if (updateTitle) {
          messages.push("Nome do projeto atualizado com sucesso!");
        }

        if (updateStatus) {
          messages.push(`Status do projeto atualizado para '${updateStatus}'!`);
        }

        setToastMessage(messages.join(" "));
        setToastType("success");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      setToastMessage("Erro ao atualizar o projeto.");
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center p-1 sm:px-36">
      <div className="w-full flex items-center justify-between bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
        />
        {isEdit ? (
          <h2 className="text-2xl font-bold flex-grow text-center">
            Edite seu projeto
          </h2>
        ) : (
          <h2 className="text-2xl font-bold flex-grow text-center">
            Crie seu projeto
          </h2>
        )}

        <Button
          label={"ENVIAR PROJETO"}
          onClick={() => handleSendProject(undefined, "enviado")}
          size="medium"
          variant="save"
        />
      </div>
      <div className="w-full flex flex-col justify-center bg-slate-100 rounded-lg dark:bg-navy p-1 sm:p-4 mt-4 gap-8">
        <div className="flex w-full items-center justify-between mt-2 px-4 gap-8">
          <TextInput
            placeholder="Nome do Projeto"
            className="flex-1 min-h-[50px] max-h-[50px]"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <div className="min-w-[180px]">
            <Button
              label={"Atualizar Nome"}
              onClick={() => handleSendProject(projectTitle)}
              size="full"
              variant="save"
            />
          </div>
        </div>
        <div className="w-full flex justify-center items-center cursor-pointer ">
          <p
            className="bg-primary cursor-pointer p-4 rounded-lg text-white"
            onClick={() =>
              window.open(
                "https://criarte.s3.us-east-2.amazonaws.com/public/Edital%2Bde%2BFomento-%2BSanta%2BRita-6-37.pdf",
                "_blank"
              )
            }
          >
            LER OBJETO DO EDITAL
          </p>
        </div>
        <div className="w-full">
          {type === "fomento" && <Fomento />}
          {type === "premiacao" && <Premiacao />}
          {type === "culturaViva" && <CulturaViva />}
          {type === "areasPerifericas" && <AreasPerifericas />}
          {type === "subsidio" && <Subsidio />}
        </div>
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

const Criar = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CriarContent />
    </Suspense>
  );
};

export default Criar;
