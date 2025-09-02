import React from "react";
import { Info } from "lucide-react";

interface TermsAndConditionsProps {
  onClose: () => void;
}

const TermsAndConditions = ({ onClose }: TermsAndConditionsProps) => {
  return (
    <div className="p-6">
      <h2 className="text-left text-xl font-bold text-slate-900 dark:text-slate-100">
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
          className="bg-gradient-to-r from-success-600 to-success-700 hover:from-success-700 hover:to-success-800 text-white px-4 py-2 rounded-xl shadow-soft hover:shadow-soft-lg transition-all duration-200 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-success-500 focus:ring-offset-2"
          onClick={onClose}
        >
          ACEITAR
        </button>
      </div>
    </div>
  );
};

export default TermsAndConditions;
