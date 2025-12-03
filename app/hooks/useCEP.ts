import { useState, useCallback } from 'react';
import CEPService, { AddressData } from '@/app/services/cepService';

interface UseCEPReturn {
    loading: boolean;
    error: string | null;
    addressData: AddressData | null;
    fetchAddress: (cep: string) => Promise<AddressData | null>;
    clearError: () => void;
}

export function useCEP(): UseCEPReturn {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addressData, setAddressData] = useState<AddressData | null>(null);

    const cepService = CEPService.getInstance();

    const fetchAddress = useCallback(async (cep: string): Promise<AddressData | null> => {
        setLoading(true);
        setError(null);
        setAddressData(null);

        try {
            // Valida o CEP antes de fazer a requisição
            if (!cepService.isValidCEP(cep)) {
                setError('CEP inválido. Digite 8 dígitos.');
                setLoading(false);
                return null;
            }

            const data = await cepService.fetchAddressByCEP(cep);

            if (!data) {
                setError('CEP não encontrado. Verifique o número digitado.');
                setLoading(false);
                return null;
            }

            setAddressData(data);
            setLoading(false);
            return data;
        } catch (err) {
            setError('Erro ao buscar endereço. Tente novamente.');
            setLoading(false);
            return null;
        }
    }, [cepService]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        loading,
        error,
        addressData,
        fetchAddress,
        clearError
    };
}
