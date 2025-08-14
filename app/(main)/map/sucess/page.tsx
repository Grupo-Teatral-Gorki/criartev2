import Link from "next/link";
import React from "react";

const Success = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      {" "}
      <h2 className="text-3xl mt-24">Cadastro realizado com sucesso!</h2>
      <Link
        href="/"
        className="w-[5rem] flex items-center justify-center p-2 bg-buttonBg text-white rounded hover:bg-buttonHover"
      >
        Voltar
      </Link>
    </div>
  );
};

export default Success;
