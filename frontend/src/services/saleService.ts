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
    // Garantir que o pagamento tenha método
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
  }
};