"use client";
import Tabs from "@/app/components/Tabs";
import Documentos from "../secoes/Documentos";
import PlanilhaOrcamentaria from "../secoes/PlanilhaOrcamentaria";
import Proponente from "../secoes/Proponente";
import FichaTecnica from "../secoes/FichaTecnica";
import { useCity } from "@/app/context/CityConfigContext";
import { useSearchParams } from "next/navigation";

const Premiacao = () => {
  const city = useCity();
  const searchParams = useSearchParams();
  const projectType = searchParams.get("state");

  const availableTypes: any[] = Array.isArray(city?.city?.typesOfProjects)
    ? city.city.typesOfProjects
    : [];
  const projectDetails = availableTypes.find((project) => project?.name === projectType);
  const hasBudget = projectDetails?.hasBudget !== false;

  const tabs = [
    {
      label: "Proponente",
      content: <Proponente />,
    },
    {
      label: "Documentos",
      content: <Documentos />,
    },
    ...(hasBudget
      ? [
          {
            label: "Planilha Orçamentária",
            content: <PlanilhaOrcamentaria />,
          },
        ]
      : []),
    {
      label: "Ficha Técnica",
      content: <FichaTecnica />,
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Premiacao;
