"use client";

import { useState, useEffect } from "react";
import ProponenteService, { CityStatistics } from "@/app/services/proponenteService";
import Link from "next/link";
import { Users, Building2, UserCircle, UsersRound, Eye } from "lucide-react";

interface ProponentesTabProps {
    cityId: string;
    loading: boolean;
    error: string | null;
}

export default function ProponentesTab({ cityId, loading, error }: ProponentesTabProps) {
    const [statistics, setStatistics] = useState<CityStatistics | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);
    const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);
    const [hoveredZonaSlice, setHoveredZonaSlice] = useState<string | null>(null);

    useEffect(() => {
        if (cityId) {
            loadStatistics();
        }
    }, [cityId]);

    const loadStatistics = async () => {
        try {
            setLoadingStats(true);
            const service = ProponenteService.getInstance();
            const data = await service.getCityStatistics(cityId);
            setStatistics(data);
        } catch (err) {
            console.error("Error loading statistics:", err);
        } finally {
            setLoadingStats(false);
        }
    };

    if (loading || loadingStats) {
        return (
            <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Carregando proponentes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12">
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
            </div>
        );
    }

    if (!statistics) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-12">
                <p className="text-slate-600 dark:text-slate-400 text-center">Nenhum dado disponível.</p>
            </div>
        );
    }

    const zonaStats = statistics.zonas ?? {
        zona_sul: 0,
        zona_norte: 0,
        zona_leste: 0,
        zona_oeste: 0,
        zona_central: 0,
        nao_informada: 0
    };

    const zonaDistribution = [
        { key: 'zona_sul', label: 'Zona Sul', value: zonaStats.zona_sul, color: '#10b981', hoverColor: '#22c55e' },
        { key: 'zona_norte', label: 'Zona Norte', value: zonaStats.zona_norte, color: '#0ea5e9', hoverColor: '#38bdf8' },
        { key: 'zona_leste', label: 'Zona Leste', value: zonaStats.zona_leste, color: '#f59e0b', hoverColor: '#fbbf24' },
        { key: 'zona_oeste', label: 'Zona Oeste', value: zonaStats.zona_oeste, color: '#d946ef', hoverColor: '#e879f9' },
        { key: 'zona_central', label: 'Zona Central', value: zonaStats.zona_central, color: '#6366f1', hoverColor: '#818cf8' },
        { key: 'nao_informada', label: 'Não informada', value: zonaStats.nao_informada, color: '#64748b', hoverColor: '#94a3b8' }
    ];

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 md:p-6">
                <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Visualizar Proponentes
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Clique em qualquer tipo de proponente abaixo para ver a lista completa com nomes e e-mails.
                            Você pode então visualizar os detalhes completos de cada proponente.
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Left Column - Summary Cards */}
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col items-center text-center gap-1 md:gap-2">
                            <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                                <Users className="w-5 h-5 md:w-6 md:h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 mb-1">Total de Proponentes</p>
                                <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{statistics.totalProponentes}</p>
                            </div>
                        </div>
                    </div>

                    <Link href={`/management/mapping/tipo/fisica`} className="block">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 transition-all cursor-pointer h-full">
                            <div className="flex flex-col items-center text-center gap-1 md:gap-2">
                                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                                    <UserCircle className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 mb-1">Pessoa Física</p>
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{statistics.fisica}</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href={`/management/mapping/tipo/juridica`} className="block">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-pointer h-full">
                            <div className="flex flex-col items-center text-center gap-1 md:gap-2">
                                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                    <Building2 className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 mb-1">Pessoa Jurídica</p>
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{statistics.juridica}</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href={`/management/mapping/tipo/coletivo`} className="block">
                        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-3 md:p-4 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 transition-all cursor-pointer h-full">
                            <div className="flex flex-col items-center text-center gap-1 md:gap-2">
                                <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                    <UsersRound className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400 mb-1">Coletivo</p>
                                    <p className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{statistics.coletivo}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Right Column - Pie Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Distribuição por Tipo</h2>

                    {statistics.totalProponentes > 0 ? (
                        <div className="flex flex-col items-center relative">
                            {/* Pie Chart SVG */}
                            <div className="relative">
                                <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64 mb-4 md:mb-6">
                                    {(() => {
                                        const total = statistics.totalProponentes;
                                        const fisicaPercent = (statistics.fisica / total) * 100;
                                        const juridicaPercent = (statistics.juridica / total) * 100;
                                        const coletivoPercent = (statistics.coletivo / total) * 100;

                                        let currentAngle = -90; // Start at top
                                        const radius = 80;
                                        const centerX = 100;
                                        const centerY = 100;

                                        const createSlice = (percent: number, color: string, hoverColor: string, label: string, count: number) => {
                                            const angle = (percent / 100) * 360;
                                            const startAngle = currentAngle;
                                            const endAngle = currentAngle + angle;

                                            const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                                            const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                                            const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                                            const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                                            const largeArc = angle > 180 ? 1 : 0;

                                            const path = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;

                                            currentAngle = endAngle;

                                            const isHovered = hoveredSlice === label;

                                            return (
                                                <g key={label}>
                                                    <path
                                                        d={path}
                                                        fill={isHovered ? hoverColor : color}
                                                        stroke="white"
                                                        strokeWidth="2"
                                                        className="md:cursor-pointer transition-all duration-200"
                                                        style={{ filter: isHovered ? 'brightness(1.1)' : 'none' }}
                                                        onMouseEnter={() => setHoveredSlice(label)}
                                                        onMouseLeave={() => setHoveredSlice(null)}
                                                    />
                                                </g>
                                            );
                                        };

                                        return (
                                            <>
                                                {statistics.fisica > 0 && createSlice(fisicaPercent, '#10b981', '#22c55e', 'Pessoa Física', statistics.fisica)}
                                                {statistics.juridica > 0 && createSlice(juridicaPercent, '#3b82f6', '#60a5fa', 'Pessoa Jurídica', statistics.juridica)}
                                                {statistics.coletivo > 0 && createSlice(coletivoPercent, '#a855f7', '#c084fc', 'Coletivo', statistics.coletivo)}
                                            </>
                                        );
                                    })()}
                                </svg>

                                {/* Tooltip - Desktop only */}
                                {hoveredSlice && (
                                    <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg shadow-lg pointer-events-none z-10">
                                        <div className="text-center">
                                            <p className="font-semibold text-sm">{hoveredSlice}</p>
                                            <p className="text-xs">
                                                {hoveredSlice === 'Pessoa Física' && `${statistics.fisica} (${Math.round((statistics.fisica / statistics.totalProponentes) * 100)}%)`}
                                                {hoveredSlice === 'Pessoa Jurídica' && `${statistics.juridica} (${Math.round((statistics.juridica / statistics.totalProponentes) * 100)}%)`}
                                                {hoveredSlice === 'Coletivo' && `${statistics.coletivo} (${Math.round((statistics.coletivo / statistics.totalProponentes) * 100)}%)`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend - Always visible on mobile, visible on desktop too */}
                            <div className="space-y-2 w-full">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-500"></div>
                                        <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Física</span>
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                        {statistics.fisica} ({Math.round((statistics.fisica / statistics.totalProponentes) * 100)}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-blue-500"></div>
                                        <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Jurídica</span>
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                        {statistics.juridica} ({Math.round((statistics.juridica / statistics.totalProponentes) * 100)}%)
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-purple-500"></div>
                                        <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">Coletivo</span>
                                    </div>
                                    <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                        {statistics.coletivo} ({Math.round((statistics.coletivo / statistics.totalProponentes) * 100)}%)
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                            Nenhum proponente cadastrado nesta cidade ainda.
                        </p>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 md:p-6 border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Distribuição por Zona</h2>

                {statistics.totalProponentes > 0 ? (
                    <div className="flex flex-col items-center relative">
                        <div className="relative">
                            <svg viewBox="0 0 200 200" className="w-48 h-48 md:w-64 md:h-64 mb-4 md:mb-6">
                                {(() => {
                                    const total = statistics.totalProponentes;
                                    let currentAngle = -90;
                                    const radius = 80;
                                    const centerX = 100;
                                    const centerY = 100;

                                    const createSlice = (
                                        percent: number,
                                        color: string,
                                        hoverColor: string,
                                        label: string
                                    ) => {
                                        const angle = (percent / 100) * 360;
                                        const startAngle = currentAngle;
                                        const endAngle = currentAngle + angle;

                                        const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
                                        const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
                                        const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
                                        const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

                                        const largeArc = angle > 180 ? 1 : 0;

                                        const path = `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY} Z`;

                                        currentAngle = endAngle;

                                        const isHovered = hoveredZonaSlice === label;

                                        return (
                                            <g key={label}>
                                                <path
                                                    d={path}
                                                    fill={isHovered ? hoverColor : color}
                                                    stroke="white"
                                                    strokeWidth="2"
                                                    className="md:cursor-pointer transition-all duration-200"
                                                    style={{ filter: isHovered ? 'brightness(1.1)' : 'none' }}
                                                    onMouseEnter={() => setHoveredZonaSlice(label)}
                                                    onMouseLeave={() => setHoveredZonaSlice(null)}
                                                />
                                            </g>
                                        );
                                    };

                                    return (
                                        <>
                                            {zonaDistribution
                                                .filter((zona) => zona.value > 0)
                                                .map((zona) => createSlice((zona.value / total) * 100, zona.color, zona.hoverColor, zona.label))}
                                        </>
                                    );
                                })()}
                            </svg>

                            {hoveredZonaSlice && (
                                <div className="hidden md:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg shadow-lg pointer-events-none z-10">
                                    <div className="text-center">
                                        <p className="font-semibold text-sm">{hoveredZonaSlice}</p>
                                        <p className="text-xs">
                                            {(() => {
                                                const zona = zonaDistribution.find((item) => item.label === hoveredZonaSlice);
                                                if (!zona) return '';

                                                const percent = Math.round((zona.value / statistics.totalProponentes) * 100);
                                                return `${zona.value} (${percent}%)`;
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 w-full">
                            {zonaDistribution.map((zona) => {
                                const percent = Math.round((zona.value / statistics.totalProponentes) * 100);

                                return (
                                    <div key={zona.key} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 md:w-4 md:h-4 rounded" style={{ backgroundColor: zona.color }}></div>
                                            <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{zona.label}</span>
                                        </div>
                                        <span className="text-xs md:text-sm font-semibold text-slate-900 dark:text-white">
                                            {zona.value} ({percent}%)
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                        Nenhum proponente cadastrado nesta cidade ainda.
                    </p>
                )}
            </div>
        </div>
    );
}
