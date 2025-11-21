import { Sale } from '../types/sales';
import { api } from './api';

export interface CreateSaleData {
  data: string;
  id_cliente: number;
  itens: Array<{
    quantidade: number;
    idmercadoria: number;
  }>;
  pagamento: {
    data: string;
    valor: number;
  };
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
    const response = await api.post('/sales', data);
    return response.data;
  }
};