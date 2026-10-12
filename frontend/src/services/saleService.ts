import type { Sale, CreateSaleData } from '../types/sales';
import { api } from './api';

export interface QuickSaleData {
  produtos: Array<{
    idmercadoria: number;
    quantidade: number;
  }>;
  metodo_pagamento: string;
  valor_pago?: number;
  observacao?: string;
}

export interface SellerStats {
  total_vendas: number;
  total_vendido: number;
  ticket_medio: number;
  produtos_cadastrados: number;
}

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

  async createQuickSale(data: QuickSaleData): Promise<Sale> {
    const response = await api.post('/seller/sales/quick', data);
    return response.data;
  },

  async getMyStats(): Promise<SellerStats> {
    const response = await api.get('/seller/stats');
    return response.data;
  }
};