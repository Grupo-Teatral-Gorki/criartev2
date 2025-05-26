// components/RenderDocuments.tsx
interface Document {
  name: string;
  url: string;
}

interface ProjectProps {
  project: {
    projectDocs: Document[];
  };
}

const RenderDocuments: React.FC<ProjectProps> = ({ project }) => (
  <div className="mt-5 grid grid-cols-2 gap-8 ">
    {project.projectDocs.map((doc) => (
      <div key={doc.name} className="flex flex-col items-center p-4 rounded-lg">
        <p className="text-xl font-bold mb-8">{doc.name}</p>
        <iframe
          src={doc.url}
          width="100%"
          height="600px"
          className="rounded shadow"
        />
      </div>
    ))}
  </div>
);

export default RenderDocuments;
