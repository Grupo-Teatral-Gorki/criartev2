"use client";
import { useState } from "react";
import { PDFDocument } from "pdf-lib"; // Import for PDF compression

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
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(
            `"${file.name}" is not a supported file type. Only images and PDFs are allowed.`
          );
          return null;
        }
        if (file.size > MAX_FILE_SIZE) {
          if (file.type.startsWith("image/")) {
            return await compressImage(file);
          } else if (file.type === "application/pdf") {
            return await compressPDF(file);
          } else {
            alert(
              `"${file.name}" is too large (max 2MB) and cannot be uploaded.`
            );
            return null;
          }
        }
        return file;
      })
    );

    const validFiles = processedFiles.filter(
      (file): file is File => file !== null
    );

    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles, ...validFiles];
      onFilesChange(updatedFiles);
      return updatedFiles;
    });
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
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

      return new File([pdfBytesCompressed], file.name, {
        type: "application/pdf",
      });
    } catch (error) {
      console.error("Error compressing PDF:", error);
      return file;
    }
  };

  return (
    <div className="w-full mx-auto p-4">
      {/* Drag-and-Drop Area */}
      <div
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-gray-600 dark:text-gray-300 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <p className="text-center whitespace-normal break-words">{label}</p>

        <input
          type="file"
          multiple
          accept={ALLOWED_TYPES.join(", ")}
          className="hidden"
          id={`fileInput-${name}`}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label
          htmlFor={`fileInput-${name}`}
          className="mt-2 px-4 py-2 bg-[#1d4a5d] text-white rounded cursor-pointer hover:bg-[#173b4a] transition"
        >
          Escolher Arquivo
        </label>
      </div>

      {/* Uploaded Files List */}
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, index) => (
            <li
              key={index}
              className="text-gray-800 dark:text-gray-200 text-sm"
            >
              📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
