import { proponenteFisicaForm } from '../(main)/proponentes/consts/pf';
import { proponenteJuridicaForm } from '../(main)/proponentes/consts/pj';
import { proponenteColetivoForm } from '../(main)/proponentes/consts/coletivo';

// Helper function to flatten form structure and create field name to label mapping
function createLabelMap(formConfig: any): Record<string, string> {
    const labelMap: Record<string, string> = {};

    function processFields(fields: any, prefix: string = '') {
        if (Array.isArray(fields)) {
            fields.forEach((field: any) => {
                if (field.name && field.label) {
                    labelMap[field.name] = field.label;
                }
            });
        } else if (typeof fields === 'object' && fields !== null) {
            Object.entries(fields).forEach(([key, value]) => {
                processFields(value, key);
            });
        }
    }

    processFields(formConfig);
    return labelMap;
}

// Create label maps for each proponente type
const pfLabels = createLabelMap(proponenteFisicaForm);
const pjLabels = createLabelMap(proponenteJuridicaForm);
const coletivoLabels = createLabelMap(proponenteColetivoForm);

// Section name mappings
const sectionLabels: Record<string, string> = {
    'dadosPessoais': 'Dados Pessoais',
    'dadosPessoaJuridica': 'Dados da Pessoa Jurídica',
    'dadosPJ': 'Dados da Pessoa Jurídica',
    'dadosColetivo': 'Dados do Coletivo',
    'contato': 'Contato',
    'endereco': 'Endereço',
    'enderecoResponsavel': 'Endereço do Responsável',
    'enderecoPessoaJuridica': 'Endereço da Pessoa Jurídica',
    'responsavel': 'Responsável Legal',
    'perfilDoProponente': 'Perfil do Proponente',
    'perfilPessoaJuridica': 'Perfil da Pessoa Jurídica',
    'perfilDoResponsavel': 'Perfil do Responsável',
    'informacoesDemograficas': 'Informações Demográficas',
    'experiencia': 'Experiência',
    'aspectosFinanceiros': 'Aspectos Financeiros',
    'objetivos': 'Objetivos',
    'caracteristicasAreaAtuacao': 'Características e Área de Atuação',
    'estruturaERecursos': 'Estrutura e Recursos',
    'experienciasEParcerias': 'Experiências e Parcerias',
    'impactoSocial': 'Impacto Social',
    'documentos': 'Documentos'
};

// Helper function to extract option labels from form config
function createValueLabelMap(formConfig: any): Record<string, Record<string, string>> {
    const valueLabelMap: Record<string, Record<string, string>> = {};

    function processFields(fields: any) {
        if (Array.isArray(fields)) {
            fields.forEach((field: any) => {
                if (field.name && field.options && Array.isArray(field.options)) {
                    valueLabelMap[field.name] = {};
                    field.options.forEach((option: any) => {
                        if (option.value && option.label) {
                            valueLabelMap[field.name][option.value] = option.label;
                        }
                    });
                }
            });
        } else if (typeof fields === 'object' && fields !== null) {
            Object.values(fields).forEach((value) => {
                processFields(value);
            });
        }
    }

    processFields(formConfig);
    return valueLabelMap;
}

// Create value label maps from all form configs
const pfValueLabels = createValueLabelMap(proponenteFisicaForm);
const pjValueLabels = createValueLabelMap(proponenteJuridicaForm);
const coletivoValueLabels = createValueLabelMap(proponenteColetivoForm);

// Merge all value labels
const valueLabels: Record<string, Record<string, string>> = {
    ...pfValueLabels,
    ...pjValueLabels,
    ...coletivoValueLabels,
    // Additional common mappings
    possuiDomicilioNoBrasil: {
        'true': 'Sim',
        'false': 'Não'
    }
};

/**
 * Get the label for a field name
 */
export function getFieldLabel(fieldName: string, tipo?: 'fisica' | 'juridica' | 'coletivo'): string {
    // Try to get from type-specific labels first
    if (tipo === 'fisica' && pfLabels[fieldName]) {
        return pfLabels[fieldName];
    }
    if (tipo === 'juridica' && pjLabels[fieldName]) {
        return pjLabels[fieldName];
    }
    if (tipo === 'coletivo' && coletivoLabels[fieldName]) {
        return coletivoLabels[fieldName];
    }

    // Try all label maps
    if (pfLabels[fieldName]) return pfLabels[fieldName];
    if (pjLabels[fieldName]) return pjLabels[fieldName];
    if (coletivoLabels[fieldName]) return coletivoLabels[fieldName];

    // Fallback to formatted field name
    return fieldName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

/**
 * Get the label for a section name
 */
export function getSectionLabel(sectionName: string): string {
    return sectionLabels[sectionName] || sectionName
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
}

/**
 * Get the label for a field value (for select fields)
 */
export function getValueLabel(fieldName: string, value: any): string {
    if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
    }

    // Handle arrays (multiselect fields)
    if (Array.isArray(value)) {
        return value.map(v => {
            if (valueLabels[fieldName] && valueLabels[fieldName][v]) {
                return valueLabels[fieldName][v];
            }
            return String(v);
        }).join(', ');
    }

    if (valueLabels[fieldName] && valueLabels[fieldName][value]) {
        return valueLabels[fieldName][value];
    }

    return String(value);
}

/**
 * Format a value for display
 */
export function formatValue(value: any, fieldName?: string): string {
    if (value === null || value === undefined) {
        return 'N/A';
    }

    if (typeof value === 'boolean') {
        return value ? 'Sim' : 'Não';
    }

    if (Array.isArray(value)) {
        // If we have a field name, try to get labels for array values
        if (fieldName) {
            return value.map(v => {
                if (valueLabels[fieldName] && valueLabels[fieldName][v]) {
                    return valueLabels[fieldName][v];
                }
                return String(v);
            }).join(', ');
        }
        return value.join(', ');
    }

    if (typeof value === 'object' && value !== null) {
        if ('toDate' in value && typeof (value as any).toDate === 'function') {
            return (value as any).toDate().toLocaleDateString('pt-BR');
        }
        return JSON.stringify(value, null, 2);
    }

    return String(value);
}
