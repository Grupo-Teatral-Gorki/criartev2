import { LoginResponse } from "./interfaces";
import { setCookie, deleteCookie } from "cookies-next";

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
      setCookie("token", data.token, {
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      setCookie("userDetails", data.user.data, {
        maxAge: 60 * 60 * 24, // 1 day
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
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

export const logoutUser = () => {
  try {
    deleteCookie("token"); // Remove o token armazenado no cookie
    console.log("Logout realizado com sucesso.");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
};
