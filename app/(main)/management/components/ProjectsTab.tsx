"use client";

import React from "react";
import { useRouter } from "next/navigation";

export type ProjectsTabProject = {
  projectId: string;
  projectTitle: string;
  registrationNumber: string;
  proponentId: string;
  proponentName?: string;
  projectStatus?: string;
  projectType?: string;
};

type ProjectsTabProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredProjects: ProjectsTabProject[];
  paginatedProjects: ProjectsTabProject[];
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (size: number) => void;
  selectedCityId: string | null;
};

export default function ProjectsTab({
  searchTerm,
  setSearchTerm,
  filteredProjects,
  paginatedProjects,
  currentPage,
  totalPages,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  selectedCityId,
}: ProjectsTabProps) {
  const router = useRouter();

  return (
    <>
      {/* Single Search Bar */}
      <div className="flex flex-row gap-4 px-6 mt-4">
        <input
          type="text"
          placeholder="Buscar por Proponente, Projeto ou Nº de Registro"
          className="border rounded px-2 py-1 w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto p-6 bg-primary dark:bg-navy rounded-lg shadow-lg">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-navy text-white">
            <tr>
              <th className="px-4 py-2 text-left border-b">
                Título do Projeto
              </th>
              <th className="px-4 py-2 text-left border-b">Status</th>
              <th className="px-4 py-2 text-left border-b">
                Número de Registro
              </th>
              <th className="px-4 py-2 text-left border-b">Proponente</th>
              <th className="px-4 py-2 text-left border-b">Tipo</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  {selectedCityId
                    ? `Nenhum projeto encontrado para a cidade (ID: ${selectedCityId})`
                    : "Carregando projetos..."}
                </td>
              </tr>
            ) : (
              paginatedProjects.map((project) => (
                <tr
                  key={project.projectId}
                  className="hover:bg-primary hover:text-slate-400 cursor-pointer even:bg-gray-100 odd:bg-white text-navy"
                  onClick={() =>
                    router.push(`/admin/review/${project.projectId}`)
                  }
                >
                  <td className="px-4 py-2 border-b">{project.projectTitle}</td>
                  <td className="px-4 py-2 border-b">
                    {project.projectStatus}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {project.registrationNumber}
                  </td>
                  <td className="px-4 py-2 border-b">
                    {project.proponentName}
                  </td>
                  <td className="px-4 py-2 border-b">{project.projectType}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredProjects.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </button>
              <div className="text-sm px-2">
                Página {currentPage} de {totalPages}
              </div>
              <button
                className="px-3 py-1.5 rounded bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Próxima
              </button>
              <select
                className="ml-2 border rounded px-2 py-1 text-sm"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size} por página
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
