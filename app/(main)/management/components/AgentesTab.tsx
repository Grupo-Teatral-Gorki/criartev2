"use client";

import React, { useState, useMemo } from "react";

type GenericDoc = { id: string; [key: string]: any };

interface AgentesTabProps {
  agentes: GenericDoc[];
  loading: boolean;
  error: string | null;
}

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
  get(doc, ["nomeCompleto", "nomeSocial", "nome", "representacao.nomeSocial"]);
const getEmailAgente = (doc: GenericDoc) => get(doc, ["email"]);
const getTelefoneAgente = (doc: GenericDoc) =>
  get(doc, ["dddTelefone", "telefone", "phone"]);

export default function AgentesTab({ agentes, loading, error }: AgentesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAgentes = useMemo(() => {
    if (!searchTerm.trim()) return agentes;
    
    return agentes.filter((doc) => {
      const nome = getNomeAgente(doc)?.toLowerCase() || "";
      const email = getEmailAgente(doc)?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      
      return nome.includes(search) || email.includes(search);
    });
  }, [agentes, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        Carregando agentes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg text-error-600">
        {error}
      </div>
    );
  }

  return (
    <section className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h4 className="text-lg font-bold">Agentes</h4>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-800 dark:border-slate-600 dark:text-white w-full sm:w-80"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {filteredAgentes.length === 0 ? (
        <div className="text-slate-500">
          {searchTerm ? "Nenhum agente encontrado para a busca." : "Nenhum agente encontrado."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead className="bg-navy text-white">
              <tr>
                <th className="px-4 py-2 text-left border-b">Nome</th>
                <th className="px-4 py-2 text-left border-b">E-mail</th>
                <th className="px-4 py-2 text-left border-b">Telefone</th>
              </tr>
            </thead>
            <tbody>
              {filteredAgentes.map((doc) => {
                return (
                  <tr key={doc.id} className="even:bg-gray-100 odd:bg-white">
                    <td className="px-4 py-2 border-b">{getNomeAgente(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">{getEmailAgente(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">
                      {getTelefoneAgente(doc) || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
