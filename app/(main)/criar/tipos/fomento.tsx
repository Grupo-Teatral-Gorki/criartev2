import Tabs from "@/app/components/Tabs";
import InfoGerais from "../secoes/InfoGerais";
import Documentos from "../secoes/Documentos";
import Proponente from "../secoes/Proponente";
import PlanilhaOrcamentaria from "../secoes/PlanilhaOrcamentaria";

const Fomento = () => {
  const tabs = [
    {
      label: "Proponente",
      content: <Proponente />,
    },
    {
      label: "Informações Gerais",
      content: <InfoGerais />,
    },
    {
      label: "Documentos",
      content: <Documentos />,
    },
    {
      label: "Planilha Orçamentária",
      content: <PlanilhaOrcamentaria />,
    },
  ];
  return <Tabs tabs={tabs} />;
};

export default Fomento;
