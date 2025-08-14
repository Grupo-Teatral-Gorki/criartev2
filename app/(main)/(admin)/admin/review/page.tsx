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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-8 lg:px-32 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projetos a Avaliar</h1>
          <p className="text-gray-600">Gerencie e avalie os projetos atribuídos a você</p>
        </div>
        
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum projeto atribuído</h3>
            <p className="text-gray-500">Você não possui projetos para avaliar no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.projectId}
                onClick={() => router.push(`/admin/review/${project.projectId}`)}
                className="group bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer overflow-hidden"
              >
                {/* Status Badge */}
                <div className="px-6 pt-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                          {project.projectTitle}
                        </h3>
                      </div>
                    </div>
                    
                    {project.evaluated ? (
                      <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Avaliado
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                        <XCircle className="w-3 h-3" />
                        Pendente
                      </div>
                    )}
                  </div>
                  
                  {/* Project Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Proponente:</span>
                      <span className="text-sm text-gray-900 font-medium">{project.proponent || "Não informado"}</span>
                    </div>
                    
                    {project.registrationNumber && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nº Inscrição:</span>
                        <span className="text-sm text-gray-700 font-mono">{project.registrationNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Action Area */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 group-hover:bg-primary/5 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 group-hover:text-primary transition-colors">
                      {project.evaluated ? "Ver avaliação" : "Avaliar projeto"}
                    </span>
                    <div className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors">
                      →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Avaliar;
