'use client';

import React, { useState, useEffect } from 'react';
import { TextInput } from '@/app/components/TextInput';
import { SelectInput } from '@/app/components/SelectInput';
import { MaskedInput } from '@/app/components/MaskedInput';
import Button from '@/app/components/Button';
import { Check, ArrowLeft, Loader2 } from 'lucide-react';
import { proponenteFisicaForm } from '@/app/(main)/proponentes/consts/pf';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProponenteService from '@/app/services/proponenteService';
import { useCEP } from '@/app/hooks/useCEP';

type FormData = Record<string, any>;

const STEPS = [
    { id: 'dadosPessoais', title: 'Dados Pessoais', section: 'dadosPessoais' },
    { id: 'contato', title: 'Contato', section: 'contato' },
    { id: 'endereco', title: 'Endereço', section: 'endereco' },
    { id: 'informacoesDemograficas', title: 'Informações Demográficas', section: 'perfilDoProponente.informacoesDemograficas' },
    { id: 'experiencia', title: 'Experiência', section: 'perfilDoProponente.experiencia' },
    { id: 'aspectosFinanceiros', title: 'Aspectos Financeiros', section: 'perfilDoProponente.aspectosFinanceiros' },
    { id: 'objetivos', title: 'Objetivos', section: 'perfilDoProponente.objetivos' },
];

// Helper function to initialize all form fields with empty values
const initializeFormData = () => {
    const initialData: FormData = {};

    // Get all sections from proponenteFisicaForm
    const allSections = [
        proponenteFisicaForm.dadosPessoais,
        proponenteFisicaForm.contato,
        proponenteFisicaForm.endereco,
        proponenteFisicaForm.perfilDoProponente.informacoesDemograficas,
        proponenteFisicaForm.perfilDoProponente.experiencia,
        proponenteFisicaForm.perfilDoProponente.aspectosFinanceiros,
        proponenteFisicaForm.perfilDoProponente.objetivos,
    ];

    // Initialize all fields with empty strings
    allSections.forEach(section => {
        section.forEach((field: any) => {
            initialData[field.name] = '';
        });
    });

    return initialData;
};

