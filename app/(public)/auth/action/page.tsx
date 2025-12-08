"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { auth } from "@/app/config/firebaseconfig";
import {
    verifyPasswordResetCode,
    confirmPasswordReset,
    applyActionCode
} from "firebase/auth";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";

export default function AuthActionPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { theme } = useTheme();

    const [mode, setMode] = useState<string | null>(null);
    const [actionCode, setActionCode] = useState<string | null>(null);
    const [email, setEmail] = useState<string>("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const modeParam = searchParams.get("mode");
        const codeParam = searchParams.get("oobCode");

        setMode(modeParam);
        setActionCode(codeParam);

        if (modeParam === "resetPassword" && codeParam) {
            verifyResetCode(codeParam);
        } else if (modeParam === "verifyEmail" && codeParam) {
            handleVerifyEmail(codeParam);
        } else {
            setLoading(false);
            setError("Link inválido ou expirado.");
        }
    }, [searchParams]);

    const verifyResetCode = async (code: string) => {
        try {
            const userEmail = await verifyPasswordResetCode(auth, code);
            setEmail(userEmail);
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            setError("Este link de redefinição de senha é inválido ou expirou.");
        }
    };

    const handleVerifyEmail = async (code: string) => {
        try {
            await applyActionCode(auth, code);
            setSuccess(true);
            setLoading(false);
            setTimeout(() => router.push("/"), 3000);
        } catch (error: any) {
            setLoading(false);
            setError("Erro ao verificar email. O link pode estar expirado.");
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        if (newPassword.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }

        if (!actionCode) {
            setError("Código de ação inválido.");
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            await confirmPasswordReset(auth, actionCode, newPassword);
            setSuccess(true);
            setTimeout(() => router.push("/"), 3000);
        } catch (error: any) {
            setError("Erro ao redefinir senha. Tente novamente.");
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Verificando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-accent-100/20 dark:from-primary-900/10 dark:to-accent-900/10"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            <div className="relative z-10 p-8 rounded-3xl shadow-soft-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 w-full max-w-md animate-fade-in-up">
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20">
                        <Image
                            src={
                                theme === "dark"
                                    ? "https://firebasestorage.googleapis.com/v0/b/itapevi-cce4e.firebasestorage.app/o/criarte.png?alt=media&token=09310b4d-9035-406a-bc7c-4611d51190c5"
                                    : "https://firebasestorage.googleapis.com/v0/b/itapevi-cce4e.firebasestorage.app/o/criarte_black.png?alt=media&token=cc531c98-6652-4a2d-9499-19b50ea70b0f"
                            }
                            alt="Logo Criarte"
                            width={120}
                            height={40}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Success State */}
                {success && (
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                                <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {mode === "verifyEmail" ? "Email Verificado!" : "Senha Redefinida!"}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-4">
                            {mode === "verifyEmail"
                                ? "Seu email foi verificado com sucesso."
                                : "Sua senha foi alterada com sucesso."}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-500">
                            Redirecionando para a página de login...
                        </p>
                    </div>
                )}

                {/* Error State */}
                {error && !success && (
                    <div className="text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30">
                                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Erro
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {error}
                        </p>
                        <button
                            onClick={() => router.push("/")}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200"
                        >
                            Voltar ao Login
                        </button>
                    </div>
                )}

                {/* Password Reset Form */}
                {mode === "resetPassword" && !success && !error && (
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 text-center">
                            Redefinir Senha
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 text-center">
                            Digite sua nova senha para {email}
                        </p>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Digite sua nova senha"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Confirmar Senha
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    placeholder="Confirme sua nova senha"
                                    required
                                    minLength={6}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02] focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                {processing ? "Redefinindo..." : "Redefinir Senha"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
