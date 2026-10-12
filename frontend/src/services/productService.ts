import type { Product, ProductFormData } from '../types/products';
import { api } from './api';

export interface StoreProductsStats {
  estatisticas_gerais: {
    total_produtos: number;
    produtos_vendidos: number;
    total_vendido: number;
    faturamento_produtos: string | number;
    produtos_nao_vendidos: number;
  };
  produtos_mais_vendidos: Array<{
    id: number;
    descricao: string;
    preco: string | number;
    total_vendido: string | number;
    faturamento: string | number;
  }>;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await api.get('/products');
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  async create(data: ProductFormData): Promise<Product> {
    const response = await api.post('/products', data);
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const products = await this.getAll();
    const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))] as string[];
    return ['all', ...categories];
  },

  async update(id: number, data: Partial<ProductFormData>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  },

  // ===== MÉTODOS ESPECÍFICOS PARA GERENTES =====
  async getStoreProducts(): Promise<Product[]> {
    const response = await api.get('/store/products');
    return response.data;
  },

  async getStoreProductsStats(): Promise<StoreProductsStats> {
    const response = await api.get('/store/products/stats');
    return response.data;
  }
};