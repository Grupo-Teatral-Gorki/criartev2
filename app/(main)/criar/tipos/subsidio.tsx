import Tabs from "@/app/components/Tabs";
import Documentos from "../secoes/Documentos";
import PlanilhaOrcamentaria from "../secoes/PlanilhaOrcamentaria";
import Proponente from "../secoes/Proponente";
import FichaTecnica from "../secoes/FichaTecnica";

const Subsidio = () => {
  const tabs = [
    {
      label: "Proponente",
      content: <Proponente />,
    },
    {
      label: "Documentos",
      content: <Documentos />,
    },
    {
      label: "Planilha Orçamentária",
      content: <PlanilhaOrcamentaria />,
    },
    {
      label: "Ficha Técnica",
      content: <FichaTecnica />,
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Subsidio;
