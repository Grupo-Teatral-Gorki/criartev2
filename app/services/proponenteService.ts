import { collection, addDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
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
}

export default ProponenteService;
