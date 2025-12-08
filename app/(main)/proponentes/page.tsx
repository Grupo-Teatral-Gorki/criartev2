'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building2, Users, Plus, Calendar, Mail, Loader2, FileText } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import ProponenteService, { ProponenteData } from '@/app/services/proponenteService';
import Button from '@/app/components/Button';

export default function ProponentesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [proponentes, setProponentes] = useState<ProponenteData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewOptions, setShowNewOptions] = useState(false);

    useEffect(() => {
        if (user) {
            loadProponentes();
        }
    }, [user]);

    const loadProponentes = async () => {
        if (!user) return;

        try {
            setLoading(true);
            const proponenteService = ProponenteService.getInstance();
            const data = await proponenteService.getProponentesByUser(user.uid);
            setProponentes(data);
        } catch (error) {
            console.error('Error loading proponentes:', error);
        } finally {
            setLoading(false);
        }
    };

    const proponenteTypes = [
        {
            id: 'fisica',
            title: 'Pessoa Física',
            description: 'Cadastro individual de pessoa física',
            icon: User,
            route: '/proponentes/novo/fisica'
        },
        {
            id: 'juridica',
            title: 'Pessoa Jurídica',
            description: 'Cadastro de empresa ou organização',
            icon: Building2,
            route: '/proponentes/novo/juridica'
        },
        {
            id: 'coletivo',
            title: 'Coletivo',
            description: 'Cadastro de grupo ou coletivo cultural',
            icon: Users,
            route: '/proponentes/novo/coletivo'
        }
    ];

    const getProponenteName = (proponente: ProponenteData) => {
        if (proponente.tipo === 'fisica') {
            return proponente.dadosPessoais?.nomeCompleto || 'Nome não informado';
        } else if (proponente.tipo === 'juridica') {
            return proponente.dadosPessoaJuridica?.razaoSocial || 'Razão social não informada';
        } else {
            return proponente.dadosColetivo?.nomeColetivo || 'Nome não informado';
        }
    };

    const getProponenteIcon = (tipo: string) => {
        switch (tipo) {
            case 'fisica':
                return User;
            case 'juridica':
                return Building2;
            case 'coletivo':
                return Users;
            default:
                return FileText;
        }
    };

    const getProponenteTypeLabel = (tipo: string) => {
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

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-BR');
    };

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">Meus Proponentes</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Gerencie seus cadastros de proponentes culturais
                    </p>
                </div>
                <Button
                    label="+ Novo Proponente"
                    onClick={() => setShowNewOptions(!showNewOptions)}
                />
            </div>

            {/* New Proponente Options */}
            {showNewOptions && (
                <div className="mb-8 p-6 theme-card border-2 border-primary-500/20">
                    <h2 className="text-xl font-semibold mb-4">Selecione o tipo de proponente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {proponenteTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => router.push(type.route)}
                                    className="theme-card p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group border-2 border-transparent hover:border-primary-500/50"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center mb-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors">
                                            <Icon size={24} className="text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold mb-1">{type.title}</h3>
                                        <p className="text-slate-600 dark:text-slate-400 text-xs">
                                            {type.description}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary-600" size={40} />
                </div>
            )}

            {/* Empty State */}
            {!loading && proponentes.length === 0 && (
                <div className="text-center py-12 theme-card">
                    <FileText size={64} className="mx-auto mb-4 text-slate-400" />
                    <h3 className="text-xl font-semibold mb-2">Nenhum proponente cadastrado</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Comece criando seu primeiro cadastro de proponente
                    </p>
                    <Button
                        label="+ Criar Primeiro Proponente"
                        onClick={() => setShowNewOptions(true)}
                    />
                </div>
            )}

            {/* Proponentes List */}
            {!loading && proponentes.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {proponentes.map((proponente) => {
                        const Icon = getProponenteIcon(proponente.tipo);
                        return (
                            <div
                                key={proponente.id}
                                className="theme-card p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                                onClick={() => router.push(`/proponentes/${proponente.id}`)}
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 dark:group-hover:bg-primary-900/40 transition-colors">
                                        <Icon size={28} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row items-start justify-between mb-2 gap-2">
                                            <div>
                                                <h3 className="text-lg md:text-xl font-semibold mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors break-words">
                                                    {getProponenteName(proponente)}
                                                </h3>
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300">
                                                    {getProponenteTypeLabel(proponente.tipo)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
                                            <div className="flex items-center gap-1">
                                                <Mail size={16} />
                                                <span>{proponente.userEmail}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                <span>Criado em {formatDate(proponente.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
