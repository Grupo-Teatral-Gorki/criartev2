/**
 * Brazilian Input Masks Utility
 * Provides formatting and validation for CPF, CNPJ, CEP, and phone numbers
 */

export type MaskType = 'cpf' | 'cnpj' | 'cep' | 'phone' | 'cellphone' | 'cpf-cnpj';

/**
 * Apply CPF mask: 000.000.000-00
 */
export const applyCPFMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    return limited
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
};

/**
 * Apply CNPJ mask: 00.000.000/0000-00
 */
export const applyCNPJMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 14);

    return limited
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2');
};

/**
 * Apply CEP mask: 00000-000
 */
export const applyCEPMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 8);

    return limited.replace(/(\d{5})(\d{1,3})/, '$1-$2');
};

/**
 * Apply phone mask (landline): (00) 0000-0000
 */
export const applyPhoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 10);

    return limited
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d{1,4})/, '$1-$2');
};

/**
 * Apply cellphone mask: (00) 00000-0000
 */
export const applyCellphoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    const limited = numbers.slice(0, 11);

    return limited
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})/, '$1-$2');
};

/**
 * Apply CPF or CNPJ mask dynamically based on length
 */
export const applyCPFOrCNPJMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 11) {
        return applyCPFMask(value);
    } else {
        return applyCNPJMask(value);
    }
};

/**
 * Apply phone or cellphone mask dynamically based on length
 */
export const applyPhoneOrCellphoneMask = (value: string): string => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length <= 10) {
        return applyPhoneMask(value);
    } else {
        return applyCellphoneMask(value);
    }
};

/**
 * Remove all non-numeric characters
 */
export const removeNonNumeric = (value: string): string => {
    return value.replace(/\D/g, '');
};

/**
 * Validate CPF
 */
export const isValidCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length !== 11) return false;

    // Check for known invalid CPFs
    if (/^(\d)\1{10}$/.test(numbers)) return false;

    // Validate first digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(numbers.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(9))) return false;

    // Validate second digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(numbers.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(numbers.charAt(10))) return false;

    return true;
};

/**
 * Validate CNPJ
 */
export const isValidCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length !== 14) return false;

    // Check for known invalid CNPJs
    if (/^(\d)\1{13}$/.test(numbers)) return false;

    // Validate first digit
    let size = numbers.length - 2;
    let nums = numbers.substring(0, size);
    const digits = numbers.substring(size);
    let sum = 0;
    let pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(nums.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0))) return false;

    // Validate second digit
    size = size + 1;
    nums = numbers.substring(0, size);
    sum = 0;
    pos = size - 7;

    for (let i = size; i >= 1; i--) {
        sum += parseInt(nums.charAt(size - i)) * pos--;
        if (pos < 2) pos = 9;
    }

    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1))) return false;

    return true;
};

/**
 * Validate CEP
 */
export const isValidCEP = (cep: string): boolean => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
};

/**
 * Validate phone number (landline or cellphone)
 */
export const isValidPhone = (phone: string): boolean => {
    const numbers = phone.replace(/\D/g, '');
    return numbers.length === 10 || numbers.length === 11;
};

/**
 * Main mask application function
 */
export const applyMask = (value: string, maskType: MaskType): string => {
    switch (maskType) {
        case 'cpf':
            return applyCPFMask(value);
        case 'cnpj':
            return applyCNPJMask(value);
        case 'cep':
            return applyCEPMask(value);
        case 'phone':
            return applyPhoneMask(value);
        case 'cellphone':
            return applyCellphoneMask(value);
        case 'cpf-cnpj':
            return applyCPFOrCNPJMask(value);
        default:
            return value;
    }
};

/**
 * Get placeholder for mask type
 */
export const getMaskPlaceholder = (maskType: MaskType): string => {
    switch (maskType) {
        case 'cpf':
            return '000.000.000-00';
        case 'cnpj':
            return '00.000.000/0000-00';
        case 'cep':
            return '00000-000';
        case 'phone':
            return '(00) 0000-0000';
        case 'cellphone':
            return '(00) 00000-0000';
        case 'cpf-cnpj':
            return 'CPF ou CNPJ';
        default:
            return '';
    }
};
