"use client";
import React, { ChangeEvent } from "react";
import { useLogging } from "../hooks/useLogging";

interface ProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (newImageFile: File) => void;
}

const ProfileImageUpload: React.FC<ProfileImageModalProps> = ({
  isOpen,
  onClose,
  onImageUpload,
}) => {
  const loggingService = useLogging();

  if (!isOpen) return null;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Log profile image upload attempt
      await loggingService.logFileUploadAttempt(file.name, {
        fileSize: file.size,
        fileType: file.type,
        component: "ProfileImageUpload"
      });

      try {
        onImageUpload(file);
        // Log successful profile image upload
        await loggingService.logFileUploadSuccess(file.name, {
          fileSize: file.size,
          fileType: file.type,
          uploadType: "profile_image"
        });
        onClose();
      } catch (error) {
        // Log profile image upload failure
        await loggingService.logFileUploadFailure(
          file.name, 
          "Profile image upload failed", 
          { error: error instanceof Error ? error.message : "Unknown error" }
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-1/3">
        <h2 className="text-xl font-semibold mb-4">Nova Imagem de Perfil</h2>
        <input type="file" onChange={handleFileChange} accept="image/*" />
        <div className="mt-4 flex justify-between">
          <button
            className="px-4 py-2 bg-red-500 text-white rounded"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileImageUpload;
