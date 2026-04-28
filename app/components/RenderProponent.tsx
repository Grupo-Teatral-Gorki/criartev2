"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/config/firebaseconfig";
import { Loader2, User, Building2, Users as UsersIcon } from "lucide-react";

interface RenderProponentProps {
  proponentId?: string | null;
}

type ProponenteDoc = {
  tipo?: "fisica" | "juridica" | "coletivo";
  userEmail?: string;
  dadosPessoais?: Record<string, any>;
  dadosPessoaJuridica?: Record<string, any>;
  dadosColetivo?: Record<string, any>;
  endereco?: Record<string, any>;
  enderecoPessoaJuridica?: Record<string, any>;
  enderecoResponsavel?: Record<string, any>;
  [key: string]: any;
};

const FIELD_LABELS: Record<string, string> = {
  nomeCompleto: "Nome Completo",
  nomeSocial: "Nome Social",
  CPF: "CPF",
  cpf: "CPF",
  RG: "RG",
  rg: "RG",
  dataNascimento: "Data de Nascimento",
  email: "E-mail",
  celular: "Celular",
  telefone: "Telefone",
  razaoSocial: "Razão Social",
  nomeFantasia: "Nome Fantasia",
  CNPJ: "CNPJ",
  cnpj: "CNPJ",
  nomeColetivo: "Nome do Coletivo",
  CEP: "CEP",
  cep: "CEP",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  uf: "UF",
  zona: "Zona",
  sexo: "Sexo",
  genero: "Gênero",
  racaCorEtnia: "Raça/Cor/Etnia",
  escolaridade: "Escolaridade",
  rendaMensal: "Renda Mensal",
  principalAreaAtuacaoCultural: "Principal Área de Atuação Cultural",
};

const formatLabel = (key: string): string => {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
};

const formatValue = (value: any): string => {
  if (value === null || value === undefined || value === "") return "-";
  if (Array.isArray(value)) return value.join(", ") || "-";
  if (typeof value === "boolean") return value ? "Sim" : "Não";
  if (value === "true") return "Sim";
  if (value === "false") return "Não";
  if (typeof value === "object") {
    if (typeof value.toDate === "function") {
      try {
        return value.toDate().toLocaleString("pt-BR");
      } catch {
        return String(value);
      }
    }
    return JSON.stringify(value);
  }
  return String(value);
};

const getTipoLabel = (tipo?: string) => {
  switch (tipo) {
    case "fisica":
      return "Pessoa Física";
    case "juridica":
      return "Pessoa Jurídica";
    case "coletivo":
      return "Coletivo sem CNPJ";
    default:
      return "Proponente";
  }
};

const getTipoIcon = (tipo?: string) => {
  switch (tipo) {
    case "fisica":
      return User;
    case "juridica":
      return Building2;
    case "coletivo":
      return UsersIcon;
    default:
      return User;
  }
};

const getProponenteName = (data: ProponenteDoc): string => {
  return (
    data?.dadosPessoais?.nomeCompleto ||
    data?.dadosPessoaJuridica?.razaoSocial ||
    data?.dadosColetivo?.nomeColetivo ||
    data?.fullName ||
    data?.corporateName ||
    "Proponente sem nome"
  );
};

const getMainData = (data: ProponenteDoc): Record<string, any> => {
  if (data.tipo === "fisica") return data.dadosPessoais || {};
  if (data.tipo === "juridica") return data.dadosPessoaJuridica || {};
  if (data.tipo === "coletivo") return data.dadosColetivo || {};
  return {};
};

const getAddressData = (data: ProponenteDoc): Record<string, any> => {
  return (
    data.endereco ||
    data.enderecoPessoaJuridica ||
    data.enderecoResponsavel ||
    {}
  );
};

const ADDRESS_KEYS = new Set([
  "CEP",
  "cep",
  "logradouro",
  "numero",
  "complemento",
  "bairro",
  "cidade",
  "uf",
  "zona",
]);

const splitMainAndAddress = (main: Record<string, any>) => {
  const address: Record<string, any> = {};
  const rest: Record<string, any> = {};
  Object.entries(main).forEach(([key, value]) => {
    if (ADDRESS_KEYS.has(key)) {
      address[key] = value;
    } else {
      rest[key] = value;
    }
  });
  return { address, rest };
};

const DataGrid: React.FC<{ data: Record<string, any> }> = ({ data }) => {
  const entries = Object.entries(data).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Nenhum dado informado.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50"
        >
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatLabel(key)}
          </p>
          <p className="font-medium text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-words">
            {formatValue(value)}
          </p>
        </div>
      ))}
    </div>
  );
};

const RenderProponent: React.FC<RenderProponentProps> = ({ proponentId }) => {
  const [loading, setLoading] = useState(false);
  const [proponente, setProponente] = useState<ProponenteDoc | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!proponentId) {
        setProponente(null);
        setNotFound(false);
        return;
      }

      setLoading(true);
      setNotFound(false);
      try {
        const ref = doc(db, "proponentes", proponentId);
        const snap = await getDoc(ref);
        if (cancelled) return;
        if (snap.exists()) {
          setProponente(snap.data() as ProponenteDoc);
        } else {
          setProponente(null);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error loading proponente:", error);
        if (!cancelled) {
          setProponente(null);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [proponentId]);

  if (!proponentId) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p className="font-medium">
            Este projeto ainda não possui um proponente cadastrado.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full p-4 flex justify-center items-center py-12">
        <Loader2 className="animate-spin text-primary-600" size={32} />
      </div>
    );
  }

  if (notFound || !proponente) {
    return (
      <div className="w-full p-4">
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <p className="font-medium">
            O proponente vinculado a este projeto não foi encontrado (ID:{" "}
            <span className="font-mono text-xs">{proponentId}</span>).
          </p>
        </div>
      </div>
    );
  }

  const Icon = getTipoIcon(proponente.tipo);
  const main = getMainData(proponente);
  const { address: inlineAddress, rest: mainRest } = splitMainAndAddress(main);
  const dedicatedAddress = getAddressData(proponente);
  const address = { ...inlineAddress, ...dedicatedAddress };

  return (
    <div className="w-full p-4">
      {/* Header card */}
      <div className="mb-6 flex items-start gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
        <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
          <Icon className="text-primary-600 dark:text-primary-400" size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {getTipoLabel(proponente.tipo)}
          </p>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 break-words">
            {getProponenteName(proponente)}
          </h3>
          {proponente.userEmail && (
            <p className="text-sm text-slate-500 dark:text-slate-400 break-all">
              Conta: {proponente.userEmail}
            </p>
          )}
        </div>
      </div>

      {/* Main data */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
          Dados do Proponente
        </h3>
        <DataGrid data={mainRest} />
      </div>

      {/* Address */}
      {Object.keys(address).length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">
            Endereço
          </h3>
          <DataGrid data={address} />
        </div>
      )}
    </div>
  );
};

export default RenderProponent;
