import Tabs from "@/app/components/Tabs";
import Documentos from "../secoes/Documentos";
import PlanilhaOrcamentaria from "../secoes/PlanilhaOrcamentaria";
import Proponente from "../secoes/Proponente";

const Premiacao = () => {
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
  ];
  return <Tabs tabs={tabs} />;
};

export default Premiacao;
