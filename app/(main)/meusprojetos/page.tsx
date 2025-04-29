"use client";
import Button from "@/app/components/Button";
import ProjectCard from "@/app/components/ProjectCard";
import Spinner from "@/app/components/Spinner";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { getDocs, collection, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";

const MeusProjetos = () => {
  const [projectsFromApi, setProjectsFromApi] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { dbUser } = useAuth();

  const getUserProjects = async (userId: string) => {
    const q = query(collection(db, "projects"), where("userId", "==", userId));

    const querySnapshot = await getDocs(q);
    const projects = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return projects;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      if (dbUser) {
        const projects = await getUserProjects(dbUser.id);
        setProjectsFromApi(projects);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [dbUser]);

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center sm:px-36">
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
        {isLoading && <Spinner />}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projectsFromApi &&
            projectsFromApi.map((project) => (
              <ProjectCard key={project.projectId} project={project} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default MeusProjetos;
