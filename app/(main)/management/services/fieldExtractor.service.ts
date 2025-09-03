import { Agente, Coletivo, EspacoCultural, FieldExtractor } from '../types/mapping.types';

/**
 * Utility function to safely extract nested values from objects
 * Follows the Single Responsibility Principle
 */
export const getNestedValue = (obj: any, paths: string[]): string | undefined => {
  for (const path of paths) {
    const value = path
      .split(".")
      .reduce((acc: any, key: string) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

/**
 * Field extractors for each document type
 * Implements Strategy Pattern for different extraction logic
 */
export const agenteFieldExtractor: FieldExtractor<Agente> = {
  getName: (doc: Agente) => 
    getNestedValue(doc, ["nomeCompleto", "nomeSocial", "nome", "representacao.nomeSocial"]),
  
  getEmail: (doc: Agente) => 
    getNestedValue(doc, ["email", "representacao.email"]),
  
  getPhone: (doc: Agente) => 
    getNestedValue(doc, ["dddTelefone", "telefone", "phone", "representacao.dddTelefone"])
};

export const coletivoFieldExtractor: FieldExtractor<Coletivo> = {
  getName: (doc: Coletivo) => 
    getNestedValue(doc, ["nomeCompleto", "contatoColetivo", "responsavelColetivo"]),
  
  getEmail: (doc: Coletivo) => 
    getNestedValue(doc, ["emailContato", "email"]),
  
  getPhone: (doc: Coletivo) => 
    getNestedValue(doc, ["telefoneCelular", "telefone"])
};

export const espacoFieldExtractor: FieldExtractor<EspacoCultural> = {
  getName: (doc: EspacoCultural) => 
    getNestedValue(doc, [
      "nomeCompleto",
      "entidadeCultural.nomeEntidadeCultural",
      "representacao.nomeSocial"
    ]),
  
  getEmail: (doc: EspacoCultural) => 
    getNestedValue(doc, [
      "entidadeCultural.emailEntidadeCultural", 
      "representacao.email"
    ]),
  
  getPhone: (doc: EspacoCultural) => 
    getNestedValue(doc, [
      "entidadeCultural.dddTelefone", 
      "representacao.dddTelefone"
    ])
};
