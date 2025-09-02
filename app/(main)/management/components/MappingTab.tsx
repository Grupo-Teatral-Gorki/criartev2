"use client";

import React, { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useCity } from "@/app/context/CityConfigContext";

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

  const get = (obj: any, paths: string[]): string | undefined => {
    for (const p of paths) {
      const val = p
        .split(".")
        .reduce((acc: any, key: string) => (acc ? acc[key] : undefined), obj);
      if (typeof val === "string" && val.trim().length > 0) return val;
    }
    return undefined;
  };

  const getNomeAgente = (doc: GenericDoc) =>
    get(doc, ["nomeSocial", "nome", "representacao.nomeSocial"]);
  const getEmailAgente = (doc: GenericDoc) => get(doc, ["email"]);
  const getTelefoneAgente = (doc: GenericDoc) =>
    get(doc, ["dddTelefone", "telefone", "phone"]);

  const getNomeColetivo = (doc: GenericDoc) =>
    get(doc, ["contatoColetivo", "responsavelColetivo"]);
  const getEmailColetivo = (doc: GenericDoc) =>
    get(doc, ["emailContato", "email"]);
  const getTelefoneColetivo = (doc: GenericDoc) =>
    get(doc, ["telefoneCelular", "telefone"]);

  const getNomeEspaco = (doc: GenericDoc) =>
    get(doc, [
      "entidadeCultural.nomeEntidadeCultural",
      "representacao.nomeSocial",
    ]);
  const getEmailEspaco = (doc: GenericDoc) =>
    get(doc, ["entidadeCultural.emailEntidadeCultural", "representacao.email"]);
  const getTelefoneEspaco = (doc: GenericDoc) =>
    get(doc, ["entidadeCultural.dddTelefone", "representacao.dddTelefone"]);

  const Table = ({
    title,
    rows,
    getNome,
    getEmail,
    getTelefone,
  }: {
    title: string;
    rows: GenericDoc[];
    getNome: (d: GenericDoc) => string | undefined;
    getEmail: (d: GenericDoc) => string | undefined;
    getTelefone: (d: GenericDoc) => string | undefined;
  }) => (
    <section className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
      <h4 className="text-lg font-bold mb-4">{title}</h4>
      {rows.length === 0 ? (
        <div className="text-slate-500">Nenhum registro encontrado.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-2 text-left border-b">Nome</th>
                <th className="px-4 py-2 text-left border-b">E-mail</th>
                <th className="px-4 py-2 text-left border-b">Telefone</th>
                <th className="px-4 py-2 text-left border-b">ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((doc) => (
                <tr key={doc.id} className="even:bg-gray-100 odd:bg-white">
                  <td className="px-4 py-2 border-b">{getNome(doc) || "—"}</td>
                  <td className="px-4 py-2 border-b">{getEmail(doc) || "—"}</td>
                  <td className="px-4 py-2 border-b">
                    {getTelefone(doc) || "—"}
                  </td>
                  <td className="px-4 py-2 border-b text-xs text-slate-500">
                    {doc.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">Dados de Mapeamento</h3>
        <div className="text-slate-600 dark:text-slate-300 mb-4">
          Cidade selecionada:{" "}
          <span className="font-semibold">{cityId || "—"}</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="px-4 py-2 rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            Agentes: <span className="font-bold">{counts.agentes}</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            Coletivos: <span className="font-bold">{counts.coletivos}</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
            Espaços: <span className="font-bold">{counts.espacos}</span>
          </div>
        </div>
      </div>

      {state.loading && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
          Carregando...
        </div>
      )}
      {state.error && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg text-error-600">
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && (
        <>
          <Table
            title="Agentes"
            rows={agentes}
            getNome={getNomeAgente}
            getEmail={getEmailAgente}
            getTelefone={getTelefoneAgente}
          />
          <Table
            title="Coletivos sem CNPJ"
            rows={coletivos}
            getNome={getNomeColetivo}
            getEmail={getEmailColetivo}
            getTelefone={getTelefoneColetivo}
          />
          <Table
            title="Espaços Culturais"
            rows={espacos}
            getNome={getNomeEspaco}
            getEmail={getEmailEspaco}
            getTelefone={getTelefoneEspaco}
          />
        </>
      )}
    </div>
  );
}
