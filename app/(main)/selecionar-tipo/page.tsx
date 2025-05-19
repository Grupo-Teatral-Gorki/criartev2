"use client";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import TypeProjectCard from "@/app/components/TypeProjectCard";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
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
      // Reference to the collection where we store the last project ID
      const lastIdRef = doc(db, "system", "lastProjectId");
      const lastIdDoc = await getDoc(lastIdRef);

      let newProjectId = 1; // Default projectId if no ID is stored
      if (lastIdDoc.exists()) {
        newProjectId = lastIdDoc.data().lastId + 1; // Increment the last projectId
      }

      // Update the last used project ID in the system document
      await setDoc(lastIdRef, { lastId: newProjectId });

      // Format the projectId to be a 4-digit number with leading zeros
      const formattedProjectId = newProjectId.toString().padStart(4, "0");

      // Create a new project document in the "projects" collection
      const newDocRef = doc(collection(db, "projects"));
      await setDoc(newDocRef, {
        userId: dbUser!.id,
        projectStatus: "rascunho",
        projectId: newDocRef.id,
        registrationNumber: formattedProjectId,
        projectType: type,
      });

      console.log("Project created:", {
        projectId: newDocRef.id,
        userId: dbUser!.id,
        projectStatus: "rascunho",
        registrationNumber: formattedProjectId,
        projectType: type,
      });

      // Redirect to the project creation page with the type and projectId
      router.push(`/criar?state=${type}&projectId=${newDocRef.id}`);

      return { success: true, projectId: formattedProjectId };
    } catch (error) {
      console.error("Error creating project:", error);
      return { success: false, error };
    }
  };

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-8 md:px-36 gap-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {projectTypes &&
          projectTypes.map((type) => (
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
      {!projectTypes && (
        <p className="text-2xl">
          Nenhum tipo de projeto configurado, entre em contato com o suporte.
        </p>
      )}
    </div>
  );
};

export default SelecionarTipoProjeto;
