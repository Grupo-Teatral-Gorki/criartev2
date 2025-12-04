"use client";

import { useState, useEffect } from "react";
import ProponenteService, { CityStatistics, FilterOptions } from "@/app/services/proponenteService";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";
import Link from "next/link";
import { Users, Building2, UserCircle, UsersRound, ArrowLeft, Filter, Download } from "lucide-react";
import { useParams } from "next/navigation";

export default function CityStatisticsPage() {
    const { theme } = useTheme();
    const params = useParams();
    const cityCode = params.cityCode as string;

    const [statistics, setStatistics] = useState<CityStatistics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<FilterOptions>({});
    const [showFilters, setShowFilters] = useState(false);
    const [allProponentes, setAllProponentes] = useState<any[]>([]);
    const [availableBairros, setAvailableBairros] = useState<string[]>([]);

    const loadStatistics = async () => {
        try {
            setLoading(true);
            setError(null);
            const service = ProponenteService.getInstance();

            // Get all proponentes for download
            const allData = await service.getProponentesByCity(cityCode);
            setAllProponentes(allData);

            // Extract unique bairros from the data
            const bairrosSet = new Set<string>();
            allData.forEach((proponente: any) => {
                const bairro = proponente.endereco?.bairro;
                if (bairro && bairro.trim()) {
                    bairrosSet.add(bairro.trim());
                }
            });
            const sortedBairros = Array.from(bairrosSet).sort((a, b) => a.localeCompare(b));
            setAvailableBairros(sortedBairros);

            const data = await service.getCityStatistics(cityCode, filters);
            setStatistics(data);
        } catch (err) {
            console.error("Error loading statistics:", err);
            setError("Erro ao carregar estatísticas. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    const downloadJSON = () => {
        const dataToDownload = {
            city: statistics?.cityName,
            uf: statistics?.cityUF,
            cityId: cityCode,
            filters: filters,
            statistics: statistics,
            proponentes: allProponentes,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `proponentes-${statistics?.cityName || cityCode}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (cityCode) {
            loadStatistics();
        }
    }, [cityCode]);

    const handleFilterChange = (key: keyof FilterOptions, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }));
    };

    const clearFilters = async () => {
        setFilters({});
        // Wait for state to update, then reload
        setTimeout(() => {
            loadStatistics();
        }, 0);
    };

    const hasActiveFilters = Object.values(filters).some(v => v);

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
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
                        <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">Carregando estatísticas...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-soft border border-white/20 dark:border-slate-700/50 max-w-2xl mx-auto">
                            <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
                            <button
                                onClick={loadStatistics}
                                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02]"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    </div>
                ) : statistics ? (
                    <>
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                                {statistics.cityName}{statistics.cityUF ? ` - ${statistics.cityUF}` : ''}
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-400">
                                Estatísticas de Proponentes Cadastrados
                            </p>
                        </div>

                        {/* Filters */}
                        <div className="mb-8">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-soft hover:shadow-soft-lg mx-auto"
                            >
                                <Filter className="w-4 h-4" />
                                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                                {hasActiveFilters && <span className="ml-2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">Ativos</span>}
                            </button>

                            {showFilters && (
                                <div className="mt-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-soft border border-white/20 dark:border-slate-700/50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                        {/* Sexo */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Sexo</label>
                                            <select
                                                value={filters.sexo || ''}
                                                onChange={(e) => handleFilterChange('sexo', e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Todos</option>
                                                <option value="feminino">Feminino</option>
                                                <option value="masculino">Masculino</option>
                                                <option value="sem_declaracao">Sem declaração</option>
                                            </select>
                                        </div>

                                        {/* Gênero */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Gênero</label>
                                            <select
                                                value={filters.genero || ''}
                                                onChange={(e) => handleFilterChange('genero', e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Todos</option>
                                                <option value="mulher_cis">Mulher Cisgênero</option>
                                                <option value="homem_cis">Homem Cisgênero</option>
                                                <option value="mulher_trans">Mulher Transgênero</option>
                                                <option value="homem_trans">Homem Transgênero</option>
                                                <option value="nao_binarie">Pessoa Não-Binária</option>
                                                <option value="outro">Outro</option>
                                                <option value="sem_declaracao">Sem declaração</option>
                                            </select>
                                        </div>

                                        {/* Raça/Cor/Etnia */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Raça/Cor/Etnia</label>
                                            <select
                                                value={filters.racaCorEtnia || ''}
                                                onChange={(e) => handleFilterChange('racaCorEtnia', e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Todos</option>
                                                <option value="branca">Branca</option>
                                                <option value="preta">Preta</option>
                                                <option value="parda">Parda</option>
                                                <option value="amarela">Amarela</option>
                                                <option value="indigena">Indígena</option>
                                                <option value="sem_declaracao">Sem declaração</option>
                                            </select>
                                        </div>

                                        {/* Bairro */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bairro</label>
                                            <select
                                                value={filters.bairro || ''}
                                                onChange={(e) => handleFilterChange('bairro', e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Todos</option>
                                                {availableBairros.map((bairro) => (
                                                    <option key={bairro} value={bairro}>
                                                        {bairro}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Área de Atuação Cultural */}
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Área de Atuação Cultural</label>
                                            <select
                                                value={filters.principalAreaAtuacaoCultural || ''}
                                                onChange={(e) => handleFilterChange('principalAreaAtuacaoCultural', e.target.value)}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            >
                                                <option value="">Todas</option>
                                                <option value="arquitetura">Arquitetura</option>
                                                <option value="atividades_artesanais">Atividades Artesanais</option>
                                                <option value="artes_cenicas">Artes Cênicas</option>
                                                <option value="artes_visuais">Artes Visuais</option>
                                                <option value="bibliotecas_literatura">Bibliotecas e Literatura</option>
                                                <option value="cinema_radio_tv">Cinema, Rádio e TV</option>
                                                <option value="musica">Música</option>
                                                <option value="arte_digital_jogos_digitais">Arte Digital e Jogos Digitais</option>
                                                <option value="design">Design</option>
                                                <option value="editorial">Editorial</option>
                                                <option value="moda">Moda</option>
                                                <option value="museus">Museus</option>
                                                <option value="outro">Outro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => { loadStatistics(); }}
                                            className="px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg shadow-soft transition-all hover:shadow-soft-lg"
                                        >
                                            Aplicar Filtros
                                        </button>
                                        {hasActiveFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="px-6 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-all"
                                            >
                                                Limpar Filtros
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 transform transition-all hover:scale-105">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total de Proponentes</p>
                                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{statistics.totalProponentes}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 transform transition-all hover:scale-105">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 text-white">
                                        <UserCircle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pessoa Física</p>
                                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{statistics.fisica}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 transform transition-all hover:scale-105">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pessoa Jurídica</p>
                                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{statistics.juridica}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 transform transition-all hover:scale-105">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                                        <UsersRound className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Coletivo</p>
                                        <p className="text-4xl font-bold text-slate-900 dark:text-white">{statistics.coletivo}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Breakdown Chart */}
                        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 mb-8">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Distribuição por Tipo</h2>

                            {statistics.totalProponentes > 0 ? (
                                <div className="space-y-6">
                                    {/* Pessoa Física */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Física</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {statistics.fisica} ({Math.round((statistics.fisica / statistics.totalProponentes) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                                                style={{ width: `${(statistics.fisica / statistics.totalProponentes) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Pessoa Jurídica */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Pessoa Jurídica</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {statistics.juridica} ({Math.round((statistics.juridica / statistics.totalProponentes) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                                                style={{ width: `${(statistics.juridica / statistics.totalProponentes) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Coletivo */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Coletivo</span>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {statistics.coletivo} ({Math.round((statistics.coletivo / statistics.totalProponentes) * 100)}%)
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
                                                style={{ width: `${(statistics.coletivo / statistics.totalProponentes) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center text-slate-600 dark:text-slate-400 py-8">
                                    Nenhum proponente cadastrado nesta cidade ainda.
                                </p>
                            )}
                        </div>

                        {/* Back to Home Link */}
                        <div className="text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all shadow-soft hover:shadow-soft-lg"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar para o início
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            Cidade não encontrada.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
