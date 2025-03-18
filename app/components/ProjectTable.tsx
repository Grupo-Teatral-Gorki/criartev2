import { useRouter } from "next/navigation";
import React from "react";

interface Project {
  numeroInscricao: string;
  nomeProjeto: string;
  proponente: string;
}

interface ProjectTableProps {
  data: Project[];
}

const ProjectTable: React.FC<ProjectTableProps> = ({ data }) => {
  const router = useRouter();

  const handleClick = (id: string) => {
    router.push(`/gestao/avaliar/${id}`);
  };
  return (
    <div className="overflow-y-auto shadow-lg rounded-lg bg-primary p-4 max-h-screen">
      <table className="min-w-full table-auto">
        <thead className="sticky top-0 bg-primary z-10">
          <tr className="text-white">
            <th className="px-4 py-2">Número Inscrição</th>
            <th className="px-4 py-2">Nome Projeto</th>
            <th className="px-4 py-2">Proponente</th>
            <th className="px-4 py-2">Ação</th>
          </tr>
        </thead>
        <tbody className="max-h-[calc(100vh-900px)] overflow-y-auto">
          {data.map((item, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-blue-100" : "bg-white"}
            >
              <td className="px-4 py-2">{item.numeroInscricao}</td>
              <td className="px-4 py-2">{item.nomeProjeto}</td>
              <td className="px-4 py-2">{item.proponente}</td>
              <td className="px-4 py-2">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={() => handleClick(item.numeroInscricao)}
                >
                  Avaliar Projeto
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;
