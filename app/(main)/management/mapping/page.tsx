"use client";

import React from "react";
import ProponentesTab from "../components/ProponentesTab";
import Button from "@/app/components/Button";
import { useRouter } from "next/navigation";
import { useCity } from "@/app/context/CityConfigContext";

export default function MappingPage() {
  const router = useRouter();
  const { city } = useCity();
  const cityId = city?.cityId;

  return (
    <div className="flex flex-col gap-4 md:gap-6 px-4 md:px-8 lg:px-32 w-full pb-8 md:pb-12">
      <div className="flex gap-4 py-4 w-full items-center justify-between">
        <div className="flex gap-4 justify-evenly items-center">
          <Button
            label="Voltar"
            size="medium"
            variant="inverted"
            onClick={() => router.back()}
          />
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">Mapeamento de Proponentes</h3>
        <div className="text-slate-600 dark:text-slate-300">
          Cidade selecionada:{" "}
          <span className="font-semibold">
            {city ? `${city.name} (${city.cityId})` : "—"}
          </span>
        </div>
      </div>

      {cityId ? (
        <ProponentesTab cityId={cityId} loading={false} error={null} />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12">
          <p className="text-center text-slate-600 dark:text-slate-400">
            Nenhuma cidade selecionada. Por favor, selecione uma cidade primeiro.
          </p>
        </div>
      )}
    </div>
  );
}
