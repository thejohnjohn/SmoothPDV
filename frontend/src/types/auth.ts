export interface User {
  id: number;
  nome: string;
  email: string;
  tipo: 'ADMIN' | 'GERENTE' | 'VENDEDOR';
  criado_em: string;
}

export interface LoginData {
  email: string;
  senha: string;
}

export interface AuthContextType {
  user: User | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  loading: boolean;
}