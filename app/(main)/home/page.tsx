"use client";

import Button from "@/app/components/Button";
import HomeCard from "@/app/components/HomeCard";
import { useCity } from "@/app/context/CityConfigContext";
import Image from "next/image";
import React from "react";

const Home = () => {
  const { city } = useCity();

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-350px)]">
      <div className="flex justify-around items-center w-3/4 gap-5">
        {/* Left Section */}
        <div className="flex flex-col space-y-4">
          <HomeCard
            title={"Meus Projetos"}
            description={"Lista de projetos inscritos"}
            href={"/meusprojetos"}
          />
          <HomeCard
            title={"Ajuda"}
            description={"Veja como usar a plataforma e tire suas dúvidas"}
            href={"/ajuda"}
          />
        </div>

        {/* Right Section */}
        <div className="flex flex-col w-[30rem] gap-6 p-9 border-t-4 border-orange rounded-xl items-center justify-center">
          <Image
            alt="Logo Cidade"
            src="https://guariba.sp.gov.br/pat/Arquitetura/Imagens/logo.png"
            width={200}
            height={0}
          />
          {city && (
            <h2 className="text-2xl font-bold text-center">
              Editais de {city.name}
            </h2>
          )}
          <Button label="Ver Editais" variant="inverted" />
        </div>
      </div>
    </div>
  );
};

export default Home;
