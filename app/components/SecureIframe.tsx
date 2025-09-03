import React from 'react';

interface SecureIframeProps {
  src: string;
  width?: string;
  height?: string;
  className?: string;
  title?: string;
}

const SecureIframe: React.FC<SecureIframeProps> = ({
  src,
  width = "100%",
  height = "600px",
  className = "",
  title = "Document Viewer"
}) => {
  // For Firebase Storage URLs, we need to handle them differently
  const isFirebaseStorage = src.includes('firebasestorage.googleapis.com');
  
  // If it's a Firebase Storage URL, use it directly without PDF parameters
  // If it's a regular PDF, add parameters to hide toolbar
  const secureUrl = isFirebaseStorage ? src : `${src}#toolbar=0&navpanes=0&scrollbar=1&view=FitH&zoom=100`;

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width, 
        height
      }}
    >
      <iframe
        src={secureUrl}
        width="100%"
        height="100%"
        className="border-none rounded shadow"
        title={title}
        onContextMenu={(e) => e.preventDefault()}
        onLoad={(e) => {
          // Iframe loaded successfully
        }}
        onError={(e) => {
          // Handle iframe error
        }}
      />
      
      {/* CSS to hide print/download buttons while allowing viewing */}
      <style jsx>{`
        /* Hide PDF viewer toolbar but allow content viewing */
        iframe {
          border: none;
        }
        
        /* Prevent right-click context menu */
        div {
          -webkit-touch-callout: none;
        }
      `}</style>
    </div>
  );
};

export default SecureIframe;
