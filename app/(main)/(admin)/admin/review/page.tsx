"use client";
import React, { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext"; // adjust to your actual auth context
import { useRouter } from "next/navigation";

interface Project {
  projectId: string;
  projectTitle: string;
  registrationNumber?: string;
}

const Avaliar = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchReviewerProjects = async () => {
      if (!user?.uid) return;

      try {
        const q = query(
          collection(db, "projects"),
          where("reviewer", "==", user.uid)
        );

        const snapshot = await getDocs(q);
        const projectsData = snapshot.docs.map((doc) => ({
          projectId: doc.id,
          projectTitle: doc.data().projectTitle,
          registrationNumber: doc.data().registrationNumber,
        }));

        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching reviewer projects:", error);
      }
    };

    fetchReviewerProjects();
  }, [user]);

  return (
    <div className="p-32">
      <h2 className="text-2xl font-semibold mb-6">Projetos a Avaliar</h2>
      {projects.length === 0 ? (
        <p>Nenhum projeto atribuído.</p>
      ) : (
        <ul className="space-y-4">
          {projects.map((project) => (
            <li
              key={project.projectId}
              className="border rounded p-4 cursor-pointer hover:bg-gray-100"
              onClick={() => router.push(`/admin/review/${project.projectId}`)}
            >
              <p className="font-bold text-lg">{project.projectTitle}</p>
              <p className="text-sm text-gray-500">
                Registro: {project.registrationNumber}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Avaliar;
