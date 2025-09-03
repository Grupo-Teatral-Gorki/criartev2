"use client";
import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { SelectInput } from "@/app/components/SelectInput";
import Toast from "@/app/components/Toast";
import { useAuth } from "@/app/context/AuthContext";
import { FolderOpen } from "lucide-react";

interface Project {
  projectId: string;
  projectTitle: string;
  registrationNumber?: string;
}

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<
    Record<string, string>
  >({});

  const { dbUser } = useAuth();

  const handleReviewerChange = async (projectId: string, userId: string) => {
    setSelectedReviewers((prev) => ({
      ...prev,
      [projectId]: userId,
    }));

    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        reviewer: userId,
        updatedAt: new Date(),
        updatedBy: dbUser?.id,
      });
      setToastType("success");
      setToastMessage("Parecerista atribuído com sucesso!");
      setShowToast(true);
    } catch (error) {
      console.error("Erro ao atribuir parecerista:", error);
      setToastType("error");
      setToastMessage("Erro ao atribuir parecerista.");
      setShowToast(true);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, "projects");
        const q = query(projectsRef, where("projectStatus", "==", "enviado"));
        const querySnapshot = await getDocs(q);

        const projectData: Project[] = querySnapshot.docs.map((doc) => ({
          projectId: doc.id,
          projectTitle: doc.data().projectTitle,
          registrationNumber: doc.data().registrationNumber,
        }));

        setProjects(projectData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, "users");
        const q = query(
          usersRef,
          where("userRole", "array-contains", "reviewer")
        );
        const querySnapshot = await getDocs(q);

        const reviewers = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            value: doc.id,
            label: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
          };
        });

        setUsers(reviewers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchProjects();
    fetchUsers();
  }, []);

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-semibold mb-6">Projetos</h2>
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-gray-500 space-y-4">
          <FolderOpen className="w-16 h-16" />
          <p className="text-lg font-semibold">
            Nenhum projeto disponível para atribuição.
          </p>
          <p className="text-sm text-gray-400">
            Todos os projetos foram avaliados ou ainda não há projetos enviados.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {projects.map((project) => (
            <div
              key={project.projectId}
              className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 space-y-3 transition hover:shadow-md max-h-[200px]"
            >
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-800">ID:</span>{" "}
                {project.registrationNumber}
              </p>
              <p className="text-base font-semibold text-gray-900">
                {project.projectTitle}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Definir Parecerista
                </label>
                <SelectInput
                  value={selectedReviewers[project.projectId] || ""}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleReviewerChange(project.projectId, e.target.value)
                  }
                  options={users}
                  placeholder="Selecione um parecerista"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
};

export default ProjectList;
