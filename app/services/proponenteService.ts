import { collection, addDoc, doc, getDoc, getDocs, query, where, Timestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';

export interface ProponenteData {
    id?: string;
    tipo: 'fisica' | 'juridica' | 'coletivo';
    userId: string;
    userEmail: string;
    cityId: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    [key: string]: any; // For form-specific fields
}

export interface CityStatistics {
    cityId: string;
    cityName: string;
    cityUF: string;
    totalProponentes: number;
    fisica: number;
    juridica: number;
    coletivo: number;
}

export interface FilterOptions {
    sexo?: string;
    genero?: string;
    racaCorEtnia?: string;
    bairro?: string;
    principalAreaAtuacaoCultural?: string;
}

class ProponenteService {
    private static instance: ProponenteService;
    private collectionName = 'proponentes';

    private constructor() { }

    static getInstance(): ProponenteService {
        if (!ProponenteService.instance) {
            ProponenteService.instance = new ProponenteService();
        }
        return ProponenteService.instance;
    }

    /**
     * Save a new proponente to Firestore
     */
    async saveProponente(
        tipo: 'fisica' | 'juridica' | 'coletivo',
        formData: Record<string, any>,
        userId: string,
        userEmail: string,
        cityId: string
    ): Promise<string> {
        try {
            const now = Timestamp.now();

            const proponenteData: ProponenteData = {
                tipo,
                userId,
                userEmail,
                cityId,
                createdAt: now,
                updatedAt: now,
                ...formData
            };

            const docRef = await addDoc(collection(db, this.collectionName), proponenteData);

            console.log('Proponente saved successfully with ID:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('Error saving proponente:', error);
            throw new Error('Falha ao salvar proponente. Por favor, tente novamente.');
        }
    }

    /**
     * Get all proponentes for a specific user
     */
    async getProponentesByUser(userId: string): Promise<ProponenteData[]> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const proponentes: ProponenteData[] = [];

            querySnapshot.forEach((doc) => {
                proponentes.push({ id: doc.id, ...doc.data() } as ProponenteData);
            });

            return proponentes;
        } catch (error) {
            console.error('Error fetching proponentes:', error);
            throw new Error('Falha ao buscar proponentes.');
        }
    }

    /**
     * Get all proponentes for a specific city
     */
    async getProponentesByCity(cityId: string): Promise<ProponenteData[]> {
        try {
            const q = query(
                collection(db, this.collectionName),
                where('cityId', '==', cityId)
            );

            const querySnapshot = await getDocs(q);
            const proponentes: ProponenteData[] = [];

            querySnapshot.forEach((doc) => {
                proponentes.push({ id: doc.id, ...doc.data() } as ProponenteData);
            });

            return proponentes;
        } catch (error) {
            console.error('Error fetching proponentes by city:', error);
            throw new Error('Falha ao buscar proponentes da cidade.');
        }
    }

    /**
     * Get a specific proponente by ID
     */
    async getProponenteById(proponenteId: string): Promise<ProponenteData | null> {
        try {
            const docRef = doc(db, this.collectionName, proponenteId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as ProponenteData;
            }

            return null;
        } catch (error) {
            console.error('Error fetching proponente:', error);
            throw new Error('Falha ao buscar proponente.');
        }
    }

    /**
     * Update an existing proponente
     */
    async updateProponente(proponenteId: string, data: Partial<ProponenteData>): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, proponenteId);
            const updateData = {
                ...data,
                updatedAt: Timestamp.now()
            };

            await updateDoc(docRef, updateData);
            console.log('Proponente updated successfully');
        } catch (error) {
            console.error('Error updating proponente:', error);
            throw new Error('Falha ao atualizar proponente.');
        }
    }

    /**
     * Delete a proponente
     */
    async deleteProponente(proponenteId: string): Promise<void> {
        try {
            const docRef = doc(db, this.collectionName, proponenteId);
            await deleteDoc(docRef);
            console.log('Proponente deleted successfully');
        } catch (error) {
            console.error('Error deleting proponente:', error);
            throw new Error('Falha ao excluir proponente.');
        }
    }

    /**
     * Get statistics for a specific city with optional filters
     */
    async getCityStatistics(cityId: string, filters?: FilterOptions): Promise<CityStatistics | null> {
        try {
            // Get proponentes for this city
            let proponentes = await this.getProponentesByCity(cityId);

            // Apply filters if provided
            if (filters) {
                proponentes = this.applyFilters(proponentes, filters);
            }

            // Get city name and UF
            const citiesSnapshot = await getDocs(collection(db, 'cities'));
            let cityName = 'Cidade desconhecida';
            let cityUF = '';

            citiesSnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.cityId === cityId || doc.id === cityId) {
                    cityName = data.name || 'Cidade desconhecida';
                    cityUF = data.uf || '';
                }
            });

            // Count by type
            const stats: CityStatistics = {
                cityId,
                cityName,
                cityUF,
                totalProponentes: proponentes.length,
                fisica: 0,
                juridica: 0,
                coletivo: 0
            };

            proponentes.forEach((proponente) => {
                if (proponente.tipo === 'fisica') {
                    stats.fisica++;
                } else if (proponente.tipo === 'juridica') {
                    stats.juridica++;
                } else if (proponente.tipo === 'coletivo') {
                    stats.coletivo++;
                }
            });

            return stats;
        } catch (error) {
            console.error('Error fetching city statistics:', error);
            throw new Error('Falha ao buscar estatísticas da cidade.');
        }
    }

    /**
     * Apply filters to proponentes list
     */
    private applyFilters(proponentes: ProponenteData[], filters: FilterOptions): ProponenteData[] {
        return proponentes.filter((proponente: any) => {
            // Filter by sexo - stored in perfilDoProponente.informacoesDemograficas.sexo
            if (filters.sexo) {
                const sexo = proponente.perfilDoProponente?.informacoesDemograficas?.sexo;
                if (sexo !== filters.sexo) {
                    return false;
                }
            }

            // Filter by genero - stored in perfilDoProponente.informacoesDemograficas.genero
            if (filters.genero) {
                const genero = proponente.perfilDoProponente?.informacoesDemograficas?.genero;
                if (genero !== filters.genero) {
                    return false;
                }
            }

            // Filter by racaCorEtnia - stored in perfilDoProponente.informacoesDemograficas.racaCorEtnia
            if (filters.racaCorEtnia) {
                const racaCorEtnia = proponente.perfilDoProponente?.informacoesDemograficas?.racaCorEtnia;
                if (racaCorEtnia !== filters.racaCorEtnia) {
                    return false;
                }
            }

            // Filter by bairro - stored in endereco.bairro
            if (filters.bairro) {
                const proponenteBairro = (proponente.endereco?.bairro || '').trim();
                const filterBairro = filters.bairro.trim();
                if (proponenteBairro !== filterBairro) {
                    return false;
                }
            }

            // Filter by principalAreaAtuacaoCultural - stored in perfilDoProponente.experiencia.principalAreaAtuacaoCultural
            if (filters.principalAreaAtuacaoCultural) {
                const principalArea = proponente.perfilDoProponente?.experiencia?.principalAreaAtuacaoCultural;
                if (principalArea !== filters.principalAreaAtuacaoCultural) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * Get statistics of proponentes grouped by city
     */
    async getAllCitiesStatistics(): Promise<CityStatistics[]> {
        try {
            // Get all proponentes
            const querySnapshot = await getDocs(collection(db, this.collectionName));
            const proponentes: ProponenteData[] = [];

            querySnapshot.forEach((doc) => {
                proponentes.push({ id: doc.id, ...doc.data() } as ProponenteData);
            });

            // Get all cities
            const citiesSnapshot = await getDocs(collection(db, 'cities'));
            const citiesMap = new Map<string, { name: string; uf: string }>();

            citiesSnapshot.forEach((doc) => {
                const data = doc.data();
                citiesMap.set(data.cityId || doc.id, {
                    name: data.name || 'Cidade desconhecida',
                    uf: data.uf || ''
                });
            });

            // Group by city and count by type
            const statsMap = new Map<string, CityStatistics>();

            proponentes.forEach((proponente) => {
                const cityId = proponente.cityId;
                const cityData = citiesMap.get(cityId);
                const cityName = cityData?.name || 'Cidade desconhecida';
                const cityUF = cityData?.uf || '';

                if (!statsMap.has(cityId)) {
                    statsMap.set(cityId, {
                        cityId,
                        cityName,
                        cityUF,
                        totalProponentes: 0,
                        fisica: 0,
                        juridica: 0,
                        coletivo: 0
                    });
                }

                const stats = statsMap.get(cityId)!;
                stats.totalProponentes++;

                if (proponente.tipo === 'fisica') {
                    stats.fisica++;
                } else if (proponente.tipo === 'juridica') {
                    stats.juridica++;
                } else if (proponente.tipo === 'coletivo') {
                    stats.coletivo++;
                }
            });

            // Convert map to array and sort by total proponentes
            return Array.from(statsMap.values()).sort((a, b) => b.totalProponentes - a.totalProponentes);
        } catch (error) {
            console.error('Error fetching city statistics:', error);
            throw new Error('Falha ao buscar estatísticas das cidades.');
        }
    }
}

export default ProponenteService;
