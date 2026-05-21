"use client";
import Tabs from "@/app/components/Tabs";
import InfoGerais from "../secoes/InfoGerais";
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
  const generalInfoFields = Array.isArray(projectDetails?.fields?.generalInfo)
    ? projectDetails.fields.generalInfo
    : [];
  const hasGeneralInfo = generalInfoFields.length > 0 || Boolean(projectDetails?.extraGeneralInfo);
  const hasBudget = projectDetails?.hasBudget !== false;

  const tabs = [
    {
      label: "Proponente",
      content: <Proponente />,
    },
    ...(hasGeneralInfo
      ? [
          {
            label: "Informações Gerais",
            content: <InfoGerais />,
          },
        ]
      : []),
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
