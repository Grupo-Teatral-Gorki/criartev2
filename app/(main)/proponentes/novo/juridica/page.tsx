'use client';

import React, { useState } from 'react';
import { TextInput } from '@/app/components/TextInput';
import { SelectInput } from '@/app/components/SelectInput';
import Button from '@/app/components/Button';
import { Check, ArrowLeft } from 'lucide-react';
import { proponenteJuridicaForm } from '@/app/(main)/proponentes/consts/pj';
import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import ProponenteService from '@/app/services/proponenteService';

type FormData = Record<string, any>;

const STEPS = [
    { id: 'dadosBasicos', title: 'Dados Básicos', sections: ['dadosPJ', 'contato'] },
    { id: 'responsavel', title: 'Responsável Legal', sections: ['responsavel', 'enderecoResponsavel'] },
    { id: 'enderecoPJ', title: 'Endereço da PJ', sections: ['enderecoPessoaJuridica'] },
    { id: 'perfilPJ', title: 'Perfil da PJ', sections: ['perfilPessoaJuridica.caracteristicasAreaAtuacao', 'perfilPessoaJuridica.estruturaERecursos'] },
    { id: 'experienciasImpacto', title: 'Experiências e Impacto', sections: ['perfilPessoaJuridica.experienciasEParcerias', 'perfilPessoaJuridica.impactoSocial'] },
    { id: 'perfilResponsavel', title: 'Perfil do Responsável', sections: ['perfilDoResponsavel.informacoesDemograficas', 'perfilDoResponsavel.experiencia'] },
    { id: 'financeiroObjetivos', title: 'Financeiro e Objetivos', sections: ['perfilDoResponsavel.aspectosFinanceiros', 'perfilDoResponsavel.objetivos'] },
];

// Helper function to initialize all form fields with empty values
const initializeFormData = () => {
    const initialData: FormData = {};

    // Get all sections from proponenteJuridicaForm
    const allSections = [
        proponenteJuridicaForm.dadosPJ,
        proponenteJuridicaForm.contato,
        proponenteJuridicaForm.responsavel,
        proponenteJuridicaForm.enderecoResponsavel,
        proponenteJuridicaForm.enderecoPessoaJuridica,
        proponenteJuridicaForm.perfilPessoaJuridica.caracteristicasAreaAtuacao,
        proponenteJuridicaForm.perfilPessoaJuridica.estruturaERecursos,
        proponenteJuridicaForm.perfilPessoaJuridica.experienciasEParcerias,
        proponenteJuridicaForm.perfilPessoaJuridica.impactoSocial,
        proponenteJuridicaForm.perfilDoResponsavel.informacoesDemograficas,
        proponenteJuridicaForm.perfilDoResponsavel.experiencia,
        proponenteJuridicaForm.perfilDoResponsavel.aspectosFinanceiros,
        proponenteJuridicaForm.perfilDoResponsavel.objetivos,
    ];

    // Initialize all fields with empty strings
    allSections.forEach(section => {
        section.forEach((field: any) => {
            initialData[field.name] = '';
        });
    });

    return initialData;
};

export default function PessoaJuridicaPage() {
    const { user, dbUser } = useAuth();
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<FormData>(initializeFormData());
    const [saving, setSaving] = useState(false);

    const handleInputChange = (name: string, value: any) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const getCurrentFields = () => {
        const step = STEPS[currentStep];
        let allFields: any[] = [];

        // Iterate through all sections in this step
        step.sections.forEach(sectionPath => {
            const sections = sectionPath.split('.');
            let fields: any[] = [];

            if (sections.length === 1) {
                fields = (proponenteJuridicaForm as any)[sections[0]];
            } else if (sections.length === 2) {
                fields = (proponenteJuridicaForm as any)[sections[0]][sections[1]];
            }

            if (fields && fields.length > 0) {
                allFields = [...allFields, ...fields];
            }
        });

        return allFields;
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

    const validateCurrentStep = () => {
        const fields = getCurrentFields();
        for (const field of fields) {
            if (field.required && !formData[field.name]) {
                return false;
            }
        }
        return true;
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
                tipo: 'juridica',
                userId: user.uid,
                userEmail: user.email || '',
                cityId: dbUser.cityId,
                dadosPJ: {},
                contato: {},
                responsavel: {},
                enderecoResponsavel: {},
                enderecoPessoaJuridica: {},
                perfilPessoaJuridica: {
                    caracteristicasAreaAtuacao: {},
                    estruturaERecursos: {},
                    experienciasEParcerias: {},
                    impactoSocial: {}
                },
                perfilDoResponsavel: {
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
            proponenteJuridicaForm.dadosPJ.forEach((field: any) => {
                organizedData.dadosPJ[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.contato.forEach((field: any) => {
                organizedData.contato[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.responsavel.forEach((field: any) => {
                organizedData.responsavel[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.enderecoResponsavel.forEach((field: any) => {
                organizedData.enderecoResponsavel[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.enderecoPessoaJuridica.forEach((field: any) => {
                organizedData.enderecoPessoaJuridica[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilPessoaJuridica.caracteristicasAreaAtuacao.forEach((field: any) => {
                organizedData.perfilPessoaJuridica.caracteristicasAreaAtuacao[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilPessoaJuridica.estruturaERecursos.forEach((field: any) => {
                organizedData.perfilPessoaJuridica.estruturaERecursos[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilPessoaJuridica.experienciasEParcerias.forEach((field: any) => {
                organizedData.perfilPessoaJuridica.experienciasEParcerias[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilPessoaJuridica.impactoSocial.forEach((field: any) => {
                organizedData.perfilPessoaJuridica.impactoSocial[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilDoResponsavel.informacoesDemograficas.forEach((field: any) => {
                organizedData.perfilDoResponsavel.informacoesDemograficas[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilDoResponsavel.experiencia.forEach((field: any) => {
                organizedData.perfilDoResponsavel.experiencia[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilDoResponsavel.aspectosFinanceiros.forEach((field: any) => {
                organizedData.perfilDoResponsavel.aspectosFinanceiros[field.name] = processFieldValue(field, formData[field.name]);
            });

            proponenteJuridicaForm.perfilDoResponsavel.objetivos.forEach((field: any) => {
                organizedData.perfilDoResponsavel.objetivos[field.name] = processFieldValue(field, formData[field.name]);
            });

            console.log('📤 JSON being sent to Firebase:', JSON.stringify(organizedData, null, 2));

            const proponenteId = await proponenteService.saveProponente(
                'juridica',
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
                        {field.options.map((option: any) => (
                            <label key={option.value} className="flex items-start gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded">
                                <input
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
                        ))}
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

        return (
            <TextInput
                key={field.name}
                type="text"
                label={field.label}
                value={value}
                onChange={(e) => handleInputChange(field.name, e.target.value)}
                placeholder={field.placeholder || field.label}
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

            <h1 className="text-3xl font-bold mb-6">Cadastro de Pessoa Jurídica</h1>

            <div className="mb-8">
                <div className="flex items-center justify-between mb-4 overflow-x-auto">
                    {STEPS.map((step, index) => (
                        <div key={step.id} className="flex items-center flex-1 min-w-[80px]">
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
