"use client";

import React, { useState, useMemo } from "react";

type GenericDoc = { id: string; [key: string]: any };

interface ColetivosTabProps {
  coletivos: GenericDoc[];
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

const getNomeColetivo = (doc: GenericDoc) =>
  get(doc, ["nomeCompleto", "contatoColetivo", "responsavelColetivo"]);
const getEmailColetivo = (doc: GenericDoc) =>
  get(doc, ["emailContato", "email"]);
const getTelefoneColetivo = (doc: GenericDoc) =>
  get(doc, ["telefoneCelular", "telefone"]);

export default function ColetivosTab({ coletivos, loading, error }: ColetivosTabProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredColetivos = useMemo(() => {
    if (!searchTerm.trim()) return coletivos;
    
    return coletivos.filter((doc) => {
      const nome = getNomeColetivo(doc)?.toLowerCase() || "";
      const email = getEmailColetivo(doc)?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      
      return nome.includes(search) || email.includes(search);
    });
  }, [coletivos, searchTerm]);

  if (loading) {
    return (
      <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
        Carregando coletivos...
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
        <h4 className="text-lg font-bold">Coletivos sem CNPJ</h4>
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
      {filteredColetivos.length === 0 ? (
        <div className="text-slate-500">
          {searchTerm ? "Nenhum coletivo encontrado para a busca." : "Nenhum coletivo encontrado."}
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
              {filteredColetivos.map((doc) => {
                // Log each document being displayed
                console.log('Coletivo:', doc);
                
                return (
                  <tr key={doc.id} className="even:bg-gray-100 odd:bg-white">
                    <td className="px-4 py-2 border-b">{getNomeColetivo(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">{getEmailColetivo(doc) || "—"}</td>
                    <td className="px-4 py-2 border-b">
                      {getTelefoneColetivo(doc) || "—"}
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
