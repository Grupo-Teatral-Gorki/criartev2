"use client";

import Button from "@/app/components/Button";
import { useEffect } from "react";

export default function CriarError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error in /criar route:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-xl border border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20 p-6">
        <h2 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          Ocorreu um erro inesperado ao carregar esta etapa.
        </h2>
        <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-4">
          Tente recarregar esta seção. Se o erro persistir, volte para selecionar o tipo de projeto e entre novamente.
        </p>
        <div className="flex justify-end">
          <Button label="Tentar novamente" size="medium" onClick={() => reset()} />
        </div>
      </div>
    </div>
  );
}
