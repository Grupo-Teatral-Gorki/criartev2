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

export interface ProjectTypesType {
  available: boolean;
  description: string;
  name: string;
  label: string;
}

export interface City {
  id: string;
  name: string;
  typesOfProjects?: ProjectTypesType[];
}

export interface UserProfile {
  id: string; // "123456789" (string)
  cityId: string; // "3842" (string)
  createdAt: string; // "18 de abril de 2025 às 10:35:36 UTC-3" (timestamp as string)
  email: string; // "teste@teste2.com" (string)
  firstName: string; // "firstName" (string)
  lastName: string; // "lastName" (string)
  phoneNumber: string; // "99-99999-9999" (string)
  userType: number;
  photoUrl: string; // "https://robohash.org/placeholder.png" (string)
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
