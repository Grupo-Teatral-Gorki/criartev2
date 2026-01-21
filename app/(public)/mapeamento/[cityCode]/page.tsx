"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTheme } from "@/app/context/ThemeContext";
import Link from "next/link";
import { Users, UserCircle, Building2, UsersRound, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";

interface MappingData {
  success: boolean;
  cityCode: string;
  total: number;
  countsByTipo: Record<string, number>;
}

export default function MapeamentoPage() {
  const { theme } = useTheme();
  const params = useParams();
  const cityCode = params.cityCode as string;

  const [data, setData] = useState<MappingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/mapping?cityCode=${cityCode}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erro ao carregar dados");
      }

      setData(result);
    } catch (err) {
      console.error("Error loading mapping data:", err);
      setError("Erro ao carregar dados de mapeamento. Por favor, tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cityCode) {
      loadData();
    }
  }, [cityCode]);

  const getTipoIcon = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "fisica":
        return <UserCircle className="w-8 h-8" />;
      case "juridica":
        return <Building2 className="w-8 h-8" />;
      case "coletivo":
        return <UsersRound className="w-8 h-8" />;
      default:
        return <Users className="w-8 h-8" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "fisica":
        return "from-green-500 to-green-600";
      case "juridica":
        return "from-blue-500 to-blue-600";
      case "coletivo":
        return "from-purple-500 to-purple-600";
      default:
        return "from-slate-500 to-slate-600";
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo.toLowerCase()) {
      case "fisica":
        return "Pessoa Física";
      case "juridica":
        return "Pessoa Jurídica";
      case "coletivo":
        return "Coletivo";
      case "sem_tipo":
        return "Sem Tipo";
      default:
        return tipo;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/20 to-accent-100/20 dark:from-primary-900/10 dark:to-accent-900/10"></div>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148, 163, 184, 0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        ></div>
      </div>

      {/* Logo */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="flex justify-center">
          <Link href="/">
            <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-soft border border-white/20 dark:border-slate-700/50">
              <Image
                src={
                  theme === "dark"
                    ? "https://firebasestorage.googleapis.com/v0/b/itapevi-cce4e.firebasestorage.app/o/criarte.png?alt=media&token=09310b4d-9035-406a-bc7c-4611d51190c5"
                    : "https://firebasestorage.googleapis.com/v0/b/itapevi-cce4e.firebasestorage.app/o/criarte_black.png?alt=media&token=cc531c98-6652-4a2d-9499-19b50ea70b0f"
                }
                alt="Logo Criarte"
                width={120}
                height={40}
                className="object-contain"
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-primary-500 border-t-transparent"></div>
            <p className="mt-6 text-lg text-slate-600 dark:text-slate-400">
              Carregando dados de mapeamento...
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-12 shadow-soft border border-white/20 dark:border-slate-700/50 max-w-2xl mx-auto">
              <p className="text-red-600 dark:text-red-400 text-lg mb-6">{error}</p>
              <button
                onClick={loadData}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-xl shadow-soft transition-all duration-200 hover:shadow-soft-lg hover:scale-[1.02]"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        ) : data ? (
          <>
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                Mapeamento Cultural
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Cidade: <span className="font-semibold">{cityCode}</span>
              </p>
            </div>

            {/* Total Card */}
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 mb-8">
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  <Users className="w-10 h-10" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Total de Proponentes
                  </p>
                  <p className="text-5xl font-bold text-slate-900 dark:text-white">
                    {data.total}
                  </p>
                </div>
              </div>
            </div>

            {/* Counts by Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Object.entries(data.countsByTipo).map(([tipo, count]) => (
                <div
                  key={tipo}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-soft border border-white/20 dark:border-slate-700/50"
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${getTipoColor(tipo)} text-white`}
                    >
                      {getTipoIcon(tipo)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                        {getTipoLabel(tipo)}
                      </p>
                      <p className="text-4xl font-bold text-slate-900 dark:text-white">
                        {count}
                      </p>
                      {data.total > 0 && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                          {Math.round((count / data.total) * 100)}%
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution Chart */}
            {data.total > 0 && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-soft border border-white/20 dark:border-slate-700/50 mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                  Distribuição por Tipo
                </h2>
                <div className="space-y-6">
                  {Object.entries(data.countsByTipo).map(([tipo, count]) => (
                    <div key={tipo}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {getTipoLabel(tipo)}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">
                          {count} ({Math.round((count / data.total) * 100)}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${getTipoColor(tipo)} rounded-full transition-all duration-500`}
                          style={{ width: `${(count / data.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Dados não encontrados.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
