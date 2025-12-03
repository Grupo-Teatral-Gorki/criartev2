export interface ViaCEPResponse {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string; // cidade
    uf: string;
    ibge: string;
    gia: string;
    ddd: string;
    siafi: string;
    erro?: boolean;
}

export interface AddressData {
    logradouro: string;
    bairro: string;
    cidade: string;
    uf: string;
}

class CEPService {
    private static instance: CEPService;

    private constructor() { }

    static getInstance(): CEPService {
        if (!CEPService.instance) {
            CEPService.instance = new CEPService();
        }
        return CEPService.instance;
    }

    /**
     * Busca endereço pelo CEP usando a API ViaCEP
     * @param cep - CEP no formato 12345678 ou 12345-678
     * @returns Dados do endereço ou null se não encontrado
     */
    async fetchAddressByCEP(cep: string): Promise<AddressData | null> {
        try {
            // Remove caracteres não numéricos
            const cleanCEP = cep.replace(/\D/g, '');

            // Valida se o CEP tem 8 dígitos
            if (cleanCEP.length !== 8) {
                console.error('CEP inválido: deve conter 8 dígitos');
                return null;
            }

            // Faz a requisição para a API ViaCEP
            const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);

            if (!response.ok) {
                console.error('Erro ao buscar CEP:', response.statusText);
                return null;
            }

            const data: ViaCEPResponse = await response.json();

            // Verifica se o CEP foi encontrado
            if (data.erro) {
                console.error('CEP não encontrado');
                return null;
            }

            // Retorna os dados formatados
            return {
                logradouro: data.logradouro || '',
                bairro: data.bairro || '',
                cidade: data.localidade || '',
                uf: data.uf || ''
            };
        } catch (error) {
            console.error('Erro ao buscar endereço pelo CEP:', error);
            return null;
        }
    }

    /**
     * Formata o CEP para o padrão 12345-678
     * @param cep - CEP sem formatação
     * @returns CEP formatado
     */
    formatCEP(cep: string): string {
        const cleanCEP = cep.replace(/\D/g, '');
        if (cleanCEP.length !== 8) return cep;
        return `${cleanCEP.slice(0, 5)}-${cleanCEP.slice(5)}`;
    }

    /**
     * Valida se o CEP está no formato correto
     * @param cep - CEP a ser validado
     * @returns true se válido, false caso contrário
     */
    isValidCEP(cep: string): boolean {
        const cleanCEP = cep.replace(/\D/g, '');
        return cleanCEP.length === 8;
    }
}

export default CEPService;
