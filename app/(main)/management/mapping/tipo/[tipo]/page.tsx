"use client";

import { useState, useEffect } from "react";
import ProponenteService, { ProponenteData } from "@/app/services/proponenteService";
import Link from "next/link";
import { ArrowLeft, Mail, User } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCity } from "@/app/context/CityConfigContext";

export default function ProponentesByTypePage() {
    const router = useRouter();
    const params = useParams();
    const { city } = useCity();
    const cityId = city?.cityId;
    const tipo = params.tipo as 'fisica' | 'juridica' | 'coletivo';

    const [proponentes, setProponentes] = useState<ProponenteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (cityId && tipo) {
            loadProponentes();
        }
    }, [cityId, tipo]);

    const loadProponentes = async () => {
        if (!cityId) return;

        try {
            setLoading(true);
            setError(null);
            const service = ProponenteService.getInstance();
            const data = await service.getProponentesByCityAndType(cityId, tipo);
            setProponentes(data);
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

    if (!cityId) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12">
                    <p className="text-center text-slate-600 dark:text-slate-400">
                        Nenhuma cidade selecionada. Por favor, selecione uma cidade primeiro.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
            {/* Back Button */}
            <div className="mb-4 md:mb-6">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all text-sm md:text-base"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar
                </button>
            </div>

            {/* Title */}
            <div className="text-center mb-6 md:mb-8">
                <h1 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2">
                    {getTipoLabel()} - {city?.name}
                </h1>
                <p className="text-base md:text-lg text-slate-600 dark:text-slate-400">
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
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
                        <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
                        <button
                            onClick={loadProponentes}
                            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl transition-all"
                        >
                            Tentar novamente
                        </button>
                    </div>
                </div>
            ) : proponentes.length === 0 ? (
                <div className="text-center py-20">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12 max-w-2xl mx-auto">
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Nenhum proponente do tipo {getTipoLabel()} cadastrado nesta cidade.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-100 dark:bg-slate-800">
                                <tr>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                        Nome
                                    </th>
                                    <th className="hidden md:table-cell px-6 py-4 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                        E-mail
                                    </th>
                                    <th className="px-3 md:px-6 py-3 md:py-4 text-left text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {proponentes.map((proponente) => (
                                    <tr
                                        key={proponente.id}
                                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                    >
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                                                <div className="hidden md:block p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                                                    <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                                                </div>
                                                <div>
                                                    <span className="text-xs md:text-sm font-medium text-slate-900 dark:text-white block">
                                                        {getProponenteName(proponente)}
                                                    </span>
                                                    <span className="md:hidden text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                        <Mail className="w-3 h-3" />
                                                        {getProponenteEmail(proponente)}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                                    {getProponenteEmail(proponente)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 md:px-6 py-3 md:py-4">
                                            <Link
                                                href={`/management/mapping/proponente/${proponente.id}`}
                                                className="inline-flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-xs md:text-sm font-medium rounded-lg transition-all whitespace-nowrap"
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
    );
}
