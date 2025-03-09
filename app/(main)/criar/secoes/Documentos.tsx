import Button from "@/app/components/Button";
import UploadFiles from "@/app/components/UploadFiles";
import React, { useState } from "react";

const Documentos = () => {
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  const files = [
    {
      name: "doc-photo-id-1",
      label: "Cópia digitalizada de um único documento com foto...",
      required: true,
    },
    {
      name: "proof-address-pontal-2",
      label: "Comprovante de endereço há, pelo menos, 2 anos...",
      required: true,
    },
    {
      name: "proof-address-current-3",
      label: "Comprovante de endereço atual, datado a partir de junho de 2024.",
      required: true,
    },
    {
      name: "self-declaration-residence-4",
      label: "Autodeclaração de residência (Anexo II).",
    },
    {
      name: "curriculum-proponente",
      label: "Currículo do proponente",
      required: true,
    },
    {
      name: "curriculum-portfolio-collective",
      label: "Currículo ou portfólio de Coletivo ou idealizador",
      required: true,
    },
    {
      name: "technical-sheet-participants",
      label: "Ficha técnica com a relação dos participantes...",
      required: true,
    },
    {
      name: "commitment-terms",
      label:
        "Termos de Compromissos assinados pelos principais integrantes do projeto (Anexo V)",
      required: true,
    },
    {
      name: "copyright-declaration",
      label: "Declaração de opção de cessão de direitos autorais...",
      required: true,
    },
    {
      name: "execution-schedule",
      label: "Cronograma de execução",
      required: true,
    },
    {
      name: "additional-information",
      label: "Demais informações",
      required: true,
    },
    {
      name: "ethnic-declaration",
      label:
        "Quando for o caso inserir Declaração Étnico-racial (Anexo VII)...",
    },
    {
      name: "representation-declaration",
      label:
        "Declaração de representação, se for um coletivo sem CNPJ (Anexo VI)",
    },
    {
      name: "other-documents",
      label: "Outros documentos que o agente cultural julgar necessário...",
    },
  ];

  const handleFileChange = (name: string, files: File[]) => {
    setSelectedFiles((prev) => ({ ...prev, [name]: files }));
  };

  const handleUpload = async () => {
    console.log("Uploading files:", selectedFiles);
  };

  return (
    <div className="flex flex-col mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2">
        {files.map((file) => (
          <UploadFiles
            key={file.name}
            name={file.name}
            label={file.label}
            onFilesChange={(files) => handleFileChange(file.name, files)}
          />
        ))}
      </div>
      <div className="max-w-80">
        <Button
          variant="inverted"
          label={"Enviar"}
          onClick={handleUpload}
          disabled={Object.keys(selectedFiles).length === 0}
        />
      </div>
    </div>
  );
};

export default Documentos;
