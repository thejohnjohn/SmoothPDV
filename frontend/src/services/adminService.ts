import { api } from './api';
import type { Loja, Gerente, Vendedor } from '../types/admin';

export const adminService = {
  // ===== LOJAS =====
  async getLojas(): Promise<Loja[]> {
    const response = await api.get('/stores');
    return response.data;
  },

  async createLoja(loja: Omit<Loja, 'id' | 'criado_em'>): Promise<Loja> {
    const response = await api.post('/stores', loja);
    return response.data;
  },

  async updateLoja(id: number, loja: Partial<Loja>): Promise<Loja> {
    const response = await api.put(`/stores/${id}`, loja);
    return response.data;
  },

  async deleteLoja(id: number): Promise<void> {
    await api.delete(`/stores/${id}`);
  },

  // ===== GERENTES =====
  async getGerentes(): Promise<Gerente[]> {
    const response = await api.get('/users?tipo=GERENTE');
    return response.data;
  },

  async createGerente(gerente: Omit<Gerente, 'id' | 'criado_em'>): Promise<Gerente> {
    const response = await api.post('/users', {
      ...gerente,
      tipo: 'GERENTE'
    });
    return response.data.user;
  },

  async updateGerente(id: number, gerente: Partial<Gerente>): Promise<Gerente> {
    const response = await api.put(`/users/${id}`, {
      ...gerente,
      tipo: 'GERENTE'
    });
    return response.data;
  },

  async deleteGerente(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // ===== VENDEDORES =====
  async getVendedores(): Promise<Vendedor[]> {
    const response = await api.get('/users?tipo=VENDEDOR');
    return response.data;
  },

  async createVendedor(vendedor: Omit<Vendedor, 'id' | 'criado_em'>): Promise<Vendedor> {
    const response = await api.post('/users', {
      ...vendedor,
      tipo: 'VENDEDOR'
    });
    return response.data.user;
  },

  async updateVendedor(id: number, vendedor: Partial<Vendedor>): Promise<Vendedor> {
    const response = await api.put(`/users/${id}`, {
      ...vendedor,
      tipo: 'VENDEDOR'
    });
    return response.data;
  },

  async deleteVendedor(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // ===== DASHBOARD ADMIN =====
  async getAdminDashboard(startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/dashboard/admin?${params}`);
    return response.data;
  },

  // ===== ESTATÍSTICAS DA LOJA =====
  async getStoreStats(storeId: number) {
    const response = await api.get(`/stores/${storeId}/stats`);
    return response.data;
  }
};