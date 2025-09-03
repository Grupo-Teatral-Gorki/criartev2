"use client";

import React, { useState, useMemo } from "react";
import { useCity } from "@/app/context/CityConfigContext";
import { GenericDataTab } from "./GenericDataTab";
import { useMappingData } from "../hooks/useMappingData";
import { TabType, TabConfig } from "../types/mapping.types";
import { 
  agenteFieldExtractor, 
  coletivoFieldExtractor, 
  espacoFieldExtractor 
} from "../services/fieldExtractor.service";

export default function MappingTab() {
  const { city } = useCity();
  const { data, loading, error, counts } = useMappingData(city?.cityId);
  const [activeTab, setActiveTab] = useState<TabType>('agentes');

  const tabs = [
    { id: 'agentes' as const, label: 'Agentes', count: counts.agentes },
    { id: 'coletivos' as const, label: 'Coletivos sem CNPJ', count: counts.coletivos },
    { id: 'espacos' as const, label: 'Espaços Culturais', count: counts.espacos },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">Dados de Mapeamento</h3>
        <div className="text-slate-600 dark:text-slate-300 mb-4">
          Cidade selecionada:{" "}
          <span className="font-semibold">
            {city ? `${city.name} (${city.cityId})` : "—"}
          </span>
        </div>
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-900/50'
              }`}
            >
              {tab.label} <span className="font-bold">({tab.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'agentes' && (
        <GenericDataTab
          title="Agentes"
          data={data.agentes}
          loading={loading}
          error={error}
          fieldExtractor={agenteFieldExtractor}
          loadingMessage="Carregando agentes..."
        />
      )}
      {activeTab === 'coletivos' && (
        <GenericDataTab
          title="Coletivos sem CNPJ"
          data={data.coletivos}
          loading={loading}
          error={error}
          fieldExtractor={coletivoFieldExtractor}
          loadingMessage="Carregando coletivos..."
        />
      )}
      {activeTab === 'espacos' && (
        <GenericDataTab
          title="Espaços Culturais"
          data={data.espacos}
          loading={loading}
          error={error}
          fieldExtractor={espacoFieldExtractor}
          loadingMessage="Carregando espaços culturais..."
        />
      )}
    </div>
  );
}
