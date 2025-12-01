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
  loja_id?: number;        // 🆕 Manter para compatibilidade com frontend
  id_loja?: number;        // 🆕 NOVO: Para compatibilidade com backend
  loja_nome?: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
}

// 🆕 NOVO: Tipo para criação de gerente com senha
export interface GerenteCreateData {
  nome: string;
  email: string;
  senha: string;
  loja_id?: number;
  id_loja?: number;
  status?: 'ativo' | 'inativo';
}

export interface Vendedor {
  id: number;
  nome: string;
  email: string;
  loja_id: number;
  id_loja?: number; // 🆕 Para compatibilidade com backend
  loja_nome?: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
}

// 🆕 CORREÇÃO: Tipo mais flexível para criação de vendedor
export interface VendedorCreateData {
  nome: string;
  email: string;
  senha: string;
  loja_id?: string | number; // Para o formulário (pode ser string do select)
  id_loja?: number; // Para o backend
  status?: 'ativo' | 'inativo';
}

// 🆕 CORREÇÃO: Tipo específico para atualização (senha opcional)
export interface VendedorUpdateData {
  nome?: string;
  email?: string;
  senha?: string; // Opcional na atualização
  loja_id?: string | number;
  id_loja?: number;
  status?: 'ativo' | 'inativo';
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