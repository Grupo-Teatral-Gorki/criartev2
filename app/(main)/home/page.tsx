"use client";

import Button from "@/app/components/Button";
import HomeCard from "@/app/components/HomeCard";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { useLogging } from "@/app/hooks/useLogging";
import { db } from "@/app/config/firebaseconfig";
import { collection, getDocs, query, where } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";

const Home = () => {
  const { city } = useCity();
  const { dbUser } = useAuth();
  const loggingService = useLogging();
  const [draftCount, setDraftCount] = useState(0);
  const [draftWarningDismissed, setDraftWarningDismissed] = useState(false);

  useEffect(() => {
    const fetchDraftProjects = async () => {
      if (!dbUser?.id) return;
      try {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", dbUser.id),
          where("projectStatus", "==", "rascunho")
        );
        const snapshot = await getDocs(q);
        setDraftCount(snapshot.size);
      } catch (error) {
        console.error("Error fetching draft projects:", error);
      }
    };

    fetchDraftProjects();
  }, [dbUser]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/20 to-accent-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6">
            Bem-vindo ao{" "}
            <span className="text-primary-600 dark:text-primary-400">
              Criarte
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Plataforma moderna para gestão de projetos culturais e editais
            públicos
          </p>
        </div>

        {/* Draft Projects Warning */}
        {draftCount > 0 && !draftWarningDismissed && (
          <div className="mb-8 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-start gap-3 relative">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                Você tem {draftCount} {draftCount === 1 ? "projeto em rascunho" : "projetos em rascunho"}.
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Projetos em rascunho <strong>não são considerados como enviados</strong>. Acesse seus projetos e clique em &quot;ENVIAR&quot; para concluir a inscrição.
              </p>
              <Link
                href="/meusprojetos"
                className="inline-block mt-2 text-xs font-medium text-amber-800 dark:text-amber-200 underline hover:text-amber-900 dark:hover:text-amber-100"
              >
                Ir para Meus Projetos →
              </Link>
            </div>
            <button
              onClick={() => setDraftWarningDismissed(true)}
              className="absolute top-3 right-3 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
              aria-label="Fechar aviso"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left Section - Actions */}
          <div className="h-full flex flex-col">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-soft-lg border border-white/20 dark:border-slate-700/50 flex-1">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Ações Rápidas
              </h2>
              <div className="space-y-4">
                {city?.homeLink && (
                  <a
                    href={city.homeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block lg:hidden"
                    onClick={async () => {
                      await loggingService.logNavigation("/home", city.homeLink, {
                        buttonType: "ver_editais",
                        device: "mobile",
                        cityId: city?.id
                      });
                    }}
                  >
                    <Button label="Ver Editais" size="full" variant="default" />
                  </a>
                )}
                {dbUser?.userRole.includes("secretary") ? (
                  <HomeCard
                    title={"Visualizar Projetos"}
                    description={"Lista de projetos para visualização"}
                    href={"/management"}
                  />
                ) : (
                  <HomeCard
                    title={"Meus Projetos"}
                    description={"Lista de projetos inscritos"}
                    href={"/meusprojetos"}
                  />
                )}
                <HomeCard
                  title={"Meus Proponentes"}
                  description={
                    "Cadastrar proponentes"
                  }
                  href={"/proponentes"}
                />
                <HomeCard
                  title={"Ajuda"}
                  description={"Canais de ajuda"}
                  href={"/help"}
                />
              </div>
            </div>
          </div>

          {/* Right Section - City Info */}
          <div className="h-full flex flex-col">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-800 dark:to-primary-900 rounded-3xl p-8 text-white shadow-soft-lg flex-1">
              <div className="text-center space-y-6">
                <div className="w-48 h-48 mx-auto bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Image
                    alt="Logo Cidade"
                    src={city?.cityLogoUrl || "https://picsum.photos/200"}
                    width={160}
                    height={160}
                    className="rounded-xl object-contain w-full h-full p-2"
                  />
                </div>
                {city && (
                  <div>
                    <h2 className="text-3xl font-bold mb-2">
                      Editais de {city.name}
                    </h2>
                    <p className="text-primary-100 mb-6">
                      Explore as oportunidades culturais disponíveis
                    </p>
                  </div>
                )}
                {city?.homeLink && (
                  <a
                    href={city.homeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:block"
                    onClick={async () => {
                      await loggingService.logNavigation("/home", city.homeLink, {
                        buttonType: "ver_editais",
                        device: "desktop",
                        cityId: city?.id
                      });
                    }}
                  >
                    <Button label="Ver Editais" size="full" variant="inverted" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
