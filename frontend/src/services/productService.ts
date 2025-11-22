import type { Product, ProductFormData } from '../types/products';
import { api } from './api';

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

  // NOVO: Buscar categorias únicas
  async getCategories(): Promise<string[]> {
    const products = await this.getAll();
    const categories = [...new Set(products.map(p => p.categoria).filter(Boolean))] as string[];
    return ['all', ...categories]; // 'all' sempre primeiro
  },

  async update(id: number, data: Partial<ProductFormData>): Promise<Product> {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
  }
};