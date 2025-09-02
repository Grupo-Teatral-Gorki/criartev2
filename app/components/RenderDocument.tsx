// components/RenderDocuments.tsx
import React from "react";
import SecureIframe from "./SecureIframe";

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
              <div 
                className="w-full h-[600px] border rounded shadow relative overflow-hidden document-viewer"
                onContextMenu={(e) => e.preventDefault()}
                onDragStart={(e) => e.preventDefault()}
                onKeyDown={(e) => {
                  // Block Ctrl+S (Save As), Ctrl+P (Print), Ctrl+A (Select All)
                  if (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'a')) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                  // Block F12 (Dev Tools), Ctrl+Shift+I (Dev Tools)
                  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
                tabIndex={0}
              >
                <iframe
                  src={`${doc.url}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=100&disableprint=true`}
                  width="100%"
                  height="100%"
                  className="border-none rounded secure-iframe"
                  title={`Document: ${doc.name}`}
                  onLoad={() => console.log('Document loaded:', doc.name)}
                  onError={() => console.error('Document failed to load:', doc.name)}
                  onContextMenu={(e) => e.preventDefault()}
                />
                {/* Transparent overlay to block interactions */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  onContextMenu={(e) => e.preventDefault()}
                  style={{ zIndex: 5 }}
                />
                
                <style jsx>{`
                  .document-viewer {
                    position: relative;
                  }
                  
                  .secure-iframe {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                  }
                  
                  /* Block right-click on entire container */
                  .document-viewer {
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                  }
                  
                  .document-viewer * {
                    -webkit-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                  }
                  
                  /* Hide PDF viewer controls */
                  .document-viewer iframe {
                    pointer-events: auto;
                  }
                  
                  /* Block printing and downloading via CSS */
                  @media print {
                    .document-viewer {
                      display: none !important;
                    }
                  }
                  
                  /* Additional security - hide common PDF toolbar elements */
                  .document-viewer::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: transparent;
                    z-index: 10;
                    pointer-events: none;
                  }
                `}</style>
              </div>
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
