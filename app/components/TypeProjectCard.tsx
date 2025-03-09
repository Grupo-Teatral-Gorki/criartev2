import React from "react";
import Button from "./Button";

interface TypeProjectCardType {
  type: string;
  description: string;
  available?: boolean;
  onClick: () => void;
}

const TypeProjectCard = ({
  type,
  description,
  available = true,
  onClick,
}: TypeProjectCardType) => {
  return (
    <div className="bg-slate-200 rounded-lg flex flex-col gap-3 w-full p-4 justify-between">
      <div className="flex items-center justify-between">
        <h3 className="dark:text-primary font-semibold text-3xl">{type}</h3>
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
      <p className="dark:text-primary text-lg px-4">{description}</p>
      <Button label={"Selecionar"} size="medium" onClick={onClick} />
    </div>
  );
};

export default TypeProjectCard;
