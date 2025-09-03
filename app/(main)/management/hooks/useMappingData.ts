import { useState, useEffect } from 'react';
import { MappingData, FetchState } from '../types/mapping.types';
import { MappingDataService } from '../services/mappingData.service';

/**
 * Custom hook for managing mapping data state
 * Implements separation of concerns and proper state management
 */
export const useMappingData = (cityId: string | undefined) => {
  const [data, setData] = useState<MappingData>({
    agentes: [],
    coletivos: [],
    espacos: []
  });

  const [state, setState] = useState<FetchState>({
    loading: false,
    error: null
  });

  useEffect(() => {
    const loadData = async () => {
      if (!cityId) {
        setData({ agentes: [], coletivos: [], espacos: [] });
        return;
      }

      setState({ loading: true, error: null });

      try {
        const mappingData = await MappingDataService.fetchMappingData(cityId);
        setData(mappingData);
        setState({ loading: false, error: null });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        setState({ loading: false, error: errorMessage });
        setData({ agentes: [], coletivos: [], espacos: [] });
      }
    };

    loadData();
  }, [cityId]);

  return {
    data,
    loading: state.loading,
    error: state.error,
    counts: {
      agentes: data.agentes.length,
      coletivos: data.coletivos.length,
      espacos: data.espacos.length
    }
  };
};
