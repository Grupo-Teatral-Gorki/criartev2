"use client";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import TypeProjectCard from "@/app/components/TypeProjectCard";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import { ProjectTypesType } from "@/app/utils/interfaces";
import { useCity } from "@/app/context/CityConfigContext";

const SelecionarTipoProjeto = () => {
  const [projectTypes, setProjectTypes] = useState<ProjectTypesType[]>([]);
  const router = useRouter();
  const { dbUser } = useAuth();
  const { city } = useCity();

  useEffect(() => {
    if (!city) return;
    setProjectTypes(city.typesOfProjects);
  }, [city]);

  const createEmptyProjectForUser = async (type: string) => {
    if (!dbUser) {
      console.error("User not authenticated");
      return { success: false, error: "User not authenticated" };
    }
    try {
      const newDocRef = doc(collection(db, "projects"));
      const projectId = newDocRef.id;
      await setDoc(newDocRef, {
        userId: dbUser!.id,
        projectId,
      });
      router.push(`/criar?state=${type}&projectId=${projectId}`);
      return { success: true, projectId };
    } catch (error) {
      console.error("Error creating project:", error);
      return { success: false, error };
    }
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-36 gap-8">
      <div className="w-full flex items-center justify-between bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
        />
        <h2 className="text-2xl font-bold flex-grow text-center">
          Selecione o tipo de projeto
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {projectTypes.map((type) => (
          <TypeProjectCard
            key={type.name}
            available={type.available}
            description={type.description}
            label={type.label}
            name={type.name}
            onClick={() => createEmptyProjectForUser(type.name)}
          />
        ))}
      </div>
    </div>
  );
};

export default SelecionarTipoProjeto;
