import React from 'react';
import { BaseDocument, FieldExtractor } from '../types/mapping.types';

interface DataTableProps<T extends BaseDocument> {
  data: T[];
  fieldExtractor: FieldExtractor<T>;
  emptyMessage?: string;
}

/**
 * Generic reusable data table component
 * Implements DRY principle and generic typing for type safety
 */
export const DataTable = <T extends BaseDocument>({
  data,
  fieldExtractor,
  emptyMessage = "Nenhum registro encontrado."
}: DataTableProps<T>) => {
  if (data.length === 0) {
    return (
      <div className="text-slate-500 text-center py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
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
          {data.map((doc) => (
            <tr key={doc.id} className="even:bg-gray-100 odd:bg-white hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 border-b">
                {fieldExtractor.getName(doc) || "—"}
              </td>
              <td className="px-4 py-2 border-b">
                {fieldExtractor.getEmail(doc) || "—"}
              </td>
              <td className="px-4 py-2 border-b">
                {fieldExtractor.getPhone(doc) || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
