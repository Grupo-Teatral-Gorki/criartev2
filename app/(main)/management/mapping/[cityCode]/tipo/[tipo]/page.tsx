"use client";

import { useState, useEffect } from "react";
import ProponenteService, { ProponenteData } from "@/app/services/proponenteService";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";
import Link from "next/link";
import { ArrowLeft, Mail, User } from "lucide-react";
import { useParams } from "next/navigation";

export default function ProponentesByTypePage() {
    const { theme } = useTheme();
    const params = useParams();
    const cityCode = params.cityCode as string;
    const tipo = params.tipo as 'fisica' | 'juridica' | 'coletivo';

    const [proponentes, setProponentes] = useState<ProponenteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cityName, setCityName] = useState<string>("");

    useEffect(() => {
        if (cityCode && tipo) {
            loadProponentes();
        }
    }, [cityCode, tipo]);

    const loadProponentes = async () => {
        try {
            setLoading(true);
            setError(null);
            const service = ProponenteService.getInstance();
            const data = await service.getProponentesByCityAndType(cityCode, tipo);
            setProponentes(data);

            // Get city name
            const stats = await service.getCityStatistics(cityCode);
            if (stats) {
                setCityName(stats.cityName);
            }
        } catch (err) {
            console.error("Error loading proponentes:", err);
            setError("Erro ao carregar proponentes. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const getTipoLabel = () => {
        switch (tipo) {
            case 'fisica':
                return 'Pessoa Física';
            case 'juridica':
                return 'Pessoa Jurídica';
            case 'coletivo':
                return 'Coletivo';
            default:
                return '';
        }
    };

    const getProponenteName = (proponente: ProponenteData) => {
        if (tipo === 'fisica') {
            return proponente.dadosPessoais?.nomeCompleto || proponente.dadosPessoais?.nomeSocial || 'Nome não disponível';
        } else if (tipo === 'juridica') {
            return proponente.dadosPessoaJuridica?.razaoSocial || proponente.dadosPessoaJuridica?.nomeFantasia || 'Nome não disponível';
        } else {
            return proponente.dadosColetivo?.nomeColetivo || proponente.dadosColetivo?.nome || 'Nome não disponível';
        }
    };

    const getProponenteEmail = (proponente: ProponenteData) => {
        return proponente.userEmail || 'Email não disponível';
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-accent-100/20 dark:from-primary-900/10 dark:to-accent-900/10"></div>
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            {/* Logo */}
            <div className="relative z-10 pt-8 pb-4">
                <div className="flex justify-center">
                    <Link href="/">
                        <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-soft border border-white/20 dark:border-slate-700/50">
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
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Back Button */}
                <div className="mb-6">
                    <Link
                        href={`/management/mapping/${cityCode}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-soft hover:shadow-soft-lg"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para mapeamento
                    </Link>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        {getTipoLabel()} - {cityName}
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">
                        {proponentes.length} {proponentes.length === 1 ? 'proponente cadastrado' : 'proponentes cadastrados'}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Carregando proponentes...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-soft border border-white/20 dark:border-slate-700/50 max-w-2xl mx-auto">
                            <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
                            <button
                                onClick={loadProponentes}
                                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02]"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                ) : proponentes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-soft border border-white/20 dark:border-slate-700/50 max-w-2xl mx-auto">
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                Nenhum proponente do tipo {getTipoLabel()} cadastrado nesta cidade.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-soft border border-white/20 dark:border-slate-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-100 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                            Nome
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                            E-mail
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                            Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {proponentes.map((proponente) => (
                                        <tr
                                            key={proponente.id}
                                            className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                                        <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                        {getProponenteName(proponente)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                                        {getProponenteEmail(proponente)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/management/mapping/${cityCode}/proponente/${proponente.id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-medium rounded-lg shadow-soft transition-all hover:shadow-soft-lg hover:scale-[1.02]"
                                                >
                                                    Ver detalhes
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