export default function PessoaFisicaPage() {
    const { user, dbUser } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(initializeFormData());
    const [saving, setSaving] = useState(false);
    const { loading: cepLoading, error: cepError, fetchAddress, clearError } = useCEP();

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle CEP lookup when CEP field changes
    useEffect(() => {
        const handleCEPLookup = async () => {
            const cep = formData.CEP;
            if (cep && cep.replace(/\D/g, '').length === 8) {
                const addressData = await fetchAddress(cep);
                if (addressData) {
                    setFormData(prev => ({
                        ...prev,
                        logradouro: addressData.logradouro,
                        bairro: addressData.bairro,
                        cidade: addressData.cidade,
                        uf: addressData.uf
                    }));
                }
            }
        };

        handleCEPLookup();
    }, [formData.CEP]);

    const getCurrentFields = () => {
        const step = STEPS[currentStep];
        const sections = step.section.split('.');

        let fields: any[] = [];
        if (sections.length === 1) {
            fields = (proponenteFisicaForm as any)[sections[0]];
        } else if (sections.length === 2) {
            fields = (proponenteFisicaForm as any)[sections[0]][sections[1]];
        }

        return fields || [];
    };

    const validateCurrentStep = () => {
        const fields = getCurrentFields();
        for (const field of fields) {
            if (field.required && !formData[field.name]) {
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateCurrentStep()) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (!user || !dbUser) {
            alert('Erro: Usuário não autenticado.');
            return;
        }

        if (!dbUser.cityId) {
            alert('Erro: Cidade do usuário não encontrada.');
            return;
        }

        setSaving(true);
        try {
            const proponenteService = ProponenteService.getInstance();

            // Organize data by sections
            const organizedData: any = {
                tipo: 'fisica',
                userId: user.uid,
                userEmail: user.email || '',
                cityId: dbUser.cityId,
                dadosPessoais: {},
                contato: {},
                endereco: {},
                perfilDoProponente: {
                    informacoesDemograficas: {},
                    experiencia: {},
                    aspectosFinanceiros: {},
                    objetivos: {}
                }
            };

            // Helper function to process field values
            const processFieldValue = (field: any, value: any) => {
                if (field.type === 'multiselect') {
                    // Convert comma-separated string to array
                    return value ? value.split(',').filter((v: string) => v.trim()) : [];
                }
                return value || '';
            };

            // Populate each section with its fields
            proponenteFisicaForm.dadosPessoais.forEach((field: any) => {
                organizedData.dadosPessoais[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.contato.forEach((field: any) => {
                organizedData.contato[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.endereco.forEach((field: any) => {
                organizedData.endereco[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.perfilDoProponente.informacoesDemograficas.forEach((field: any) => {
                organizedData.perfilDoProponente.informacoesDemograficas[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.perfilDoProponente.experiencia.forEach((field: any) => {
                organizedData.perfilDoProponente.experiencia[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.perfilDoProponente.aspectosFinanceiros.forEach((field: any) => {
                organizedData.perfilDoProponente.aspectosFinanceiros[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteFisicaForm.perfilDoProponente.objetivos.forEach((field: any) => {
                organizedData.perfilDoProponente.objetivos[field.name] = processFieldValue(field, formData[field.name]);
            });

            console.log('📤 JSON being sent to Firebase:', JSON.stringify(organizedData, null, 2));

            const proponenteId = await proponenteService.saveProponente(
                'fisica',
                organizedData,
                user.uid,
                user.email || '',
                dbUser.cityId
            );

            console.log('✅ Proponente saved with ID:', proponenteId);
            alert('Proponente cadastrado com sucesso!');
            router.push('/proponentes');
        } catch (error) {
            console.error('Error saving proponente:', error);
            alert('Erro ao salvar proponente. Por favor, tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const renderField = (field: any) => {
        const value = formData[field.name] || '';

        if (field.type === 'multiselect') {
            const selectedValues = Array.isArray(value) ? value : (value ? value.split(',') : []);

            return (
                <div key={field.name} className="space-y-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-300 dark:border-slate-600 rounded-lg p-3">
                        {field.options.map((option: any) => {
                            const checkboxId = `${field.name}-${option.value}`;
                            return (
                                <label key={option.value} htmlFor={checkboxId} className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded">
                                    <input
                                        id={checkboxId}
                                        type="checkbox"
                                        checked={selectedValues.includes(option.value)}
                                        onChange={(e) => {
                                            const newValues = e.target.checked
                                                ? [...selectedValues, option.value]
                                                : selectedValues.filter((v: string) => v !== option.value);
                                            handleInputChange(field.name, newValues.join(','));
                                        }}
                                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">{option.label}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            );
        }

        if (field.type === 'select') {
            return (
                <SelectInput
                    key={field.name}
                    label={field.label}
                    options={field.options}
                    value={value}
                    onChange={(e: any) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                />
            );
        }

        if (field.type === 'date') {
            return (
                <TextInput
                    key={field.name}
                    type="text"
                    label={field.label}
                    value={value}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    placeholder="DD/MM/AAAA"
                    required={field.required}
                />
            );
        }

        if (field.type === 'boolean') {
            return (
                <SelectInput
                    key={field.name}
                    label={field.label}
                    options={[
                        { value: 'true', label: 'Sim' },
                        { value: 'false', label: 'Não' }
                    ]}
                    value={value}
                    onChange={(e: any) => handleInputChange(field.name, e.target.value)}
                    required={field.required}
                />
            );
        }

        // Special handling for CEP field
        if (field.name === 'CEP') {
            return (
                <div key={field.name}>
                    <div className="relative">
                        <MaskedInput
                            label={field.label}
                            maskType="cep"
                            value={value}
                            onChange={(maskedValue, rawValue) => {
                                handleInputChange(field.name, maskedValue);
                                clearError();
                            }}
                            required={field.required}
                        />
                        {cepLoading && (
                            <div className="absolute right-3 top-11">
                                <Loader2 className="animate-spin text-primary-600" size={20} />
                            </div>
                        )}
                    </div>
                    {cepError && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{cepError}</p>
                    )}
                    {!cepError && value && value.replace(/\D/g, '').length === 8 && !cepLoading && (
                        <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Endereço encontrado</p>
                    )}
                </div>
            );
        }

        // Special handling for CPF field
        if (field.name === 'cpf') {
            return (
                <MaskedInput
                    key={field.name}
                    label={field.label}
                    maskType="cpf"
                    value={value}
                    onChange={(maskedValue, rawValue) => handleInputChange(field.name, maskedValue)}
                    required={field.required}
                />
            );
        }

        // Special handling for phone fields
        if (field.name === 'celular') {
            return (
                <MaskedInput
                    key={field.name}
                    label={field.label}
                    maskType="cellphone"
                    value={value}
                    onChange={(maskedValue, rawValue) => handleInputChange(field.name, maskedValue)}
                    required={field.required}
                />
            );
        }

        if (field.name === 'telefoneFixo' || field.name === 'telefoneAlternativo') {
            return (
                <MaskedInput
                    key={field.name}
                    label={field.label}
                    maskType="phone"
                    value={value}
                    onChange={(maskedValue, rawValue) => handleInputChange(field.name, maskedValue)}
                    required={field.required}
                />
            );
        }

        return (
            <TextInput
                key={field.name}
                type="text"
                label={field.label}
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                required={field.required}
            />
        );
    };

    const fields = getCurrentFields();
    const isLastStep = currentStep === STEPS.length - 1;
    const isFirstStep = currentStep === 0;

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            <button
                onClick={() => router.push('/proponentes')}
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar
            </button>

            <h1 className="text-3xl font-bold mb-6">Cadastro de Pessoa Física</h1>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1">
                            <div className="flex flex-col items-center flex-1">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${index < currentStep
                                        ? 'bg-green-500 text-white'
                                        : index === currentStep
                                            ? 'bg-primary-500 text-white'
                                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                                        }`}
                                >
                                    {index < currentStep ? <Check size={20} /> : index + 1}
                                </div>
                                <span className={`text-xs mt-2 text-center ${index === currentStep ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-slate-500'
                                    }`}>
                                    {step.title}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={`h-1 flex-1 mx-2 transition-all duration-300 ${index < currentStep ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="theme-card p-8">
                <h2 className="text-2xl font-semibold mb-6">{STEPS[currentStep].title}</h2>

                <div className="grid grid-cols-1 gap-6">
                    {fields.map((field: any) => (
                        <div key={field.name}>
                            {renderField(field)}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <Button
                        label="Anterior"
                        onClick={handlePrevious}
                        disabled={isFirstStep}
                        variant="outlined"
                    />

                    {isLastStep ? (
                        <Button
                            label={saving ? "Salvando..." : "Finalizar Cadastro"}
                            onClick={handleSubmit}
                            disabled={saving}
                        />
                    ) : (
                        <Button
                            label="Próximo"
                            onClick={handleNext}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
