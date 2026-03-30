// components/RenderProject.tsx
interface FichaTecnicaItem {
  nome: string;
  cargo: string;
  cpf: string;
}

interface ProjectProps {
  project: {
    projectTitle: string;
    projectType?: string;
    registrationNumber?: string;
    projectStatus?: string;
    generalInfo?: Record<string, any>;
    fichaTecnica?: FichaTecnicaItem[];
    [key: string]: any;
  };
}

const formatFieldName = (key: string): string => {
  // Remove __outro suffix and format key to readable label
  const cleanKey = key.replace(/__outro$/, " (Outro)");
  return cleanKey
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === "true") return "Sim";
  if (value === "false") return "Não";
  return String(value) || "-";
};

const RenderProject: React.FC<ProjectProps> = ({ project }) => {
  const hasGeneralInfo = project.generalInfo && Object.keys(project.generalInfo).length > 0;
  const hasFichaTecnica = project.fichaTecnica && project.fichaTecnica.length > 0;
  const hasAnyData = hasGeneralInfo || hasFichaTecnica;

  return (
    <div className="w-full p-4">
      {/* Project Basic Info */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
          Informações Básicas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <p className="text-sm text-slate-500 dark:text-slate-400">Título</p>
            <p className="font-semibold text-slate-900 dark:text-slate-100">{project.projectTitle || "-"}</p>
          </div>
          {project.registrationNumber && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Nº de Inscrição</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{project.registrationNumber}</p>
            </div>
          )}
          {project.projectType && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Tipo</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{project.projectType}</p>
            </div>
          )}
          {project.projectStatus && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
              <p className="font-semibold text-slate-900 dark:text-slate-100 capitalize">{project.projectStatus}</p>
            </div>
          )}
        </div>
      </div>

      {/* General Info Section */}
      {hasGeneralInfo && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
            Informações Gerais
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(project.generalInfo!).map(([key, value]) => (
              <div
                key={key}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
              >
                <p className="text-sm text-slate-500 dark:text-slate-400">{formatFieldName(key)}</p>
                <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap">
                  {formatValue(value)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ficha Técnica Section */}
      {hasFichaTecnica && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
            Ficha Técnica
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200/50 dark:border-slate-700/50">
            <table className="w-full bg-white dark:bg-slate-800">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Cargo</th>
                  <th className="text-left p-3 text-sm font-semibold text-slate-700 dark:text-slate-300">CPF</th>
                </tr>
              </thead>
              <tbody>
                {project.fichaTecnica!.map((item, index) => (
                  <tr key={index} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="p-3 text-slate-900 dark:text-slate-100">{item.nome || "-"}</td>
                    <td className="p-3 text-slate-900 dark:text-slate-100">{item.cargo || "-"}</td>
                    <td className="p-3 text-slate-900 dark:text-slate-100 font-mono text-sm">{item.cpf || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data Message */}
      {!hasAnyData && (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p className="font-medium">
            Nenhum dado disponível para este projeto, siga para as outras abas
          </p>
        </div>
      )}
    </div>
  );
};

export default RenderProject;
