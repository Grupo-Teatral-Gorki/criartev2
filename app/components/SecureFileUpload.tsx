"use client";

import { useState, useRef } from 'react';
import SecurityService from '../services/securityService';
import SecurityMonitoringService from '../services/securityMonitoringService';
import { useSecureAuth } from '../hooks/useSecureAuth';

interface SecureFileUploadProps {
  onFileUpload: (file: File) => Promise<void>;
  allowedTypes?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
  className?: string;
}

export default function SecureFileUpload({
  onFileUpload,
  allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
  maxSizeMB = 10,
  multiple = false,
  className = ''
}: SecureFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const securityService = SecurityService.getInstance();
  const securityMonitoring = SecurityMonitoringService.getInstance();
  const { user } = useSecureAuth();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Security validations
        if (!securityService.validateFileType(file, allowedTypes)) {
          throw new Error(`File type not allowed: ${file.type}`);
        }

        if (!securityService.validateFileSize(file, maxSizeMB)) {
          throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
        }

        // Additional security checks
        await validateFileContent(file);

        // Log file upload attempt
        await securityMonitoring.logFileUpload(
          user?.uid || 'anonymous',
          file.name,
          file.size
        );

        // Process the file
        await onFileUpload(file);
      }

      // Clear the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setError(errorMessage);
      
      // Log security event for failed upload
      await securityMonitoring.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        userId: user?.uid,
        details: {
          action: 'file_upload_failed',
          error: errorMessage,
          filename: files[0]?.name
        }
      });
    } finally {
      setUploading(false);
    }
  };

  const validateFileContent = async (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(content);
        
        // Check file signatures (magic numbers)
        const signatures = {
          'image/jpeg': [0xFF, 0xD8, 0xFF],
          'image/png': [0x89, 0x50, 0x4E, 0x47],
          'application/pdf': [0x25, 0x50, 0x44, 0x46]
        };

        const fileSignature = signatures[file.type as keyof typeof signatures];
        if (fileSignature) {
          const matches = fileSignature.every((byte, index) => bytes[index] === byte);
          if (!matches) {
            reject(new Error('File content does not match declared type'));
            return;
          }
        }

        // Check for suspicious patterns in file content
        const contentStr = String.fromCharCode.apply(null, Array.from(bytes.slice(0, 1024)));
        const suspiciousPatterns = [
          /<script/i,
          /javascript:/i,
          /vbscript:/i,
          /onload=/i,
          /onerror=/i
        ];

        for (const pattern of suspiciousPatterns) {
          if (pattern.test(contentStr)) {
            reject(new Error('Suspicious content detected in file'));
            return;
          }
        }

        resolve();
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file.slice(0, 2048)); // Read first 2KB for validation
    });
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        multiple={multiple}
        accept={allowedTypes.join(',')}
        disabled={uploading}
        className="hidden"
        id="secure-file-upload"
      />
      
      <label
        htmlFor="secure-file-upload"
        className={`
          inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium
          ${uploading 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }
        `}
      >
        {uploading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            Choose Files
          </>
        )}
      </label>

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}

      <div className="mt-1 text-xs text-gray-500">
        Max size: {maxSizeMB}MB. Allowed types: {allowedTypes.map(type => type.split('/')[1]).join(', ')}
      </div>
    </div>
  );
}
