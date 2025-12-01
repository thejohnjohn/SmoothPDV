import type { Sale, CreateSaleData } from '../types/sales';
import { api } from './api';

export const saleService = {
  async getAll(): Promise<Sale[]> {
    const response = await api.get('/sales');
    return response.data;
  },

  async getById(id: number): Promise<Sale> {
    const response = await api.get(`/sales/${id}`);
    return response.data;
  },

  async create(data: CreateSaleData): Promise<Sale> {
    const saleData = {
      ...data,
      pagamento: {
        ...data.pagamento,
        metodo_pagamento: data.pagamento.metodo_pagamento || 'DINHEIRO',
        status: data.pagamento.status || 'APROVADO'
      }
    };

    const response = await api.post('/sales', saleData);
    return response.data;
  },

  // ===== MÉTODOS ESPECÍFICOS PARA VENDEDORES =====
  async getMySales(): Promise<Sale[]> {
    const response = await api.get('/seller/sales');
    return response.data;
  },

  async getMySaleById(id: number): Promise<Sale> {
    const response = await api.get(`/seller/sales/${id}`);
    return response.data;
  },

  async createQuickSale(data: any): Promise<Sale> {
    const response = await api.post('/seller/sales/quick', data);
    return response.data;
  },

  async getMyStats(): Promise<any> {
    const response = await api.get('/seller/stats');
    return response.data;
  }
};