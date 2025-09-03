"use client";

import React, { useState, useMemo } from "react";

type GenericDoc = { id: string; [key: string]: any };

interface EspacosTabProps {
  espacos: GenericDoc[];
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

const getNomeEspaco = (doc: GenericDoc) =>
  get(doc, [
    "nomeCompleto",
    "entidadeCultural.nomeEntidadeCultural",
    "representacao.nomeSocial",
  ]);
const getEmailEspaco = (doc: GenericDoc) =>
  get(doc, ["entidadeCultural.emailEntidadeCultural", "representacao.email"]);
const getTelefoneEspaco = (doc: GenericDoc) =>
  get(doc, ["entidadeCultural.dddTelefone", "representacao.dddTelefone"]);

export default function EspacosTab({ espacos, loading, error }: EspacosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredEspacos = useMemo(() => {
    if (!searchTerm.trim()) return espacos;
    
    return espacos.filter((doc) => {
      const nome = getNomeEspaco(doc)?.toLowerCase() || "";
      const email = getEmailEspaco(doc)?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      
      return nome.includes(search) || email.includes(search);
    });
  }, [espacos, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        Carregando espaços culturais...
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
        <h4 className="text-lg font-bold">Espaços Culturais</h4>
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
      {filteredEspacos.length === 0 ? (
        <div className="text-slate-500">
          {searchTerm ? "Nenhum espaço cultural encontrado para a busca." : "Nenhum espaço cultural encontrado."}
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
              {filteredEspacos.map((doc) => {
                // Log each document being displayed
                console.log('Espaço Cultural:', doc);
                
                return (
                  <tr key={doc.id} className="even:bg-gray-100 odd:bg-white">
                    <td className="px-4 py-2 border-b">{getNomeEspaco(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">{getEmailEspaco(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">
                      {getTelefoneEspaco(doc) || "—"}
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
