"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type FileContextType = {
  selectedFiles: { [key: string]: File[] };
  setSelectedFiles: (files: { [key: string]: File[] }) => void;
};

const FileContext = createContext<FileContextType | undefined>(undefined);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  return (
    <FileContext.Provider value={{ selectedFiles, setSelectedFiles }}>
      {children}
    </FileContext.Provider>
  );
};

export const useFileContext = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFileContext must be used within a FileProvider");
  }
  return context;
};
