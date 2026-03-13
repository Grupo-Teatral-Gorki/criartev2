"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Button from "@/app/components/Button";
import { useAuth } from "@/app/context/AuthContext";

type PoliticaDadosClientProps = {
  policyContent: string;
  policyVersion: string;
};

export default function PoliticaDadosClient({
  policyContent,
  policyVersion,
}: PoliticaDadosClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dbUser, acceptDataPolicy } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const returnTo = useMemo(() => {
    const param = searchParams.get("returnTo");
    if (!param || !param.startsWith("/")) return "/home";
    return param;
  }, [searchParams]);

  const alreadyAccepted = Boolean(
    dbUser?.dataPolicyAccepted && dbUser?.dataPolicyAcceptedAt
  );

  const handleAccept = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      await acceptDataPolicy();
      router.replace(returnTo);
    } catch {
      setError("Não foi possível registrar seu aceite. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-soft p-6 md:p-8 space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
          Política de Dados
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Para continuar usando a plataforma, você precisa aceitar nossa política de dados.
        </p>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/30 p-4 space-y-3">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
            Versão da política: {policyVersion}
          </p>

          <article
            className="max-h-[55vh] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 p-4 text-slate-800 dark:text-slate-100
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4
            [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-6 [&_h2]:mb-3
            [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
            [&_p]:leading-7 [&_p]:mb-4
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-2
            [&_strong]:font-semibold"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{policyContent}</ReactMarkdown>
          </article>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Se preferir, abra em tela cheia: <a href="/legal/data-policy" target="_blank" rel="noreferrer" className="underline">/legal/data-policy</a>
          </p>
        </div>

        {alreadyAccepted ? (
          <div className="space-y-3">
            <p className="text-sm text-green-700 dark:text-green-300">
              Sua conta já possui aceite registrado para esta política.
            </p>
            <div className="flex justify-end">
              <Button
                label="Continuar"
                size="medium"
                onClick={() => router.replace(returnTo)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {error && (
              <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
            )}
            <div className="flex justify-end">
              <Button
                label={isSubmitting ? "Registrando aceite..." : "Li e aceito a política"}
                size="medium"
                onClick={handleAccept}
                disabled={isSubmitting}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
