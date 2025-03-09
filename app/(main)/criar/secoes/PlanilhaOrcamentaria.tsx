/* eslint-disable @typescript-eslint/no-unused-vars */
import { onSubmit } from "@/app/actions/upload";
import Button from "@/app/components/Button";
import UploadFiles from "@/app/components/UploadFiles";
import React, { useState } from "react";

const PlanilhaOrcamentaria = () => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  const files = [
    {
      name: "planilha-orcamentaria",
      label: "Planilha Orçamentária",
      required: true,
    },
  ];

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  const handleUpload = async () => {
    console.log("Uploading files:", selectedFiles);
  };

  return (
    <form action={onSubmit}>
      <input type="file" name="file" />
      <input type="submit" value="Upload" />
    </form>
  );
};

export default PlanilhaOrcamentaria;
