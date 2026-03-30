"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import Button from "@/app/components/Button";
import Spinner from "@/app/components/Spinner";
import Toast from "@/app/components/Toast";
import { CheckCircle, Clock, Send } from "lucide-react";

interface City {
  id: string;
  cityId: string;
  name: string;
}

interface Project {
  id: string;
  projectTitle: string;
  registrationNumber: string;
  projectType: string;
  userId: string;
  evaluated: boolean;
  feedbackRequested: boolean;
  feedbackRequestedAt?: any;
  feedbackReleased: boolean;
  feedbackReleasedAt?: any;
  evaluation?: {
    average: number;
    techText: string;
  };
  proponentName?: string;
}

const FeedbackManagement = () => {
  const { dbUser } = useAuth();
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const isAdmin =
    Array.isArray(dbUser?.userRole) && dbUser.userRole.includes("admin");

  useEffect(() => {
    if (!isAdmin) {
      router.push("/home");
      return;
    }
    fetchCities();
  }, [isAdmin, router]);

  useEffect(() => {
    if (selectedCityId) {
      fetchProjects();
    }
  }, [selectedCityId]);

  const fetchCities = async () => {
    try {
      const citiesSnapshot = await getDocs(collection(db, "cities"));
      const citiesData = citiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        cityId: doc.data().cityId,
        name: doc.data().name,
      }));
      setCities(citiesData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    if (!selectedCityId) return;

    setLoading(true);
    try {
      const city = cities.find((c) => c.id === selectedCityId);
      if (!city) return;

      // Get projects that have feedback requested
      const projectsQuery = query(
        collection(db, "projects"),
        where("cityId", "==", city.cityId),
        where("feedbackRequested", "==", true)
      );
      const projectsSnapshot = await getDocs(projectsQuery);

      const projectsData = await Promise.all(
        projectsSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          
          // Get proponent name
          let proponentName = "N/A";
          if (data.userId) {
            const userQuery = query(
              collection(db, "users"),
              where("__name__", "==", data.userId)
            );
            try {
              const userDoc = await getDocs(query(collection(db, "users")));
              const user = userDoc.docs.find(d => d.id === data.userId);
              if (user) {
                const userData = user.data();
                proponentName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || userData.email;
              }
            } catch (e) {
              console.error("Error fetching user:", e);
            }
          }

          return {
            id: docSnap.id,
            projectTitle: data.projectTitle,
            registrationNumber: data.registrationNumber,
            projectType: data.projectType,
            userId: data.userId,
            evaluated: data.evaluated || false,
            feedbackRequested: data.feedbackRequested || false,
            feedbackRequestedAt: data.feedbackRequestedAt,
            feedbackReleased: data.feedbackReleased || false,
            feedbackReleasedAt: data.feedbackReleasedAt,
            evaluation: data.evaluation,
            proponentName,
          };
        })
      );

      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReleaseFeedback = async (projectId: string) => {
    setReleasing(projectId);
    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        feedbackReleased: true,
        feedbackReleasedAt: new Date(),
        feedbackReleasedBy: dbUser?.id,
      });

      setProjects((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, feedbackReleased: true } : p
        )
      );

      setToastMessage("Parecer liberado com sucesso!");
      setToastType("success");
      setShowToast(true);
    } catch (error) {
      console.error("Error releasing feedback:", error);
      setToastMessage("Erro ao liberar parecer.");
      setToastType("error");
      setShowToast(true);
    } finally {
      setReleasing(null);
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-16">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mt-4 mb-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/admin")}
          size="medium"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Gerenciar Pareceres
        </h2>
      </div>

      {/* City Selector */}
      <div className="w-full rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mb-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Selecione o Município
        </label>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
        >
          <option value="">Selecione um município...</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCityId && (
        <div className="w-full rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mb-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma solicitação de parecer pendente.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Projeto
                    </th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Nº Inscrição
                    </th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Proponente
                    </th>
                    <th className="text-left p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Nota
                    </th>
                    <th className="text-center p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Status
                    </th>
                    <th className="text-center p-3 text-slate-700 dark:text-slate-300 font-semibold">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                    >
                      <td className="p-3 text-slate-900 dark:text-slate-100">
                        {project.projectTitle}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 font-mono text-sm">
                        {project.registrationNumber}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {project.proponentName}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {project.evaluation?.average?.toFixed(2) || "N/A"}
                      </td>
                      <td className="p-3 text-center">
                        {project.feedbackReleased ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Liberado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-medium">
                            <Clock className="w-3 h-3" />
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {!project.feedbackReleased && (
                          <button
                            onClick={() => handleReleaseFeedback(project.id)}
                            disabled={releasing === project.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                            {releasing === project.id ? "Liberando..." : "Liberar"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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

export default FeedbackManagement;
