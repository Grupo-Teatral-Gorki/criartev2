"use client";

import Button from "@/app/components/Button";
import HomeCard from "@/app/components/HomeCard";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import Image from "next/image";
import React from "react";

const Home = () => {
  const { city } = useCity();
  const { dbUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-350px)]">
      <div className="flex flex-col md:flex-row justify-around items-center md:w-3/4 gap-5">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          <a
            href="https://www.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block md:hidden border-t-4 border-orange rounded-xl py-4"
          >
            <Button label="Ver Editais" size="full" variant="inverted" />
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
          {/* <HomeCard
            title={"Mapeamento"}
            description={"Mapeamento da cidade e seus agentes"}
            href={"/map"}
          /> */}
          <HomeCard
            title={"Ajuda"}
            description={"Veja como usar a plataforma e tire suas dúvidas"}
            href={"/help"}
          />
        </div>

        {/* Right Section */}
        <div className="flex-col w-[30rem] bg-navy/30 gap-6 p-9 rounded-xl items-center justify-center hidden md:flex">
          <Image
            alt="Logo Cidade"
            src={city?.cityLogoUrl || "https://picsum.photos/200"}
            width={200}
            height={0}
            className="hidden md:block"
          />
          {city && (
            <h2 className="text-2xl font-bold text-center hidden md:block">
              Editais de {city.name}
            </h2>
          )}
          <a
            href="https://www.example.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block"
          >
            <Button label="Ver Editais" size="full" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Home;
