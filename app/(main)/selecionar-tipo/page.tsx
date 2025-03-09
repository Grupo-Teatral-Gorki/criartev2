"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Button from "@/app/components/Button";
import TypeProjectCard from "@/app/components/TypeProjectCard";

const SelecionarTipoProjeto = () => {
  const router = useRouter();

  const handleNavigate = (type: string) => {
    router.push(`/criar?state=${type}`);
  };

  // Define the types of projects
  const tipos = [
    {
      type: "Fomento",
      url: "fomento",
      description: `Os programas de fomento da Secretaria de Cultura e Economia Criativa
        têm o objetivo de apoiar a realização de projetos culturais, por meio
        da concessão de incentivos financeiros para artistas, grupos,
        instituições e coletivos.`,
      available: false,
    },
    {
      type: "Premiação de Mestres E Mestras",
      url: "premiacao",
      description: `O objeto deste Edital é a Premiação de Mestres e Mestras e Grupos e Coletivos das Culturas Tradicionais e Populares que tenham prestado relevante contribuição ao desenvolvimento artístico ou cultural do Município.`,
      available: true,
    },
    {
      type: "FOMENTO A PROJETOS CONTINUADOS DE PONTOS DE CULTURA (CULTURA VIVA)",
      url: "culturaViva",
      description: `O Município de São José do Rio Pardo - SP torna público o presente Edital para o desenvolvimento da “REDE MUNICIPAL DE PONTOS DE CULTURA DE SÃO JOSÉ DO RIO PARDO – SP por meio da Política Nacional de Cultura Viva (PNCV), instituída pela Lei nº 13.018, de 22 de julho de 2014.`,
      available: true,
    },
    {
      type: "Áreas Periféricas",
      url: "areasPerifericas",
      description: "Atividades artísticas voltadas para zonas periféricas",
      available: true,
    },
    {
      type: "Subsídio",
      url: "subsidio",
      description: `SELEÇÃO ESPAÇO, AMBIENTES E INICIATIVAS ARTÍSTICO-CULTURAIS PARA RECEBER SUBSÍDIO PARA MANUTENÇÃO COM RECURSOS DA POLÍTICA NACIONAL ALDIR BLANC DE FOMENTO À CULTURA – PNAB (LEI Nº 14.399/2022)`,
      available: true,
    },
  ];

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center px-36 gap-8">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tipos.map((tipo) => (
          <TypeProjectCard
            key={tipo.url}
            onClick={() => handleNavigate(tipo.url)}
            available={tipo.available}
            type={tipo.type}
            description={tipo.description}
          />
        ))}
      </div>
    </div>
  );
};

export default SelecionarTipoProjeto;
