"use client";

import { useState, useEffect } from "react";
import ProponenteService, { ProponenteData } from "@/app/services/proponenteService";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";
import Link from "next/link";
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, Building2, Users, FileText } from "lucide-react";
import { useParams } from "next/navigation";
import { getFieldLabel, getSectionLabel, getValueLabel, formatValue } from "@/app/utils/proponenteLabels";

export default function ProponenteDetailPage() {
    const { theme } = useTheme();
    const params = useParams();
    const cityCode = params.cityCode as string;
    const id = params.id as string;

    const [proponente, setProponente] = useState<ProponenteData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            loadProponente();
        }
    }, [id]);

    const loadProponente = async () => {
        try {
            setLoading(true);
            setError(null);
            const service = ProponenteService.getInstance();
            const data = await service.getProponenteById(id);
            if (data) {
                setProponente(data);
            } else {
                setError("Proponente não encontrado.");
            }
        } catch (err) {
            console.error("Error loading proponente:", err);
            setError("Erro ao carregar proponente. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const getTipoLabel = (tipo: string) => {
        switch (tipo) {
            case 'fisica':
                return 'Pessoa Física';
            case 'juridica':
                return 'Pessoa Jurídica';
            case 'coletivo':
                return 'Coletivo';
            default:
                return tipo;
        }
    };

    const formatDate = (date: any) => {
        if (!date) return 'N/A';
        if (date.toDate) {
            return date.toDate().toLocaleDateString('pt-BR');
        }
        if (typeof date === 'string') {
            return new Date(date).toLocaleDateString('pt-BR');
        }
        return 'N/A';
    };

    const renderSection = (title: string, data: any, icon: React.ReactNode, sectionKey?: string) => {
        if (!data || Object.keys(data).length === 0) return null;

        return (
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-soft border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(data).map(([key, value]) => {
                        // Skip empty values and internal fields
                        if (value === null || value === undefined || value === '' || key.startsWith('_')) return null;

                        // Get the proper label for the field
                        const fieldLabel = getFieldLabel(key, proponente?.tipo);

                        // Get the display value with proper labels
                        let displayValue: string;

                        // For strings, booleans, and arrays, try to get option labels
                        if (typeof value === 'string' || typeof value === 'boolean' || Array.isArray(value)) {
                            displayValue = getValueLabel(key, value);
                        } else {
                            // For other types (dates, objects), use formatValue
                            displayValue = formatValue(value, key);
                        }

                        return (
                            <div key={key} className="space-y-1">
                                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {fieldLabel}
                                </p>
                                <p className="text-sm text-slate-900 dark:text-white break-words whitespace-pre-wrap">
                                    {displayValue}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderProponenteData = () => {
        if (!proponente) return null;

        const sections = [];

        // Basic Info
        sections.push(
            <div key="basic" className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-soft border border-white/20 dark:border-slate-700/50">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/30">
                        <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Informações Básicas</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Tipo</p>
                        <p className="text-sm text-slate-900 dark:text-white">{getTipoLabel(proponente.tipo)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">E-mail do Usuário</p>
                        <p className="text-sm text-slate-900 dark:text-white">{proponente.userEmail}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Data de Cadastro</p>
                        <p className="text-sm text-slate-900 dark:text-white">{formatDate(proponente.createdAt)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Última Atualização</p>
                        <p className="text-sm text-slate-900 dark:text-white">{formatDate(proponente.updatedAt)}</p>
                    </div>
                </div>
            </div>
        );

        // Type-specific data
        if (proponente.tipo === 'fisica') {
            if (proponente.dadosPessoais) {
                sections.push(renderSection(getSectionLabel('dadosPessoais'), proponente.dadosPessoais, <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'dadosPessoais'));
            }
        } else if (proponente.tipo === 'juridica') {
            if (proponente.dadosPessoaJuridica || proponente.dadosPJ) {
                const data = proponente.dadosPessoaJuridica || proponente.dadosPJ;
                sections.push(renderSection(getSectionLabel('dadosPJ'), data, <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'dadosPJ'));
            }
        } else if (proponente.tipo === 'coletivo') {
            if (proponente.dadosColetivo) {
                sections.push(renderSection(getSectionLabel('dadosColetivo'), proponente.dadosColetivo, <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'dadosColetivo'));
            }
        }

        // Common sections
        if (proponente.contato) {
            sections.push(renderSection(getSectionLabel('contato'), proponente.contato, <Phone className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'contato'));
        }

        if (proponente.endereco) {
            sections.push(renderSection(getSectionLabel('endereco'), proponente.endereco, <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'endereco'));
        }

        if (proponente.responsavel) {
            sections.push(renderSection(getSectionLabel('responsavel'), proponente.responsavel, <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'responsavel'));
        }

        if (proponente.enderecoResponsavel) {
            sections.push(renderSection(getSectionLabel('enderecoResponsavel'), proponente.enderecoResponsavel, <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'enderecoResponsavel'));
        }

        if (proponente.enderecoPessoaJuridica) {
            sections.push(renderSection(getSectionLabel('enderecoPessoaJuridica'), proponente.enderecoPessoaJuridica, <MapPin className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'enderecoPessoaJuridica'));
        }

        // Handle nested sections in perfilDoProponente
        if (proponente.perfilDoProponente) {
            if (typeof proponente.perfilDoProponente === 'object') {
                Object.entries(proponente.perfilDoProponente).forEach(([key, value]) => {
                    if (value && typeof value === 'object') {
                        sections.push(renderSection(getSectionLabel(key), value, <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />, key));
                    }
                });
            }
        }

        // Handle nested sections in perfilPessoaJuridica
        if (proponente.perfilPessoaJuridica) {
            if (typeof proponente.perfilPessoaJuridica === 'object') {
                Object.entries(proponente.perfilPessoaJuridica).forEach(([key, value]) => {
                    if (value && typeof value === 'object') {
                        sections.push(renderSection(getSectionLabel(key), value, <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />, key));
                    }
                });
            }
        }

        // Handle nested sections in perfilDoResponsavel
        if (proponente.perfilDoResponsavel) {
            if (typeof proponente.perfilDoResponsavel === 'object') {
                Object.entries(proponente.perfilDoResponsavel).forEach(([key, value]) => {
                    if (value && typeof value === 'object') {
                        sections.push(renderSection(getSectionLabel(key), value, <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />, key));
                    }
                });
            }
        }

        if (proponente.documentos) {
            sections.push(renderSection(getSectionLabel('documentos'), proponente.documentos, <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />, 'documentos'));
        }

        // Render any other fields that might exist
        const renderedKeys = new Set([
            'id', 'tipo', 'userId', 'userEmail', 'cityId', 'createdAt', 'updatedAt',
            'dadosPessoais', 'dadosPessoaJuridica', 'dadosPJ', 'dadosColetivo', 'contato', 'endereco',
            'responsavel', 'enderecoResponsavel', 'enderecoPessoaJuridica',
            'perfilDoProponente', 'perfilPessoaJuridica', 'perfilDoResponsavel',
            'informacoesDemograficas', 'experiencia', 'documentos'
        ]);

        const otherData: any = {};
        Object.entries(proponente).forEach(([key, value]) => {
            if (!renderedKeys.has(key) && value && typeof value === 'object') {
                otherData[key] = value;
            }
        });

        if (Object.keys(otherData).length > 0) {
            Object.entries(otherData).forEach(([key, value]) => {
                sections.push(renderSection(
                    getSectionLabel(key),
                    value,
                    <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />,
                    key
                ));
            });
        }

        return sections;
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

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Carregando dados do proponente...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-soft border border-white/20 dark:border-slate-700/50 max-w-2xl mx-auto">
                            <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
                            <button
                                onClick={loadProponente}
                                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02]"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                ) : proponente ? (
                    <>
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                Detalhes do Proponente
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                {getTipoLabel(proponente.tipo)}
                            </p>
                        </div>

                        {/* Data Sections */}
                        <div className="space-y-6">
                            {renderProponenteData()}
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
