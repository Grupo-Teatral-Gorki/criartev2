"use client";

import { useState } from "react";
import { TextInput } from "./TextInput";
import InputError from "./InputError";
import { auth } from "../config/firebaseconfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import LoggingService from "../services/loggingService";

interface ForgotPasswordFormProps {
    onBack: () => void;
}

export default function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        const loggingService = LoggingService.getInstance();

        try {
            // Send password reset email
            await sendPasswordResetEmail(auth, email);

            // Log password reset request
            loggingService.setCurrentUser(email);
            await loggingService.logAction('recuperacao_senha', {
                email,
                timestamp: new Date().toISOString()
            });

            setSuccess(true);
            setEmail("");
        } catch (error: any) {
            // Log failed password reset attempt
            await loggingService.logAction('recuperacao_senha_falha', {
                email,
                error: error.message || 'Unknown error',
                timestamp: new Date().toISOString()
            });

            if (error.code === 'auth/user-not-found') {
                setError("Nenhuma conta encontrada com este email.");
            } else if (error.code === 'auth/invalid-email') {
                setError("Email inválido.");
            } else {
                setError("Erro ao enviar email de recuperação. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="text-center py-4">
                <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Email Enviado!
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-6">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                        ⚠️ Não encontrou o email?
                    </p>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        <li>• Verifique sua <strong>pasta de spam</strong></li>
                        <li>• Aguarde alguns minutos</li>
                        <li>• Adicione noreply@criarte.com aos contatos</li>
                    </ul>
                </div>
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Login
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-4 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao Login
            </button>

            <div className="mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Recuperar Senha
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Digite seu email e enviaremos um link para redefinir sua senha.
                </p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <TextInput
                            type="email"
                            name="email"
                            placeholder="Digite seu email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10"
                        />
                    </div>
                    {!isLoading && error && <InputError message={error} />}
                </div>

                <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    disabled={isLoading || !email}
                >
                    {isLoading ? "Enviando..." : "Enviar Link de Recuperação"}
                </button>
            </form>
        </div>
    );
}
