export interface Loja {
  id: number;
  nome: string;
  endereco: string;
  telefone: string;
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