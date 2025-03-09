"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Fomento from "./tipos/fomento";
import Button from "@/app/components/Button";
import Premiacao from "./tipos/premiacao";
import CulturaViva from "./tipos/culturaviva";
import AreasPerifericas from "./tipos/areasperifericas";
import Subsidio from "./tipos/subsidio";

const CriarContent = () => {
  const searchParams = useSearchParams();
  const type = searchParams.get("state");
  const router = useRouter();

  return (
    <div className="w-full overflow-y-auto flex flex-col items-center justify-center p-1 sm:px-36">
      <div className="w-full flex items-center justify-between bg-slate-100 rounded-lg dark:bg-navy p-4 mt-4">
        <Button
          label={"VOLTAR"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
          variant="inverted"
        />
        <h2 className="text-2xl font-bold flex-grow text-center">
          Crie seu projeto
        </h2>
        <Button
          label={"SALVAR PROJETO"}
          onClick={() => router.push("/meusprojetos")}
          size="medium"
          variant="save"
        />
      </div>

      {type === "fomento" && <Fomento />}
      {type === "premiacao" && <Premiacao />}
      {type === "culturaViva" && <CulturaViva />}
      {type === "areasPerifericas" && <AreasPerifericas />}
      {type === "subsidio" && <Subsidio />}
    </div>
  );
};

const Criar = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <CriarContent />
    </Suspense>
  );
};

export default Criar;
