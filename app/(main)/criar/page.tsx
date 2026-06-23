"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useLogging } from "@/app/hooks/useLogging";
import Fomento from "./tipos/fomento";
import Button from "@/app/components/Button";
import Premiacao from "./tipos/premiacao";
import CulturaViva from "./tipos/culturaviva";
import AreasPerifericas from "./tipos/areasperifericas";
import Subsidio from "./tipos/subsidio";
import { TextInput } from "@/app/components/TextInput";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import Toast from "@/app/components/Toast";
import { useCity } from "@/app/context/CityConfigContext";
import { isProjectTypeInscriptionOpen } from "@/app/utils/inscriptionUtils";

const DISMISS_KEY_PREFIX = "criarte_dismiss_submit_reminder_";

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
  const [projectData, setProjectData] = useState<any>(null);
  const [showSubmitReminder, setShowSubmitReminder] = useState(false);
  const loggingService = useLogging();
  const { city } = useCity();
  const projectTypeName = type || projectData?.projectType;
  const isInscriptionOpen = isProjectTypeInscriptionOpen(city, projectTypeName);
  const validTypes = ["fomento", "premiacao", "culturaViva", "areasPerifericas", "subsidio"] as const;
  const availableProjectTypes: any[] = Array.isArray(city?.typesOfProjects)
    ? city.typesOfProjects
    : [];
  const currentProjectTypeConfig = availableProjectTypes.find((p) => p?.name === type);
  const inferBaseType = (value: string | null | undefined): string | null => {
    if (!value) return null;
    if (validTypes.includes(value as (typeof validTypes)[number])) return value;
    const match = validTypes.find((v) => value === v || value.startsWith(`${v}_`));
    return match || null;
  };
  const renderType =
    (currentProjectTypeConfig?.baseType as string | undefined) ||
    inferBaseType(type) ||
    type;
  const hasValidType = renderType
    ? validTypes.includes(renderType as (typeof validTypes)[number])
    : false;

  const handleSendProject = async (
    updateTitle?: string,
    updateStatus?: string
  ) => {
    if (!projectId) {
      console.warn("No projectId provided.");
      return;
    }

    // Validate title when updating it
    if (updateTitle !== undefined && !updateTitle.trim()) {
      setToastMessage("O título do projeto é obrigatório.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Block submission if inscriptions are closed
    if (updateStatus === "enviado" && !isInscriptionOpen) {
      setToastMessage("Não é possível enviar projetos. As inscrições estão fechadas para este edital.");
      setToastType("error");
      setShowToast(true);
      return;
    }

    // Check if project has a title before sending
    if (updateStatus === "enviado") {
      const currentTitle = projectTitle || projectData?.projectTitle;
      if (!currentTitle?.trim()) {
        setToastMessage("Não é possível enviar o projeto sem um título. Por favor, adicione um título primeiro.");
        setToastType("error");
        setShowToast(true);
        return;
      }
    }

    // Check if trying to send project without proponent and validate required extra fields
    if (updateStatus === "enviado") {
      try {
        const projectRef = doc(db, "projects", projectId);
        const projectSnap = await getDoc(projectRef);

        if (projectSnap.exists()) {
          const projectData = projectSnap.data();

          if (!projectData.proponentId) {
            setToastMessage("Não é possível enviar o projeto sem um proponente. Por favor, adicione um proponente primeiro.");
            setToastType("error");
            setShowToast(true);
            return;
          }

          // Verify the proponent actually exists in the 'proponentes' collection
          const proponentRef = doc(db, "proponentes", projectData.proponentId);
          const proponentSnap = await getDoc(proponentRef);
          if (!proponentSnap.exists()) {
            setToastMessage(
              "O proponente vinculado a este projeto não foi encontrado. Selecione um proponente válido antes de enviar."
            );
            setToastType("error");
            setShowToast(true);
            return;
          }

          const availableTypes: any[] = Array.isArray(city?.typesOfProjects)
            ? city.typesOfProjects
            : [];
          const projectTypeConfig = availableTypes.find(
            (p) => p?.name === projectData.projectType
          );

          if (!projectTypeConfig) {
            setToastMessage("Não foi possível validar o projeto. Configuração do tipo de projeto não encontrada. Tente novamente em instantes.");
            setToastType("error");
            setShowToast(true);
            return;
          }

          if (projectTypeConfig?.extraGeneralInfo) {
            const generalInfo = projectData.generalInfo || {};
            const extraFields = projectTypeConfig.extraFields || {};
            const eixoValue = generalInfo.extra_eixo;
            const moduloGroup =
              eixoValue === "eixo_2" ? extraFields.moduloEixo2 : extraFields.moduloEixo1;
            const missing: string[] = [];
            if (!eixoValue) missing.push(extraFields.eixo?.label || "Escolha o Eixo");
            if (!generalInfo.extra_modulo) missing.push(moduloGroup?.label || "Escolha o módulo");
            if (!generalInfo.extra_categoria) missing.push(extraFields.categoria?.label || "Escolha a Categoria");

            if (missing.length > 0) {
              setToastMessage(
                `Preencha o(s) campo(s) obrigatório(s) antes de enviar: ${missing.join(", ")}.`
              );
              setToastType("error");
              setShowToast(true);
              return;
            }
          }

          // Validate required generalInfo fields
          const requiredFields: { name: string; label: string }[] = Array.isArray(projectTypeConfig?.fields?.generalInfo)
            ? projectTypeConfig.fields.generalInfo
                .filter((f: any) => f.required)
                .map((f: any) => ({ name: f.name, label: f.label || f.name }))
            : [];

          if (requiredFields.length > 0) {
            const generalInfo = projectData.generalInfo || {};
            const missingFields = requiredFields.filter((f) => {
              const val = generalInfo[f.name];
              if (Array.isArray(val)) return val.length === 0;
              return !val || (typeof val === "string" && !val.trim());
            });

            if (missingFields.length > 0) {
              setToastMessage(
                `Preencha o(s) campo(s) obrigatório(s) em Informações Gerais antes de enviar: ${missingFields.map((f) => f.label).join(", ")}.`
              );
              setToastType("error");
              setShowToast(true);
              return;
            }
          }

          // Validate all required documents are uploaded
          const requiredDocs: { name: string; label: string }[] = Array.isArray(projectTypeConfig?.fields?.projectDocs)
            ? projectTypeConfig.fields.projectDocs
                .filter((d: any) => d.required)
                .map((d: any) => ({ name: d.name, label: d.label || d.name }))
            : [];

          if (requiredDocs.length > 0) {
            const uploadedDocs: { name: string }[] = projectData.projectDocs || [];
            const missingDocs = requiredDocs.filter(
              (d) => !uploadedDocs.some((uploaded) => uploaded.name === d.name)
            );

            if (missingDocs.length > 0) {
              setToastMessage(
                `Envie o(s) documento(s) obrigatório(s) antes de enviar o projeto: ${missingDocs.map((d) => d.label).join(", ")}.`
              );
              setToastType("error");
              setShowToast(true);
              return;
            }
          }

          // Validate planilha orçamentária (enabled by default, unless explicitly disabled)
          if (projectTypeConfig?.hasBudget !== false) {
            const planilha = projectData.planilhaOrcamentaria;
            if (!Array.isArray(planilha) || planilha.length === 0) {
              setToastMessage("Envie a Planilha Orçamentária antes de enviar o projeto.");
              setToastType("error");
              setShowToast(true);
              return;
            }
          }

          // Validate ficha técnica only if enabled for this project type
          const hasFichaTecnica = projectTypeConfig?.hasFichaTecnica !== false;

          if (hasFichaTecnica) {
            const fichaTecnica = Array.isArray(projectData.fichaTecnica) ? projectData.fichaTecnica : [];
            const validFichaRows = fichaTecnica.filter(
              (row: any) => row.nome?.trim() && row.cargo?.trim()
            );
            if (validFichaRows.length === 0) {
              setToastMessage("Preencha a Ficha Técnica (ao menos uma entrada com nome e cargo) antes de enviar o projeto.");
              setToastType("error");
              setShowToast(true);
              return;
            }
          }
        }
      } catch (error) {
        console.error("Erro ao verificar dados do projeto:", error);
        setToastMessage("Erro ao verificar dados do projeto.");
        setToastType("error");
        setShowToast(true);
        return;
      }
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
          // Log project title update with email notification
          await loggingService.logProjectUpdate(
            projectId, 
            "titulo", 
            { newTitle: updateTitle, projectType: type },
            loggingService.getCurrentUser() || undefined,
            projectData?.userName || "Usuário",
            updateTitle
          );
        }

        if (updateStatus) {
          messages.push(`Status do projeto atualizado para '${updateStatus}'!`);
          
          if (updateStatus === "enviado") {
            // Log project submission with email notification
            await loggingService.logProjectSubmission(
              projectId, 
              updateTitle || projectData?.projectTitle, 
              {
                projectType: type,
                sentDate: new Date().toISOString(),
                hasProponent: !!projectData?.proponentId
              },
              loggingService.getCurrentUser() || undefined, // userEmail
              projectData?.userName || "Usuário" // userName - you may need to get this from user context
            );
          } else {
            // Log general status update
            await loggingService.logProjectUpdate(projectId, "status", {
              newStatus: updateStatus,
              projectType: type
            });
          }
        }

        setToastMessage(messages.join(" "));
        setToastType("success");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Erro ao atualizar projeto:", error);
      
      // Log project update/submission failure
      if (updateStatus === "enviado") {
        await loggingService.logAction('enviar_projeto', {
          projectId,
          projectType: type,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false
        });
      } else if (updateTitle || updateStatus) {
        await loggingService.logAction('atualizar_projeto', {
          projectId,
          projectType: type,
          updateType: updateTitle ? "titulo" : "status",
          error: error instanceof Error ? error.message : "Unknown error",
          success: false
        });
      }

      setToastMessage("Erro ao atualizar o projeto.");
      setToastType("error");
      setShowToast(true);
    }
  };

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;

      try {
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProjectData(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error getting document:", error);
      }
    };

    fetchProject();
  }, [projectId]);

  // Show submission reminder modal
  useEffect(() => {
    if (!projectId) return;
    if (!projectData) return;
    if (projectData.projectStatus === "enviado") return;

    const dismissed = localStorage.getItem(`${DISMISS_KEY_PREFIX}${projectId}`);
    if (!dismissed) {
      setShowSubmitReminder(true);
    }
  }, [projectId, projectData]);

  const handleDismissReminder = (dontShowAgain: boolean) => {
    if (dontShowAgain && projectId) {
      localStorage.setItem(`${DISMISS_KEY_PREFIX}${projectId}`, "true");
    }
    setShowSubmitReminder(false);
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center px-4 sm:px-8 lg:px-16">
      {/* Submission Reminder Modal */}
      {showSubmitReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Lembrete Importante
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Preencher os dados do projeto <strong>não significa que ele foi enviado</strong>. 
              Para que seu projeto seja considerado, você deve clicar no botão <strong>&quot;ENVIAR&quot;</strong> e 
              verificar na página <strong>&quot;Meus Projetos&quot;</strong> se o status está com a tag <strong>&quot;enviado&quot;</strong>.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={() => handleDismissReminder(false)}
                className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Entendi
              </button>
              <button
                onClick={() => handleDismissReminder(true)}
                className="w-full py-2 px-4 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
              >
                Entendi, não me avise novamente neste projeto
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={async () => {
            await loggingService.logNavigation("/criar", "/meusprojetos", {
              buttonType: "voltar",
              projectId: projectId,
              projectType: type
            });
            router.push("/meusprojetos");
          }}
          size="medium"
        />
        {isEdit ? (
          <h2 className="text-xl sm:text-2xl font-bold text-center order-first sm:order-none">
            Edite seu projeto
          </h2>
        ) : (
          <h2 className="text-xl sm:text-2xl font-bold text-center order-first sm:order-none">
            Crie seu projeto
          </h2>
        )}

        <Button
          label={"ENVIAR"}
          onClick={() => handleSendProject(undefined, "enviado")}
          size="medium"
          variant="save"
          disabled={!isInscriptionOpen || !(projectTitle?.trim() || projectData?.projectTitle?.trim())}
        />
      </div>
      <div className="w-full flex flex-col justify-center bg-slate-100 rounded-lg dark:bg-navy p-1 sm:p-4 mt-4 gap-8">
        <div className="flex flex-col sm:flex-row w-full items-stretch sm:items-center justify-between mt-2 px-4 gap-4">
          <TextInput
            placeholder="Nome do Projeto"
            className="flex-1 min-h-[50px] max-h-[50px]"
            value={
              projectTitle ? projectTitle : projectData?.projectTitle || ""
            }
            onChange={(e) => setProjectTitle(e.target.value)}
          />
          <div className="sm:min-w-[180px]">
            <Button
              label={"Atualizar Nome"}
              onClick={() => handleSendProject(projectTitle)}
              size="full"
              variant="save"
            />
          </div>
        </div>
        {(() => {
          const availableTypes: any[] = Array.isArray(city?.typesOfProjects)
            ? city.typesOfProjects
            : [];
          const currentTypeConfig = availableTypes.find((p) => p?.name === type);
          const editalLink = currentTypeConfig?.editalLink;
          if (!editalLink) return null;
          return (
            <div className="w-full flex justify-center items-center cursor-pointer ">
              <p
                className="bg-primary-600 cursor-pointer p-4 rounded-lg text-white"
                onClick={() => window.open(editalLink, "_blank")}
              >
                LER OBJETO DO EDITAL
              </p>
            </div>
          );
        })()}
        <div className="w-full">
          {renderType === "fomento" && <Fomento />}
          {renderType === "premiacao" && <Premiacao />}
          {renderType === "culturaViva" && <CulturaViva />}
          {renderType === "areasPerifericas" && <AreasPerifericas />}
          {renderType === "subsidio" && <Subsidio />}
          {!hasValidType && (
            <div className="rounded-lg border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-4 text-sm text-yellow-800 dark:text-yellow-200">
              Tipo de projeto inválido ou ausente. Volte para seleção de tipo e tente novamente.
            </div>
          )}
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
