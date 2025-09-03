// Core domain types for mapping functionality
export interface BaseDocument {
  id: string;
  cityId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Specific document types
export interface Agente extends BaseDocument {
  nomeCompleto?: string;
  nomeSocial?: string;
  nome?: string;
  email?: string;
  dddTelefone?: string;
  telefone?: string;
  phone?: string;
  representacao?: {
    nomeSocial?: string;
    email?: string;
    dddTelefone?: string;
  };
}

export interface Coletivo extends BaseDocument {
  nomeCompleto?: string;
  contatoColetivo?: string;
  responsavelColetivo?: string;
  emailContato?: string;
  email?: string;
  telefoneCelular?: string;
  telefone?: string;
}

export interface EspacoCultural extends BaseDocument {
  nomeCompleto?: string;
  entidadeCultural?: {
    nomeEntidadeCultural?: string;
    emailEntidadeCultural?: string;
    dddTelefone?: string;
  };
  representacao?: {
    nomeSocial?: string;
    email?: string;
    dddTelefone?: string;
  };
}

// Union type for all document types
export type MappingDocument = Agente | Coletivo | EspacoCultural;

// Tab configuration
export type TabType = 'agentes' | 'coletivos' | 'espacos';

export interface TabConfig {
  id: TabType;
  label: string;
  count: number;
}

// API and state types
export interface FetchState {
  loading: boolean;
  error: string | null;
}

export interface MappingData {
  agentes: Agente[];
  coletivos: Coletivo[];
  espacos: EspacoCultural[];
}

// Field extraction configuration
export interface FieldExtractor<T extends BaseDocument> {
  getName: (doc: T) => string | undefined;
  getEmail: (doc: T) => string | undefined;
  getPhone: (doc: T) => string | undefined;
}

// Search functionality
export interface SearchableItem {
  id: string;
  name: string;
  email: string;
  phone: string;
}

// Component props
export interface DataTabProps<T extends BaseDocument> {
  title: string;
  data: T[];
  loading: boolean;
  error: string | null;
  fieldExtractor: FieldExtractor<T>;
}
