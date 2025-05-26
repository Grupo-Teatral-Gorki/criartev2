// components/RenderProject.tsx
interface ProjectProps {
  project: {
    projectTitle: string;
    generalInfo: Record<string, any>;
  };
}

const RenderProject: React.FC<ProjectProps> = ({ project }) => (
  <div>
    <div className="flex flex-col gap-4">
      <p className="text-xl font-bold mt-4 text-white ">Dados do Projeto</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {project.generalInfo &&
          Object.entries(project.generalInfo).map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col bg-white dark:bg-primary p-2 rounded"
            >
              <p className="font-bold">{key}</p>
              <p>{String(value)}</p>
            </div>
          ))}
        {!project.generalInfo && (
          <div className="flex flex-col p-2 rounded">
            <p className="font-bold">
              Nenhum dado disponível para este projeto, siga para as outras abas
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default RenderProject;
