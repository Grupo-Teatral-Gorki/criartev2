"use client";
import Button from "@/app/components/Button";
import CustomLoader from "@/app/components/CustomLoader";
import ProjectCard from "@/app/components/ProjectCard";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/utils/api";
import { Project } from "@/app/utils/interfaces";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const MeusProjetos = () => {
  const { token } = useAuth();
  const [projectsFromApi, setProjectsFromApi] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;

      try {
        const res = await api.get<{ data: Project[] }>(
          "projeto/listaProjetos",
          token
        );
        setProjectsFromApi(res.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    fetchProjects();
  }, [token]);

  const router = useRouter();

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-36">
      {/* Header */}
      <div className="w-full flex justify-between bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/home")}
          size="medium"
        />
        <h2 className="text-2xl font-bold">Meus Projetos</h2>
        <Button
          label={"CRIAR PROJETO"}
          onClick={() => router.push("/selecionar-tipo")}
          size="medium"
        />
      </div>

      {/* Scrollable Container */}
      <div className="w-full flex-1 bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        {isLoading && <CustomLoader />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projectsFromApi &&
            projectsFromApi.map((projeto) => (
              <ProjectCard key={projeto.numeroInscricao} projeto={projeto} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MeusProjetos;
