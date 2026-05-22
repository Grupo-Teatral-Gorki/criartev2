"use client";

import React, { useEffect, useRef, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { useAuth } from "@/app/context/AuthContext";
import { useCity } from "@/app/context/CityConfigContext";
import { useRouter } from "next/navigation";
import Button from "@/app/components/Button";
import { SelectInput } from "@/app/components/SelectInput";
import { Send, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Clock, Mail } from "lucide-react";

type EmailStatus = "pending" | "sending" | "success" | "error";

type EmailEntry = {
  email: string;
  status: EmailStatus;
  error?: string;
};

const getBrandedEmailHtml = (bodyContent: string): string => {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1d4a5d, #2563eb); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 22px; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .content p { margin: 0 0 16px 0; }
    .button { display: inline-block; background: #f7a251; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Criarte </h1>
    </div>
    <div class="content">
      ${bodyContent}
      <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/home" class="button">
        Acessar Plataforma
      </a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Criarte </p>
    </div>
  </div>
</body>
</html>`;
};

export default function CommunicationPage() {
  const { dbUser } = useAuth();
  const { city: userCity } = useCity();
  const router = useRouter();

  const [cities, setCities] = useState<{ label: string; value: string }[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [userEmails, setUserEmails] = useState<string[]>([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [sendLog, setSendLog] = useState<EmailEntry[]>([]);

  const logEndRef = useRef<HTMLDivElement>(null);

  const isAdmin =
    Array.isArray(dbUser?.userRole) && dbUser.userRole.includes("admin");

  useEffect(() => {
    if (!isAdmin) return;
    const loadCities = async () => {
      try {
        const snapshot = await getDocs(collection(db, "cities"));
        const list = snapshot.docs
          .map((doc) => ({
            label: `${doc.data().name} - ${doc.data().uf}`,
            value: doc.data().cityId as string,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCities(list);
      } catch (error) {
        console.error("Erro ao buscar cidades:", error);
      }
    };
    loadCities();
  }, [isAdmin]);

  useEffect(() => {
    if (userCity?.cityId && !selectedCityId) {
      setSelectedCityId(userCity.cityId);
    }
  }, [userCity]);

  useEffect(() => {
    if (!selectedCityId) {
      setUserEmails([]);
      return;
    }
    const loadEmails = async () => {
      setLoadingEmails(true);
      try {
        const q = query(
          collection(db, "users"),
          where("cityId", "==", selectedCityId)
        );
        const snapshot = await getDocs(q);
        const emailSet = new Set<string>();
        snapshot.forEach((doc) => {
          const email = doc.data().email;
          if (email && typeof email === "string") emailSet.add(email.trim());
        });
        setUserEmails(Array.from(emailSet).sort((a, b) => a.localeCompare(b)));
      } catch (error) {
        console.error("Erro ao buscar e-mails:", error);
        setUserEmails([]);
      } finally {
        setLoadingEmails(false);
      }
    };
    loadEmails();
  }, [selectedCityId]);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [sendLog]);

  if (!dbUser) return null;
  if (!isAdmin) {
    router.push("/home");
    return null;
  }

  const bodyToHtmlParagraphs = (text: string) =>
    text
      .split(/\n{2,}/)
      .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
      .join("");

  const handleSend = async () => {
    if (!selectedCityId || !subject.trim() || !body.trim() || userEmails.length === 0) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja enviar este e-mail para ${userEmails.length} usuário(s) da cidade selecionada?\n\nAssunto: ${subject}`
    );
    if (!confirmed) return;

    setSending(true);
    const htmlBody = getBrandedEmailHtml(bodyToHtmlParagraphs(body));

    // Initialize log
    const initialLog: EmailEntry[] = userEmails.map((email) => ({
      email,
      status: "pending" as EmailStatus,
    }));
    setSendLog(initialLog);

    for (let i = 0; i < userEmails.length; i++) {
      const email = userEmails[i];

      // Mark as sending
      setSendLog((prev) =>
        prev.map((entry, idx) =>
          idx === i ? { ...entry, status: "sending" } : entry
        )
      );

      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ to: email, subject, html: htmlBody }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          setSendLog((prev) =>
            prev.map((entry, idx) =>
              idx === i
                ? { ...entry, status: "error", error: data.details || data.error || "Erro desconhecido" }
                : entry
            )
          );
        } else {
          setSendLog((prev) =>
            prev.map((entry, idx) =>
              idx === i ? { ...entry, status: "success" } : entry
            )
          );
        }
      } catch (err) {
        setSendLog((prev) =>
          prev.map((entry, idx) =>
            idx === i
              ? { ...entry, status: "error", error: err instanceof Error ? err.message : "Erro de rede" }
              : entry
          )
        );
      }
    }

    setSending(false);
  };

  const canSend = selectedCityId && subject.trim() && body.trim() && !sending && userEmails.length > 0;

  const successCount = sendLog.filter((e) => e.status === "success").length;
  const errorCount = sendLog.filter((e) => e.status === "error").length;
  const pendingCount = sendLog.filter((e) => e.status === "pending" || e.status === "sending").length;
  const progress = sendLog.length > 0 ? ((successCount + errorCount) / sendLog.length) * 100 : 0;

  return (
    <div className="w-full overflow-y-auto flex flex-col px-4 sm:px-8 lg:px-36 pb-12">
      <div className="w-full flex flex-col sm:flex-row items-center gap-4 sm:gap-12 rounded-2xl bg-white/85 dark:bg-slate-800/80 backdrop-blur-xl border border-white/40 dark:border-slate-700/60 shadow-soft p-4 mt-4 mb-6">
        <Button
          label="VOLTAR"
          onClick={() => router.push("/admin")}
          size="medium"
        />
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
          Comunicação
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="flex flex-col gap-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Enviar E-mail
          </h3>

          <SelectInput
            label="Cidade"
            options={cities}
            value={selectedCityId}
            onChange={(e: any) => setSelectedCityId(e.target.value)}
          />

          {selectedCityId && (
            <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-slate-50 dark:bg-slate-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Destinatários
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {loadingEmails
                    ? "Carregando..."
                    : `${userEmails.length} usuário(s)`}
                </span>
              </div>
              {loadingEmails ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={14} className="animate-spin" /> Buscando e-mails...
                </div>
              ) : userEmails.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Nenhum usuário com e-mail encontrado para esta cidade.
                </p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {userEmails.map((email) => (
                    <div
                      key={email}
                      className="text-xs text-slate-600 dark:text-slate-400 font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700"
                    >
                      {email}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Assunto
            </label>
            <input
              type="text"
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              placeholder="Ex: Informativo sobre o edital de fomento"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Corpo do E-mail
            </label>
            <textarea
              className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-y"
              rows={12}
              placeholder="Digite o conteúdo do e-mail aqui. Use linhas em branco para separar parágrafos."
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              O texto será automaticamente formatado com o layout padrão do Criarte. Use linhas em branco para separar parágrafos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowPreview((p) => !p)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {showPreview ? (
                <>
                  <EyeOff size={16} /> Fechar Preview
                </>
              ) : (
                <>
                  <Eye size={16} /> Preview
                </>
              )}
            </button>

            <button
              type="button"
              disabled={!canSend}
              onClick={handleSend}
              className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Enviando...
                </>
              ) : (
                <>
                  <Send size={16} /> Enviar para todos os usuários
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right panel: Preview OR Progress */}
        <div className="flex flex-col gap-6">
          {/* Progress panel — always visible when there's a log */}
          {sendLog.length > 0 && (
            <div className="flex flex-col gap-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Progresso do Envio
              </h3>

              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span>{successCount + errorCount} de {sendLog.length}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {/* Summary counters */}
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                  <CheckCircle2 size={14} />
                  <span className="font-medium">{successCount}</span>
                  <span className="text-slate-500 dark:text-slate-400">enviado(s)</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-500 dark:text-red-400">
                  <XCircle size={14} />
                  <span className="font-medium">{errorCount}</span>
                  <span className="text-slate-500 dark:text-slate-400">erro(s)</span>
                </div>
                {sending && (
                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                    <Clock size={14} />
                    <span className="font-medium">{pendingCount}</span>
                    <span>restante(s)</span>
                  </div>
                )}
              </div>

              {/* Per-email log */}
              <div className="max-h-[400px] overflow-y-auto space-y-1 border border-slate-200 dark:border-slate-700 rounded-lg p-2 bg-slate-50 dark:bg-slate-900/40">
                {sendLog.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 px-2 py-1.5 rounded text-xs font-mono ${
                      entry.status === "success"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : entry.status === "error"
                        ? "bg-red-50 dark:bg-red-900/20"
                        : entry.status === "sending"
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "bg-white dark:bg-slate-800"
                    }`}
                  >
                    <span className="mt-0.5 shrink-0">
                      {entry.status === "success" && <CheckCircle2 size={12} className="text-green-500" />}
                      {entry.status === "error" && <XCircle size={12} className="text-red-500" />}
                      {entry.status === "sending" && <Loader2 size={12} className="text-blue-500 animate-spin" />}
                      {entry.status === "pending" && <Clock size={12} className="text-slate-400" />}
                    </span>
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-700 dark:text-slate-300 truncate">{entry.email}</span>
                      {entry.error && (
                        <span className="text-red-600 dark:text-red-400 break-words">{entry.error}</span>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          )}

          {/* Preview panel */}
          {showPreview && (
            <div className="flex flex-col gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Preview do E-mail
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <iframe
                  srcDoc={getBrandedEmailHtml(
                    bodyToHtmlParagraphs(body || "Seu texto aparecerá aqui...")
                  )}
                  className="w-full h-[500px] bg-white"
                  title="Email Preview"
                />
              </div>
            </div>
          )}

          {/* Empty state for right panel */}
          {sendLog.length === 0 && !showPreview && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft p-12 text-center">
              <Mail size={40} className="text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                O progresso do envio será exibido aqui após iniciar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
