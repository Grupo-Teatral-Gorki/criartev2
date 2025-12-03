"use client";

import Button from "@/app/components/Button";
import HomeCard from "@/app/components/HomeCard";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { useLogging } from "@/app/hooks/useLogging";
import Image from "next/image";
import React from "react";

const Home = () => {
  const { city } = useCity();
  const { dbUser } = useAuth();
  const loggingService = useLogging();

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
          {/* Left Section - Actions */}
          <div className="h-full flex flex-col">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-soft-lg border border-white/20 dark:border-slate-700/50 flex-1">
              <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100 mb-6">
                Ações Rápidas
              </h2>
              <div className="space-y-4">
                <a
                  href="https://www.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block lg:hidden"
                  onClick={async () => {
                    await loggingService.logNavigation("/home", "https://www.example.com", {
                      buttonType: "ver_editais",
                      device: "mobile",
                      cityId: city?.id
                    });
                  }}
                >
                  <Button label="Ver Editais" size="full" variant="default" />
                </a>
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
                    className="rounded-xl object-cover"
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
                <a
                  href="https://www.example.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden lg:block"
                  onClick={async () => {
                    await loggingService.logNavigation("/home", "https://www.example.com", {
                      buttonType: "ver_editais",
                      device: "desktop",
                      cityId: city?.id
                    });
                  }}
                >
                  <Button label="Ver Editais" size="full" variant="inverted" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
