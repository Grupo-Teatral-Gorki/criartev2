import React from "react";
import Button from "./Button";
import { ProjectTypesType } from "../utils/interfaces";

interface Props extends ProjectTypesType {
  onClick: () => void;
}

const TypeProjectCard = ({ available, description, label, onClick }: Props) => {
  return (
    <div className="bg-slate-200 rounded-lg flex flex-col gap-3 w-full p-4 justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-slate-100 font-semibold text-3xl">{label}</h3>
        {available && (
          <div className="bg-green-700 text-white rounded-lg p-2">
            Disponível
          </div>
        )}
        {!available && (
          <div className="bg-red-700 text-white rounded-lg p-2">
            Indisponível
          </div>
        )}
      </div>
      <p className="text-slate-700 dark:text-slate-300 text-lg px-4">{description}</p>
      <Button label={"Selecionar"} size="medium" onClick={onClick} />
    </div>
  );
};

export default TypeProjectCard;
