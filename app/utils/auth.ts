import { LoginResponse } from "./interfaces";

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse | null> => {
  try {
    const response = await fetch(
      "https://api.grupogorki.com.br/api/usuarios/authenticate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario: email, senha: password }),
      }
    );

    if (!response.ok) {
      console.error("Falha no login:", response.status);
      return null;
    }

    const data: LoginResponse = await response.json();

    if (data.token) {
      return data; // Retorna o objeto `LoginResponse`
    } else {
      console.error("Falha no login:", data);
      return null;
    }
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return null;
  }
};

export const registerUser = async (
  email: string,
  password: string,
  idCidade: string
): Promise<LoginResponse | null> => {
  try {
    const response = await fetch(
      "https://api.grupogorki.com.br/api/usuarios/createuser",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ usuario: email, senha: password, idCidade }),
      }
    );

    if (!response.ok) {
      const data = await response.json();
      console.error("Falha no registro:", data);
      return null;
    }

    console.log("Registro bem-sucedido, tentando login...");

    // Tenta logar automaticamente
    return await loginUser(email, password);
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    return null;
  }
};
