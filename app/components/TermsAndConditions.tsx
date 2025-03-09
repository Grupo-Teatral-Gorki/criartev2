import React from "react";
import { Info } from "lucide-react";

interface TermsAndConditionsProps {
  onClose: () => void;
}

const TermsAndConditions = ({ onClose }: TermsAndConditionsProps) => {
  return (
    <div className="p-6">
      <h2 className="text-left text-xl font-bold text-primary">
        Aceitação de termos
      </h2>
      <div className="bg-blue-100 p-4 rounded-lg flex flex-col items-center text-center mt-4">
        <Info className="text-blue-500 w-6 h-6 mb-2" />
        <p className="text-gray-700">
          Ao aceitar, você concorda que o Criarte e suas empresas parceiras,
          assim como outras organizações que colaboram para o funcionamento da
          plataforma, possam gerenciar e acessar todos os dados inseridos sempre
          que necessário.
        </p>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className="bg-green-500 hover:bg-green-300 text-white hover:text-primary px-4 py-2 rounded-md"
          onClick={onClose}
        >
          ACEITAR
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
