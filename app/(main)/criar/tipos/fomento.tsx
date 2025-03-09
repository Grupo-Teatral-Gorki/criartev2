import Tabs from "@/app/components/Tabs";
import { TextInput } from "@/app/components/TextInput";
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
  return (
    <div className="w-full flex flex-col justify-center bg-slate-100 rounded-lg dark:bg-navy p-1 sm:p-4 mt-4 gap-8">
      <div className="flex w-full items-center justify-between mt-2 px-4 gap-8">
        <TextInput placeholder="Nome do Projeto" className="flex-1" />
        <p className="font-bold whitespace-nowrap flex items-center">ID: 210</p>
      </div>
      <div className="w-full flex justify-center items-center cursor-pointer ">
        <p
          className="bg-primary cursor-pointer p-4 rounded-lg text-white"
          onClick={() =>
            window.open(
              "https://criarte.s3.us-east-2.amazonaws.com/public/Edital%2Bde%2BFomento-%2BSanta%2BRita-6-37.pdf",
              "_blank"
            )
          }
        >
          LER OBJETO DO EDITAL
        </p>
      </div>
      <div className="w-full">
        <Tabs tabs={tabs} />
      </div>
    </div>
  );
};

export default Fomento;
