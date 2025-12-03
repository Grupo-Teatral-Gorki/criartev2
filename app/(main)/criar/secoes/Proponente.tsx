import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
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

const Proponent = () => {
    const [selectedProponent, setSelectedProponent] = useState("");
    const [proponents, setProponents] = useState<any[]>([]);
    const { user, dbUser } = useAuth();
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    const getUserProponents = async () => {
        if (!user) return;

        try {
            const proponenteService = ProponenteService.getInstance();
            const data = await proponenteService.getProponentesByUser(user.uid);

            const proponentOptions = data.map((proponente) => {
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
        if (!projectId) return console.error("Projeto não encontrado");
        const projectRef = doc(db, "projects", projectId);
        await updateDoc(projectRef, {
            proponentId,
            updatedAt: new Date(),
            updatedBy: dbUser?.id,
        });
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
        if (projectId) {
            getDbProponent(projectId);
        }

        getUserProponents();
    }, [user]);

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
                {proponents.length === 0 ? (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                        <p className="text-slate-600 dark:text-slate-400 mb-2">
                            Você ainda não tem proponentes cadastrados.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Clique em "Ir para Proponentes" para criar seu primeiro proponente.
                        </p>
                    </div>
                ) : (
                    <SelectInput
                        options={proponents}
                        value={selectedProponent}
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
