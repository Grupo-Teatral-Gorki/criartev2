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
