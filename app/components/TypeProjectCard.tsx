import React from "react";
import Button from "./Button";
import { ProjectTypesType } from "../utils/interfaces";

interface Props extends ProjectTypesType {
  onClick: () => void;
  disabled?: boolean;
  disabledReason?: string;
}

const TypeProjectCard = ({
  available,
  description,
  label,
  onClick,
  disabled = false,
  disabledReason,
}: Props) => {
  const isOpen = available !== false && !disabled;

  return (
    <div className="bg-slate-200 dark:bg-slate-700 rounded-lg flex flex-col gap-3 w-full p-4 justify-between">
      <div className="flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white font-semibold text-3xl">{label}</h3>
        {isOpen ? (
          <div className="bg-green-700 text-white rounded-lg p-2">
            Inscrições abertas
          </div>
        ) : (
          <div className="bg-red-700 text-white rounded-lg p-2">
            Inscrições fechadas
          </div>
        )}
      </div>
      <p className="text-slate-700 dark:text-slate-200 text-lg px-4">{description}</p>
      {disabledReason && !isOpen && (
        <p className="text-sm text-red-700 dark:text-red-300 px-4">{disabledReason}</p>
      )}
      <Button
        label={"Selecionar"}
        size="medium"
        onClick={onClick}
        disabled={!isOpen}
      />
    </div>
  );
};

export default TypeProjectCard;
