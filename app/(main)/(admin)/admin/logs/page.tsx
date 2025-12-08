"use client";
import React, { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../../../../config/firebaseconfig";
import { UserLog, UserLogWithId, LogEntry } from "../../../../types/logging";
import { Search, Filter, Calendar, User, FileText, Clock, AlertCircle } from "lucide-react";
import Button from "../../../../components/Button";
import { getActionDisplayName } from "../../../../utils/actionTranslations";
import LoggingService from "../../../../services/loggingService";
import { useAuth } from "../../../../context/AuthContext";

interface LogsPageState {
  logs: UserLogWithId[];
  filteredLogs: UserLogWithId[];
  loading: boolean;
  error: string | null;
  searchEmail: string;
  selectedAction: string;
  dateFilter: string;
  currentPage: number;
  logsPerPage: number;
}

const LogsPage: React.FC = () => {
  const { user } = useAuth();
  const [state, setState] = useState<LogsPageState>({
    logs: [],
    filteredLogs: [],
    loading: true,
    error: null,
    searchEmail: "",
    selectedAction: "",
    dateFilter: "",
    currentPage: 1,
    logsPerPage: 10,
  });

  const actionTypes = [
    "clique_botao",
    "tentativa_upload",
    "upload_sucesso",
    "upload_falha",
    "navegacao",
    "login",
    "logout",
    "tentativa_login",
    "login_falha",
    "registro_usuario",
    "registro_falha",
    "envio_formulario",
    "abrir_modal",
    "fechar_modal",
    "busca",
    "download",
    "excluir",
    "editar",
    "visualizar",
    "criar_projeto",
    "enviar_projeto",
    "atualizar_projeto",
    "selecionar_tipo_projeto",
    "envio_email",
    "recuperacao_senha",
    "recuperacao_senha_falha"
  ] as const;

  const fetchLogs = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Check if user is admin first
      if (!user?.email) {
        throw new Error("Usuário não autenticado");
      }

      const loggingService = LoggingService.getInstance();
      const isAdmin = await loggingService.isUserAdmin(user.email);

      if (!isAdmin) {
        throw new Error("Acesso negado: apenas administradores podem visualizar todos os logs");
      }

      // Use the admin method to get all user logs
      const allUserLogs = await loggingService.getAllUserLogs();

      // Process the logs to ensure timestamps are properly formatted
      const processedLogs = allUserLogs.map(userLog => ({
        ...userLog,
        logs: userLog.logs.map(log => ({
          ...log,
          timestamp: (log.timestamp as any)?.toDate ? (log.timestamp as any).toDate() : new Date(log.timestamp || Date.now())
        })),
        createdAt: (userLog.createdAt as any)?.toDate ? (userLog.createdAt as any).toDate() : new Date(userLog.createdAt || Date.now()),
        updatedAt: (userLog.updatedAt as any)?.toDate ? (userLog.updatedAt as any).toDate() : new Date(userLog.updatedAt || Date.now())
      }));

      setState(prev => ({
        ...prev,
        logs: processedLogs,
        filteredLogs: processedLogs,
        loading: false
      }));
    } catch (error: any) {
      console.error("Error fetching logs:", error);
      setState(prev => ({
        ...prev,
        error: error.message || "Erro ao carregar logs",
        loading: false
      }));
    }
  };

  const applyFilters = () => {
    let filtered = [...state.logs];

    // Filter by email
    if (state.searchEmail.trim()) {
      filtered = filtered.filter(log =>
        log.user.toLowerCase().includes(state.searchEmail.toLowerCase())
      );
    }

    // Filter by action type
    if (state.selectedAction) {
      filtered = filtered.filter(log =>
        log.logs.some(entry => entry.action === state.selectedAction)
      );
    }

    // Filter by date
    if (state.dateFilter) {
      const filterDate = new Date(state.dateFilter);
      filtered = filtered.filter(log =>
        log.logs.some(entry => {
          const entryDate = new Date(entry.timestamp);
          return entryDate.toDateString() === filterDate.toDateString();
        })
      );
    }

    setState(prev => ({ ...prev, filteredLogs: filtered, currentPage: 1 }));
  };

  const clearFilters = () => {
    setState(prev => ({
      ...prev,
      searchEmail: "",
      selectedAction: "",
      dateFilter: "",
      filteredLogs: prev.logs,
      currentPage: 1
    }));
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "Data inválida";
    }
    return date.toLocaleString("pt-BR");
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "tentativa_upload":
      case "upload_sucesso":
      case "upload_falha":
        return <FileText className="w-4 h-4" />;
      case "login":
      case "logout":
        return <User className="w-4 h-4" />;
      case "criar_projeto":
      case "enviar_projeto":
      case "atualizar_projeto":
      case "selecionar_tipo_projeto":
        return <FileText className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "upload_sucesso":
      case "login":
      case "criar_projeto":
      case "enviar_projeto":
      case "recuperacao_senha":
        return "text-success-600 bg-success-50";
      case "upload_falha":
      case "logout":
      case "login_falha":
      case "recuperacao_senha_falha":
        return "text-error-600 bg-error-50";
      case "tentativa_upload":
      case "tentativa_login":
      case "atualizar_projeto":
      case "selecionar_tipo_projeto":
        return "text-warning-600 bg-warning-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  // Pagination
  const totalPages = Math.ceil(state.filteredLogs.length / state.logsPerPage);
  const startIndex = (state.currentPage - 1) * state.logsPerPage;
  const endIndex = startIndex + state.logsPerPage;
  const currentLogs = state.filteredLogs.slice(startIndex, endIndex);

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [state.searchEmail, state.selectedAction, state.dateFilter, state.logs]);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Logs do Sistema
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Visualize e filtre todas as ações dos usuários na plataforma
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary-600" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Filtros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Email Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email do Usuário
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={state.searchEmail}
                  onChange={(e) => setState(prev => ({ ...prev, searchEmail: e.target.value }))}
                  placeholder="Filtrar por email..."
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Tipo de Ação
              </label>
              <select
                value={state.selectedAction}
                onChange={(e) => setState(prev => ({ ...prev, selectedAction: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Todas as ações</option>
                {actionTypes.map(action => (
                  <option key={action} value={action}>
                    {getActionDisplayName(action)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Data
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={state.dateFilter}
                  onChange={(e) => setState(prev => ({ ...prev, dateFilter: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              label="Limpar Filtros"
              onClick={clearFilters}
              variant="outlined"
              size="small"
            />
            <Button
              label="Atualizar"
              onClick={fetchLogs}
              size="small"
            />
          </div>
        </div>

        {/* Error State */}
        {state.error && (
          <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-error-600" />
              <p className="text-error-700 dark:text-error-400">{state.error}</p>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Mostrando {currentLogs.length} de {state.filteredLogs.length} usuários
          </p>
        </div>

        {/* Logs Display */}
        <div className="space-y-4">
          {currentLogs.map((userLog, index) => (
            <div key={userLog.user} className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft overflow-hidden">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                      <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {userLog.user}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {userLog.logs.length} ações registradas
                      </p>
                    </div>
                  </div>
                  <div className="text-right text-sm text-slate-500 dark:text-slate-500">
                    <p>Última atividade: {formatTimestamp(userLog.updatedAt)}</p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {userLog.logs
                    .filter(log => !state.selectedAction || log.action === state.selectedAction)
                    .filter(log => !state.dateFilter || new Date(log.timestamp).toDateString() === new Date(state.dateFilter).toDateString())
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 10)
                    .map((log, logIndex) => (
                      <div key={logIndex} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                        <div className={`p-1.5 rounded-lg ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-slate-900 dark:text-slate-100">
                              {getActionDisplayName(log.action)}
                            </span>
                            {log.filename && (
                              <span className="text-xs bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400">
                                {log.filename}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {formatTimestamp(log.timestamp)}
                          </p>
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                              {JSON.stringify(log.metadata, null, 2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              label="Anterior"
              onClick={() => setState(prev => ({ ...prev, currentPage: Math.max(1, prev.currentPage - 1) }))}
              disabled={state.currentPage === 1}
              variant="outlined"
              size="small"
            />
            <span className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400">
              Página {state.currentPage} de {totalPages}
            </span>
            <Button
              label="Próxima"
              onClick={() => setState(prev => ({ ...prev, currentPage: Math.min(totalPages, prev.currentPage + 1) }))}
              disabled={state.currentPage === totalPages}
              variant="outlined"
              size="small"
            />
          </div>
        )}

        {/* Empty State */}
        {state.filteredLogs.length === 0 && !state.loading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
              Nenhum log encontrado
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Tente ajustar os filtros ou verificar se há dados disponíveis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LogsPage;
