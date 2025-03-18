const API_BASE_URL = "https://api.grupogorki.com.br/api/";

type RequestMethod = "GET" | "POST" | "PUT" | "DELETE";

const request = async <TResponse, TBody = undefined>(
  url: string,
  method: RequestMethod,
  token: string,
  body?: TBody
): Promise<TResponse> => {
  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.statusText}`);
    }

    return (await response.json()) as TResponse;
  } catch (error) {
    console.error(`Erro ao fazer ${method} em ${url}:`, error);
    throw error;
  }
};

export const api = {
  get: <TResponse>(url: string, token: string) =>
    request<TResponse>(url, "GET", token),
  post: <TResponse, TBody extends Record<string, unknown>>(
    url: string,
    token: string,
    body: TBody
  ) => request<TResponse, TBody>(url, "POST", token, body),
  put: <TResponse, TBody extends Record<string, unknown>>(
    url: string,
    token: string,
    body: TBody
  ) => request<TResponse, TBody>(url, "PUT", token, body),
  del: <TResponse>(url: string, token: string) =>
    request<TResponse>(url, "DELETE", token),
};

const i = {
  projeto: {
    id_area: 1,
    ingresso: false,
    id_edital: 1,
    classificacao_indicativa: "Livre",
    nome_modalidade: "",
    id_modalidade: 1,
    resumo_projeto: "Resumo do projeto",
    descricao: "Descrição detalhada do projeto",
    objetivos: "Objetivos do projeto",
    justificativa_projeto: "Justificativa para o projeto",
    contrapartida_projeto: "Contrapartida oferecida pelo projeto",
    plano_democratizacao: "Plano de democratização",
    outras_informacoes: "Outras informações relevantes",

    valor_ingresso: "0.00",

    status: null,
    id_usuario: 333,
    relevancia_pertinencia: "Relevância e pertinência do projeto",
    perfil_publico: "Perfil do público-alvo",

    qtd_publico: "100",
    proposta_contrapartida: "Proposta de contrapartida detalhada",
    plano_divulgacao: "Plano de divulgação do projeto",
    nome_modalidade: "",
    is_cotista: false,
  },
};
