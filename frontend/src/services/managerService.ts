import { api } from './api';

export interface Manager {
  id: number;
  nome: string;
  email: string;
  loja_id?: number;
  loja_nome?: string;
  status: 'ativo' | 'inativo';
  criado_em: string;
}

export interface StoreProductsStats {
  total_produtos: number;
  produtos_ativos: number;
  valor_total_estoque: number;
}

export const managerService = {
  // ===== GERENTES =====
  async getAll(): Promise<Manager[]> {
    const response = await api.get('/managers');
    return response.data;
  },

  async getById(id: number): Promise<Manager> {
    const response = await api.get(`/managers/${id}`);
    return response.data;
  },

  async create(data: Omit<Manager, 'id' | 'criado_em'>): Promise<Manager> {
    const response = await api.post('/managers', data);
    return response.data;
  },

  async update(id: number, data: Partial<Manager>): Promise<Manager> {
    const response = await api.put(`/managers/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/managers/${id}`);
  },

  // ===== PRODUTOS DA LOJA =====
  async getStoreProducts(): Promise<any[]> {
    const response = await api.get('/store/products');
    return response.data;
  },

  async getStoreProductsStats(): Promise<StoreProductsStats> {
    const response = await api.get('/store/products/stats');
    return response.data;
  }
};