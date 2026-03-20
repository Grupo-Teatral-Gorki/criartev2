import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useLogging } from "@/app/hooks/useLogging";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ProponenteService from "@/app/services/proponenteService";
import { ProponenteTipo, ProjectTypesType } from "@/app/utils/interfaces";

const DEFAULT_ACCEPTED_PROPONENT_TYPES: ProponenteTipo[] = ["fisica", "juridica", "coletivo"];

const PROPONENT_TYPE_LABELS: Record<ProponenteTipo, string> = {
    fisica: "Pessoa Física",
    juridica: "Pessoa Jurídica",
    coletivo: "Coletivo",
};

const Proponent = () => {
    const [selectedProponent, setSelectedProponent] = useState("");
    const [proponents, setProponents] = useState<any[]>([]);
    const [projectUnavailable, setProjectUnavailable] = useState(false);
    const [acceptedProponentTypes, setAcceptedProponentTypes] = useState<ProponenteTipo[]>(
        DEFAULT_ACCEPTED_PROPONENT_TYPES
    );
    const [hasAnyRegisteredProponents, setHasAnyRegisteredProponents] = useState(false);
    const { user, dbUser } = useAuth();
    const loggingService = useLogging();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");
    const projectTypeParam = searchParams.get("state");

    const getAcceptedProponentTypesForProject = async (
        currentProjectId: string | null,
        currentProjectType: string | null
    ): Promise<ProponenteTipo[]> => {
        try {
            let resolvedProjectType = currentProjectType;
            let resolvedCityId = dbUser?.cityId || "";

            if (currentProjectId) {
                const projectByIdRef = doc(db, "projects", currentProjectId);
                const projectByIdSnap = await getDoc(projectByIdRef);

                if (projectByIdSnap.exists()) {
                    const projectData = projectByIdSnap.data();
                    resolvedProjectType = projectData.projectType || resolvedProjectType;
                    resolvedCityId = projectData.cityId || resolvedCityId;
                }
            }

            if (!resolvedProjectType || !resolvedCityId) {
                return DEFAULT_ACCEPTED_PROPONENT_TYPES;
            }

            const cityQuery = query(
                collection(db, "cities"),
                where("cityId", "==", resolvedCityId)
            );
            const citySnapshot = await getDocs(cityQuery);
            const cityDoc = citySnapshot.docs[0];

            if (!cityDoc) {
                return DEFAULT_ACCEPTED_PROPONENT_TYPES;
            }

            const cityData = cityDoc.data();
            const typesOfProjects = Array.isArray(cityData.typesOfProjects)
                ? (cityData.typesOfProjects as ProjectTypesType[])
                : [];

            const matchedType = typesOfProjects.find(
                (projectType) => projectType.name === resolvedProjectType
            );

            if (
                matchedType?.acceptedProponentTypes &&
                matchedType.acceptedProponentTypes.length > 0
            ) {
                return matchedType.acceptedProponentTypes;
            }

            return DEFAULT_ACCEPTED_PROPONENT_TYPES;
        } catch (error) {
            console.error("Error fetching accepted proponent types:", error);
            return DEFAULT_ACCEPTED_PROPONENT_TYPES;
        }
    };

    const getUserProponents = async (allowedTypes: ProponenteTipo[]) => {
        if (!user) return;

        try {
            const proponenteService = ProponenteService.getInstance();
            const data = await proponenteService.getProponentesByUser(user.uid);

            setHasAnyRegisteredProponents(data.length > 0);

            const filteredByType = data.filter((proponente) =>
                allowedTypes.includes((proponente.tipo || "") as ProponenteTipo)
            );

            const proponentOptions = filteredByType.map((proponente) => {
                let label = '';
                if (proponente.tipo === 'fisica') {
                    label = proponente.dadosPessoais?.nomeCompleto || 'Nome não informado';
                } else if (proponente.tipo === 'juridica') {
                    label = proponente.dadosPessoaJuridica?.razaoSocial || 'Razão social não informada';
                } else {
                    label = proponente.dadosColetivo?.nomeColetivo || 'Nome não informado';
                }

                return {
                    value: proponente.id || '',
                    label: label,
                };
            });

            setProponents(proponentOptions);
        } catch (error) {
            console.error("Error fetching proponents:", error);
        }
    };

    const handleProponentChange = async (proponentId: string) => {
        setSelectedProponent(proponentId);
        if (!projectId) {
            setProjectUnavailable(true);
            console.error("Projeto não encontrado");
            return;
        }

        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
            proponentId,
            updatedAt: new Date(),
            updatedBy: dbUser?.id,
        });

        // Log update with email notification
        const projectSnap = await getDoc(projectRef);
        const projectTitle = projectSnap.data()?.projectTitle || projectId;
        await loggingService.logProjectUpdate(
            projectId,
            "proponente",
            {},
            dbUser?.email,
            `${dbUser?.firstName} ${dbUser?.lastName}`,
            projectTitle
        );
    };

    const getDbProponent = async (projectId: string) => {
        if (!projectId) return;

        try {
            const projectQuery = query(
                collection(db, "projects"),
                where("projectId", "==", projectId)
            );

            const projectSnapshot = await getDocs(projectQuery);
            const projectDoc = projectSnapshot.docs[0];

            if (!projectDoc) {
                console.log("Project not found.");
                return null;
            }

            const { proponentId } = projectDoc.data();

            if (!proponentId) {
                console.log("No proponentId in project document.");
                return null;
            }

            // Check if proponentId exists in new proponentes collection
            const proponenteService = ProponenteService.getInstance();
            const proponentData = await proponenteService.getProponenteById(proponentId);

            if (proponentData) {
                setSelectedProponent(proponentId);
                return proponentData;
            }

            console.log("Proponent not found.");
            return null;
        } catch (error) {
            console.error("Error fetching proponent:", error);
            return null;
        }
    };

    useEffect(() => {
        const loadProponentes = async () => {
            if (projectId) {
                setProjectUnavailable(false);
                getDbProponent(projectId);
            } else {
                setProjectUnavailable(true);
            }

            const allowedTypes = await getAcceptedProponentTypesForProject(
                projectId,
                projectTypeParam
            );
            setAcceptedProponentTypes(allowedTypes);

            await getUserProponents(allowedTypes);
        };

        loadProponentes();
    }, [user, projectId, projectTypeParam, dbUser?.cityId]);

    const acceptedTypesLabel = acceptedProponentTypes
        .map((tipo) => PROPONENT_TYPE_LABELS[tipo])
        .join(", ");

    return (
        <>
            <div className="w-full mt-4">
                <div className="w-full flex justify-end mb-4">
                    <Button
                        label={"Ir para Proponentes"}
                        size="medium"
                        variant="default"
                        onClick={() => window.open('/proponentes', '_blank')}
                    />
                </div>
                <h2 className="mb-4 text-lg">Selecione um Proponente:</h2>
                {projectUnavailable && (
                    <div className="p-3 mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            Projeto não identificado no momento. Reabra esta tela pelo fluxo de edição/criação do projeto.
                        </p>
                    </div>
                )}
                {!hasAnyRegisteredProponents ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                            Você ainda não tem proponentes cadastrados.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Clique em &quot;Ir para Proponentes&quot; para criar seu primeiro proponente.
                        </p>
                    </div>
                ) : proponents.length === 0 ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                            Você não tem proponente cadastrado aceito nesse tipo de edital, cadastre um proponente do tipo {acceptedTypesLabel}.
                        </p>
                    </div>
                ) : (
                    <SelectInput
                        options={proponents}
                        value={selectedProponent}
                        disabled={projectUnavailable}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                            handleProponentChange(e.target.value)
                        }
                    />
                )}
            </div>
        </>
    );
};

export default Proponent;
