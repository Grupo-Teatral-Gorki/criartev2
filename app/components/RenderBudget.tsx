// components/RenderBudget.tsx
interface ProjectProps {
  project: {
    planilhaOrcamentaria: string[];
  };
}

const RenderBudget: React.FC<ProjectProps> = ({ project }) => {
  const doc = project.planilhaOrcamentaria[0];
  return (
    <div className="mt-5 flex flex-col items-center justify-center w-full">
      <h2 className="text-2xl font-bold mb-4">Planilha Orçamentária</h2>
      <iframe
        src={doc}
        className="min-h-[500px] w-full border-none rounded shadow"
      />
    </div>
  );
};

export default RenderBudget;
