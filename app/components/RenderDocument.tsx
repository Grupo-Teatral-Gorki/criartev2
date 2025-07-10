// components/RenderDocuments.tsx
import React from "react";

interface Document {
  name: string;
  url: string;
}

interface ProjectProps {
  project: {
    projectDocs?: Document[]; // Make optional for safety
  };
}

const RenderDocuments: React.FC<ProjectProps> = ({ project }) => {
  return (
    <>
      {Array.isArray(project?.projectDocs) && project.projectDocs.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 gap-8">
          {project.projectDocs.map((doc) => (
            <div
              key={doc.name}
              className="flex flex-col items-center p-4 rounded-lg"
            >
              <p className="text-xl font-bold mb-8 text-white">{doc.name}</p>
              <iframe
                src={doc.url}
                width="100%"
                height="600px"
                className="rounded shadow"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-5 text-white text-center">
          Nenhum documento disponível.
        </p>
      )}
    </>
  );
};

export default RenderDocuments;
