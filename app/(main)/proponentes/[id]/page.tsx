'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '@/app/context/AuthContext';
import ProponenteService, { ProponenteData } from '@/app/services/proponenteService';
import Button from '@/app/components/Button';
import { TextInput } from '@/app/components/TextInput';
import { SelectInput } from '@/app/components/SelectInput';

export default function EditProponentePage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [proponente, setProponente] = useState<ProponenteData | null>(null);
    const [formData, setFormData] = useState<any>({});

    useEffect(() => {
        if (params.id && typeof params.id === 'string') {
            loadProponente(params.id);
        }
    }, [params.id]);

    const loadProponente = async (id: string) => {
        try {
            setLoading(true);
            const proponenteService = ProponenteService.getInstance();
            const data = await proponenteService.getProponenteById(id);

            if (data) {
                setProponente(data);
                // Initialize form data based on type
                if (data.tipo === 'fisica') {
                    setFormData(data.dadosPessoais || {});
                } else if (data.tipo === 'juridica') {
                    setFormData(data.dadosPessoaJuridica || {});
                } else {
                    setFormData(data.dadosColetivo || {});
                }
            } else {
                alert('Proponente não encontrado');
                router.push('/proponentes');
            }
        } catch (error) {
            console.error('Error loading proponente:', error);
            alert('Erro ao carregar proponente');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = async () => {
        if (!proponente || !user) return;

        try {
            setSaving(true);
            const proponenteService = ProponenteService.getInstance();

            const updatedData: Partial<ProponenteData> = {};

            // Update the appropriate data section based on type
            if (proponente.tipo === 'fisica') {
                updatedData.dadosPessoais = formData;
            } else if (proponente.tipo === 'juridica') {
                updatedData.dadosPessoaJuridica = formData;
            } else {
                updatedData.dadosColetivo = formData;
            }

            await proponenteService.updateProponente(proponente.id!, updatedData);
            alert('Proponente atualizado com sucesso!');
            router.push('/proponentes');
        } catch (error) {
            console.error('Error saving proponente:', error);
            alert('Erro ao salvar proponente');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!proponente) return;

        if (!confirm('Tem certeza que deseja excluir este proponente?')) {
            return;
        }

        try {
            const proponenteService = ProponenteService.getInstance();
            await proponenteService.deleteProponente(proponente.id!);
            alert('Proponente excluído com sucesso!');
            router.push('/proponentes');
        } catch (error) {
            console.error('Error deleting proponente:', error);
            alert('Erro ao excluir proponente');
        }
    };

    const renderFields = () => {
        if (!proponente) return null;

        if (proponente.tipo === 'fisica') {
            return (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="Nome Completo"
                            value={formData.nomeCompleto || ''}
                            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Nome Social"
                            value={formData.nomeSocial || ''}
                            onChange={(e) => handleInputChange('nomeSocial', e.target.value)}
                        />
                        <TextInput
                            label="CPF"
                            value={formData.CPF || ''}
                            onChange={(e) => handleInputChange('CPF', e.target.value)}
                            required
                        />
                        <TextInput
                            label="RG"
                            value={formData.RG || ''}
                            onChange={(e) => handleInputChange('RG', e.target.value)}
                        />
                        <TextInput
                            label="Data de Nascimento"
                            value={formData.dataNascimento || ''}
                            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Celular"
                            value={formData.celular || ''}
                            onChange={(e) => handleInputChange('celular', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Telefone"
                            value={formData.telefone || ''}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                        />
                    </div>
                    <h3 className="text-lg font-semibold mt-6 mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="CEP"
                            value={formData.CEP || ''}
                            onChange={(e) => handleInputChange('CEP', e.target.value)}
                        />
                        <TextInput
                            label="Logradouro"
                            value={formData.logradouro || ''}
                            onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        />
                        <TextInput
                            label="Número"
                            value={formData.numero || ''}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                        />
                        <TextInput
                            label="Complemento"
                            value={formData.complemento || ''}
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                        />
                        <TextInput
                            label="Bairro"
                            value={formData.bairro || ''}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                        />
                        <TextInput
                            label="Cidade"
                            value={formData.cidade || ''}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            required
                        />
                        <TextInput
                            label="UF"
                            value={formData.uf || ''}
                            onChange={(e) => handleInputChange('uf', e.target.value)}
                            maxLength={2}
                            required
                        />
                    </div>
                </>
            );
        } else if (proponente.tipo === 'juridica') {
            return (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="Razão Social"
                            value={formData.razaoSocial || ''}
                            onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Nome Fantasia"
                            value={formData.nomeFantasia || ''}
                            onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                        />
                        <TextInput
                            label="CNPJ"
                            value={formData.CNPJ || ''}
                            onChange={(e) => handleInputChange('CNPJ', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Celular"
                            value={formData.celular || ''}
                            onChange={(e) => handleInputChange('celular', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Telefone"
                            value={formData.telefone || ''}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                        />
                    </div>
                    <h3 className="text-lg font-semibold mt-6 mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="CEP"
                            value={formData.CEP || ''}
                            onChange={(e) => handleInputChange('CEP', e.target.value)}
                        />
                        <TextInput
                            label="Logradouro"
                            value={formData.logradouro || ''}
                            onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        />
                        <TextInput
                            label="Número"
                            value={formData.numero || ''}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                        />
                        <TextInput
                            label="Complemento"
                            value={formData.complemento || ''}
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                        />
                        <TextInput
                            label="Bairro"
                            value={formData.bairro || ''}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                        />
                        <TextInput
                            label="Cidade"
                            value={formData.cidade || ''}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            required
                        />
                        <TextInput
                            label="UF"
                            value={formData.uf || ''}
                            onChange={(e) => handleInputChange('uf', e.target.value)}
                            maxLength={2}
                            required
                        />
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="Nome do Coletivo"
                            value={formData.nomeColetivo || ''}
                            onChange={(e) => handleInputChange('nomeColetivo', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Email"
                            type="email"
                            value={formData.email || ''}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Celular"
                            value={formData.celular || ''}
                            onChange={(e) => handleInputChange('celular', e.target.value)}
                            required
                        />
                        <TextInput
                            label="Telefone"
                            value={formData.telefone || ''}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                        />
                    </div>
                    <h3 className="text-lg font-semibold mt-6 mb-4">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <TextInput
                            label="CEP"
                            value={formData.CEP || ''}
                            onChange={(e) => handleInputChange('CEP', e.target.value)}
                        />
                        <TextInput
                            label="Logradouro"
                            value={formData.logradouro || ''}
                            onChange={(e) => handleInputChange('logradouro', e.target.value)}
                        />
                        <TextInput
                            label="Número"
                            value={formData.numero || ''}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                        />
                        <TextInput
                            label="Complemento"
                            value={formData.complemento || ''}
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                        />
                        <TextInput
                            label="Bairro"
                            value={formData.bairro || ''}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                        />
                        <TextInput
                            label="Cidade"
                            value={formData.cidade || ''}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            required
                        />
                        <TextInput
                            label="UF"
                            value={formData.uf || ''}
                            onChange={(e) => handleInputChange('uf', e.target.value)}
                            maxLength={2}
                            required
                        />
                    </div>
                </>
            );
        }
    };

    const getProponenteTypeLabel = (tipo: string) => {
        switch (tipo) {
            case 'fisica':
                return 'Pessoa Física';
            case 'juridica':
                return 'Pessoa Jurídica';
            case 'coletivo':
                return 'Coletivo sem CNPJ';
            default:
                return tipo;
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="animate-spin text-primary-600" size={40} />
                </div>
            </div>
        );
    }

    if (!proponente) {
        return null;
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.push('/proponentes')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mb-4"
                >
                    <ArrowLeft size={20} />
                    Voltar para Proponentes
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Editar Proponente</h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            {getProponenteTypeLabel(proponente.tipo)}
                        </p>
                    </div>
                    <Button
                        label="Excluir"
                        variant="danger"
                        size="medium"
                        onClick={handleDelete}
                    />
                </div>
            </div>

            {/* Form */}
            <div className="theme-card p-6">
                {renderFields()}

                {/* Actions */}
                <div className="flex gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        label="Cancelar"
                        variant="outlined"
                        size="medium"
                        onClick={() => router.push('/proponentes')}
                        disabled={saving}
                    />
                    <Button
                        label={saving ? 'Salvando...' : 'Salvar Alterações'}
                        variant="save"
                        size="medium"
                        onClick={handleSave}
                        disabled={saving}
                    />
                </div>
            </div>
        </div>
    );
}
