// components/RenderBudget.tsx
import React from "react";
import SecureIframe from "./SecureIframe";

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
        <div 
          className="w-full h-[500px] border rounded shadow relative overflow-hidden budget-viewer"
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
            src={`${doc}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=100&disableprint=true`}
            width="100%"
            height="100%"
            className="border-none rounded secure-iframe"
            title="Planilha Orçamentária"
            onLoad={() => console.log('Budget loaded')}
            onError={() => console.error('Budget failed to load')}
            onContextMenu={(e) => e.preventDefault()}
          />
          {/* Transparent overlay to block interactions */}
          <div 
            className="absolute inset-0 pointer-events-none"
            onContextMenu={(e) => e.preventDefault()}
            style={{ zIndex: 5 }}
          />
          
          <style jsx>{`
            .budget-viewer {
              position: relative;
            }
            
            .secure-iframe {
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              user-select: none;
            }
            
            /* Hide PDF viewer controls */
            .budget-viewer iframe {
              pointer-events: auto;
            }
            
            /* Block printing and downloading via CSS */
            @media print {
              .budget-viewer {
                display: none !important;
              }
            }
            
            /* Additional security - hide common PDF toolbar elements */
            .budget-viewer::after {
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
      ) : (
        <p className="text-white">Nenhuma planilha orçamentária disponível.</p>
      )}
    </div>
  );
};

export default RenderBudget;
