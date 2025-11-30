import { api } from './api';
import type { Loja, Gerente, Vendedor } from '../types/admin';

export const adminService = {
  // ===== LOJAS =====
  async getLojas(): Promise<Loja[]> {
    const response = await api.get('/stores');
    return response.data;
  },

  async getLojaById(id: number): Promise<Loja> {
    const response = await api.get(`/stores/${id}`);
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

  async updateLojaStatus(id: number, status: 'ativo' | 'inativo'): Promise<Loja> {
    const response = await api.patch(`/stores/${id}/status`, { status });
    return response.data;
  },

  // ===== GERENTES ===== (MANTIDO PARA COMPATIBILIDADE - usar managerService para novas implementações)
  async getGerentes(): Promise<Gerente[]> {
    const response = await api.get('/managers');
    return response.data;
  },

  async createGerente(gerente: Omit<Gerente, 'id' | 'criado_em'>): Promise<Gerente> {
    const response = await api.post('/managers', gerente);
    return response.data;
  },

  async updateGerente(id: number, gerente: Partial<Gerente>): Promise<Gerente> {
    const response = await api.put(`/managers/${id}`, gerente);
    return response.data;
  },

  async deleteGerente(id: number): Promise<void> {
    await api.delete(`/managers/${id}`);
  },

  // ===== VENDEDORES ===== (MANTIDO PARA COMPATIBILIDADE - usar sellerService para novas implementações)
  async getVendedores(): Promise<Vendedor[]> {
    const response = await api.get('/sellers');
    return response.data;
  },

  async getVendedorById(id: number): Promise<Vendedor> {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
  },

  async createVendedor(vendedor: Omit<Vendedor, 'id' | 'criado_em'>): Promise<Vendedor> {
    const response = await api.post('/sellers', vendedor);
    return response.data;
  },

  async updateVendedor(id: number, vendedor: Partial<Vendedor>): Promise<Vendedor> {
    const response = await api.put(`/sellers/${id}`, vendedor);
    return response.data;
  },

  async deleteVendedor(id: number): Promise<void> {
    await api.delete(`/sellers/${id}`);
  },

  async getVendedorStats(id: number): Promise<any> {
    const response = await api.get(`/sellers/${id}/stats`);
    return response.data;
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