export interface LoginResponse {
  token: string;
  user: {
    data: {
      id: string;
      usuario: string;
      tipoUsuario: number;
      idCidade: string;
    };
  };
}

export interface User {
  id: string;
  cityId: string;
  email: string;
  role?: string;
}

export interface AuthContextType {
  token: string | null;
  user: LoginResponse["user"]["data"] | null;
  login: (data: LoginResponse) => void;
  logout: () => void;
}

export interface Project {
  numeroInscricao: string;
  nomeProjeto: string;
  numeroEdital: string;
  tituloEdital: string;
  modalidade: string;
  proponente: string;
  status: string;
  dataInicial: string;
  dataFinal: string;
}
