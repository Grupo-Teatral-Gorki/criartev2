"use client";
import { useState, useEffect, useRef } from "react";
import { PDFDocument } from "pdf-lib"; // Import for PDF compression
import { useLogging } from "../hooks/useLogging";

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  label: string;
  name: string;
}

export default function FileUploader({
  onFilesChange,
  label,
  name,
}: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const loggingService = useLogging();
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_TYPES = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ];

  const handleFiles = async (newFiles: FileList | null) => {
    if (!newFiles) return;

    const processedFiles = await Promise.all(
      Array.from(newFiles).map(async (file) => {
        // Log upload attempt for each file
        await loggingService.logFileUploadAttempt(file.name, {
          fileSize: file.size,
          fileType: file.type,
          component: name
        });

        if (!ALLOWED_TYPES.includes(file.type)) {
          // Log failure due to unsupported file type
          await loggingService.logFileUploadFailure(
            file.name, 
            "Unsupported file type", 
            { fileType: file.type, allowedTypes: ALLOWED_TYPES }
          );
          alert(
            `"${file.name}" is not a supported file type. Only images and PDFs are allowed.`
          );
          return null;
        }
        if (file.size > MAX_FILE_SIZE) {
          if (file.type.startsWith("image/")) {
            try {
              const compressedFile = await compressImage(file);
              await loggingService.logFileUploadSuccess(file.name, {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionType: "image"
              });
              return compressedFile;
            } catch (error) {
              await loggingService.logFileUploadFailure(
                file.name, 
                "Image compression failed", 
                { error: error instanceof Error ? error.message : "Unknown error" }
              );
              return null;
            }
          } else if (file.type === "application/pdf") {
            try {
              const compressedFile = await compressPDF(file);
              await loggingService.logFileUploadSuccess(file.name, {
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionType: "pdf"
              });
              return compressedFile;
            } catch (error) {
              await loggingService.logFileUploadFailure(
                file.name, 
                "PDF compression failed", 
                { error: error instanceof Error ? error.message : "Unknown error" }
              );
              return null;
            }
          } else {
            await loggingService.logFileUploadFailure(
              file.name, 
              "File too large and cannot be compressed", 
              { fileSize: file.size, maxSize: MAX_FILE_SIZE }
            );
            alert(
              `"${file.name}" is too large (max 2MB) and cannot be uploaded.`
            );
            return null;
          }
        }
        
        // Log successful upload for files that don't need compression
        await loggingService.logFileUploadSuccess(file.name, {
          fileSize: file.size,
          fileType: file.type
        });
        return file;
      })
    );

    const validFiles = processedFiles.filter(
      (file): file is File => file !== null
    );

    setFiles((prevFiles) => [...prevFiles, ...validFiles]);
  };

  // Sync files state with parent component via useEffect to avoid setState during render
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    onFilesChange(files);
  }, [files]);

  const handleDrop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-primary/5');
    handleFiles(event.dataTransfer.files);
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(file);

          let width = img.width;
          let height = img.height;
          const maxSize = 1920; // Resize to fit within 1920x1920

          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height *= maxSize / width;
              width = maxSize;
            } else {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < MAX_FILE_SIZE) {
                resolve(new File([blob], file.name, { type: file.type }));
              } else {
                resolve(file); // Return original if compression fails
              }
            },
            file.type,
            0.7 // Compression quality (adjust if needed)
          );
        };
      };
    });
  };

  const compressPDF = async (file: File): Promise<File> => {
    try {
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pdfBytesCompressed = await pdfDoc.save({ useObjectStreams: false });

      return new File([pdfBytesCompressed as BlobPart], file.name, {
        type: "application/pdf",
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      return file;
    }
  };

  return (
    <div className="w-full">
      {/* Drag-and-Drop Area */}
      <label
        htmlFor={`fileInput-${name}`}
        className="group border-2 border-dashed border-gray-200 dark:border-slate-600 rounded-lg p-4 flex items-center justify-center gap-3 text-gray-500 dark:text-gray-400 cursor-pointer hover:border-primary hover:bg-primary/5 dark:hover:border-primary dark:hover:bg-primary/10 transition-all duration-200"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add('border-primary', 'bg-primary/5');
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
        }}
        onDrop={handleDrop}
      >
        <svg className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <span className="text-sm font-medium group-hover:text-primary transition-colors">{label}</span>
        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(", ")}
          className="hidden"
          id={`fileInput-${name}`}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <div className="mt-2 space-y-1">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-md text-sm"
            >
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-green-700 dark:text-green-300 truncate flex-1">{file.name}</span>
              <span className="text-green-600 dark:text-green-400 text-xs">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
