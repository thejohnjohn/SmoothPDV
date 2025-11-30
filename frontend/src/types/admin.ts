export interface Loja {
  id: number;
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  status: 'ativo' | 'inativo';
  gerente_id?: number;
  criado_em: string;
}

export interface Gerente {
  id: number;
  nome: string;
  email: string;
  loja_id?: number;
  loja_nome?: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
}

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  loja_id: number;
  loja_nome?: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
}

export type CrudOperation = 'create' | 'update' | 'view';

// Tipos para formulários
export interface LojaFormData {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  email: string;
  status: 'ativo' | 'inativo';
}

export interface GerenteFormData {
  nome: string;
  email: string;
  loja_id?: number;
  status: 'ativo' | 'inativo';
}

export interface VendedorFormData {
  nome: string;
  email: string;
  loja_id: number;
  status: 'ativo' | 'inativo';
}

// Tipos para respostas da API
export interface AdminDashboardStats {
  totalLojas: number;
  totalGerentes: number;
  totalVendedores: number;
  lojasAtivas: number;
  gerentesAtivos: number;
  vendedoresAtivos: number;
}

// Tipos para filtros e busca
export interface AdminFilters {
  status?: 'ativo' | 'inativo';
  loja_id?: number;
  search?: string;
}

// Tipos para paginação
export interface AdminPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: AdminPagination;
}