"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useCity } from "@/app/context/CityConfigContext";
import AgentesTab from "./AgentesTab";
import ColetivosTab from "./ColetivosTab";
import EspacosTab from "./EspacosTab";

type GenericDoc = { id: string; [key: string]: any };

type FetchState = {
  loading: boolean;
  error: string | null;
};

export default function MappingTab() {
  const { city } = useCity();
  const cityId = city?.cityId;

  const [agentes, setAgentes] = useState<GenericDoc[]>([]);
  const [coletivos, setColetivos] = useState<GenericDoc[]>([]);
  const [espacos, setEspacos] = useState<GenericDoc[]>([]);
  const [activeTab, setActiveTab] = useState<'agentes' | 'coletivos' | 'espacos'>('agentes');

  const [state, setState] = useState<FetchState>({
    loading: false,
    error: null,
  });

  useEffect(() => {
    const loadAll = async () => {
      if (!cityId) return;
      setState({ loading: true, error: null });
      try {
        const agentesQ = query(
          collection(db, "agentes"),
          where("cityId", "==", cityId)
        );
        const coletivosQ = query(
          collection(db, "coletivoSemCNPJ"),
          where("cityId", "==", cityId)
        );
        const espacosQ = query(
          collection(db, "espacoCultural"),
          where("cityId", "==", cityId)
        );

        const [agentesSnap, coletivosSnap, espacosSnap] = await Promise.all([
          getDocs(agentesQ),
          getDocs(coletivosQ),
          getDocs(espacosQ),
        ]);

        setAgentes(
          agentesSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Record<string, unknown>),
          }))
        );
        setColetivos(
          coletivosSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Record<string, unknown>),
          }))
        );
        setEspacos(
          espacosSnap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Record<string, unknown>),
          }))
        );
        setState({ loading: false, error: null });
      } catch (err) {
        setState({
          loading: false,
          error: "Erro ao carregar dados de mapeamento.",
        });
        // eslint-disable-next-line no-console
        console.error(err);
      }
    };

    loadAll();
  }, [cityId]);

  const counts = useMemo(
    () => ({
      agentes: agentes.length,
      coletivos: coletivos.length,
      espacos: espacos.length,
    }),
    [agentes.length, coletivos.length, espacos.length]
  );

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
        <AgentesTab agentes={agentes} loading={state.loading} error={state.error} />
      )}
      {activeTab === 'coletivos' && (
        <ColetivosTab coletivos={coletivos} loading={state.loading} error={state.error} />
      )}
      {activeTab === 'espacos' && (
        <EspacosTab espacos={espacos} loading={state.loading} error={state.error} />
      )}
    </div>
  );
}
