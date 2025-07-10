// components/RenderBudget.tsx
import React from "react";

interface ProjectProps {
  project: {
    planilhaOrcamentaria?: string[]; // Made optional for safety
  };
}

const RenderBudget: React.FC<ProjectProps> = ({ project }) => {
  const doc = project.planilhaOrcamentaria?.[0];

  return (
    <div className="mt-5 flex flex-col items-center justify-center w-full">
      <h2 className="text-2xl font-bold mb-4 text-white">
        Planilha Orçamentária
      </h2>
      {doc ? (
        <iframe
          src={doc}
          className="min-h-[500px] w-full border-none rounded shadow"
        />
      ) : (
        <p className="text-white">Nenhuma planilha orçamentária disponível.</p>
      )}
    </div>
  );
};

export default RenderBudget;
