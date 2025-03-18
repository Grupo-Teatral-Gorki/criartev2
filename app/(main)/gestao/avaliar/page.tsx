"use client";
import ProjectTable from "@/app/components/ProjectTable";
import { useAuth } from "@/app/context/AuthContext";
import { api } from "@/app/utils/api";
import { Project } from "@/app/utils/interfaces";
import React, { useEffect, useState } from "react";

const Avaliar = () => {
  const { token } = useAuth();
  const [projectsFromApi, setProjectsFromApi] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;

      try {
        const res = await api.get<{ data: Project[] }>(
          "projeto/listaProjetos",
          token
        );
        setProjectsFromApi(res.data);
      } catch (error) {
        console.error("Erro ao buscar projetos:", error);
      }
    };

    fetchProjects();
  }, [token]);
  return (
    <div className="p-32">
      {projectsFromApi && <ProjectTable data={projectsFromApi} />}
    </div>
  );
};

export default Avaliar;
