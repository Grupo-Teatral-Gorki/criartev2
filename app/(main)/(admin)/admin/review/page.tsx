"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext"; // adjust to your actual auth context
import { useRouter } from "next/navigation";
import { CheckCircle, FolderOpen, XCircle } from "lucide-react";

interface Project {
  projectId: string;
  projectTitle: string;
  evaluated: boolean;
  proponent: string | null;
  registrationNumber?: string;
}

const Avaliar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  async function getFullNameByProponentId(
    proponentId: string
  ): Promise<string | null> {
    const proponentsRef = collection(db, "proponents");
    const q = query(proponentsRef, where("proponentId", "==", proponentId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming proponentId is unique, get first match
      const proponentDoc = querySnapshot.docs[0];
      const data = proponentDoc.data();
      return data.fullName || data.corporateName || null;
    }

    return null; // No matching proponent found
  }

  useEffect(() => {
    const fetchReviewerProjects = async () => {
      if (!user?.uid) return;

      try {
        const q = query(
          collection(db, "projects"),
          where("reviewer", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        const projectsData = await Promise.all(
          snapshot.docs.map(async (doc) => ({
            projectId: doc.id,
            projectTitle: doc.data().projectTitle,
            evaluated: doc.data().evaluated || false,
            proponent: await getFullNameByProponentId(doc.data().proponentId),
            registrationNumber: doc.data().registrationNumber,
          }))
        );

        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching reviewer projects:", error);
      }
    };

    fetchReviewerProjects();
  }, [user]);

  return (
    <div className="px-32 py-8">
      <h2 className="text-2xl font-semibold mb-6">Projetos a Avaliar</h2>
      {projects.length === 0 ? (
        <p>Nenhum projeto atribuído.</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <li
              key={project.projectId}
              onClick={() => router.push(`/admin/review/${project.projectId}`)}
              className="group flex items-center justify-between gap-4 border-2 rounded-lg p-5 cursor-pointer hover:bg-navy hover:text-white transition-colors shadow-md"
            >
              <div className="flex items-center gap-4">
                <FolderOpen className="text-navy group-hover:text-white w-8 h-8 flex-shrink-0 transition-colors" />
                <div>
                  <p className="font-semibold text-xl mb-1">
                    {project.projectTitle}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">
                      Proponente:
                    </span>{" "}
                    {project.proponent}
                  </p>
                  <p className="text-sm text-gray-400">
                    <span className="font-medium text-gray-300">
                      Número de Inscrição:
                    </span>{" "}
                    {project.registrationNumber}
                  </p>
                </div>
              </div>

              {/* Evaluation status icon */}
              {project.evaluated ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <p className="text-center text-sm">Projeto Avaliado</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="w-6 h-6 text-red-500" />
                  <p className="text-center text-sm">Projeto Não Avaliado</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Avaliar;
