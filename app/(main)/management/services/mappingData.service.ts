import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { Agente, Coletivo, EspacoCultural, MappingData } from '../types/mapping.types';

/**
 * Service for fetching mapping data from Firestore
 * Implements Single Responsibility Principle and proper error handling
 */
export class MappingDataService {
  private static readonly COLLECTIONS = {
    AGENTES: "agentes",
    COLETIVOS: "coletivoSemCNPJ",
    ESPACOS: "espacoCultural"
  } as const;

  /**
   * Fetches all mapping data for a given city
   * @param cityId - The city identifier
   * @returns Promise with mapping data or throws error
   */
  static async fetchMappingData(cityId: string): Promise<MappingData> {
    if (!cityId) {
      throw new Error("City ID is required");
    }

    try {
      const [agentesSnap, coletivosSnap, espacosSnap] = await Promise.all([
        getDocs(query(collection(db, this.COLLECTIONS.AGENTES), where("cityId", "==", cityId))),
        getDocs(query(collection(db, this.COLLECTIONS.COLETIVOS), where("cityId", "==", cityId))),
        getDocs(query(collection(db, this.COLLECTIONS.ESPACOS), where("cityId", "==", cityId)))
      ]);

      return {
        agentes: this.transformDocuments<Agente>(agentesSnap.docs),
        coletivos: this.transformDocuments<Coletivo>(coletivosSnap.docs),
        espacos: this.transformDocuments<EspacoCultural>(espacosSnap.docs)
      };
    } catch (error) {
      console.error("Error fetching mapping data:", error);
      throw new Error("Erro ao carregar dados de mapeamento. Tente novamente.");
    }
  }

  /**
   * Transforms Firestore documents to typed objects
   * @param docs - Firestore document snapshots
   * @returns Array of typed documents
   */
  private static transformDocuments<T>(docs: any[]): T[] {
    return docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as T[];
  }
}
