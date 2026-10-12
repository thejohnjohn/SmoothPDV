import { api } from './api';
import type { Loja, Gerente, Vendedor, VendedorCreateData, GerenteCreateData } from '../types/admin';

interface GerenteUpdatePayload {
  nome?: string;
  email?: string;
  id_loja?: number;
}

interface VendedorUpdatePayload {
  nome?: string;
  email?: string;
  senha?: string;
  id_loja?: number;
  status?: 'ativo' | 'inativo';
}

export interface VendedorStats {
  total_vendas: number;
  total_vendido: number;
  ticket_medio: number;
  produtos_cadastrados: number;
}

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
    const response = await api.patch(`/stores/${id}/status`, { ativo: status === 'ativo' });
    return response.data;
  },

  // ===== GERENTES ===== (CORRIGIDO)
  async getGerentes(): Promise<Gerente[]> {
    const response = await api.get('/managers');
    return response.data;
  },

  async createGerente(gerente: GerenteCreateData): Promise<Gerente> {
    // 🆕 CORREÇÃO: Converter para o formato esperado pelo backend
    const gerenteData = {
      nome: gerente.nome,
      email: gerente.email,
      senha: gerente.senha, // 🆕 Campo obrigatório
      id_loja: gerente.loja_id // 🆕 Corrigir nome do campo
    };

    console.log('📤 Enviando dados do gerente para o backend:', gerenteData);

    const response = await api.post('/managers', gerenteData);
    return response.data;
  },

  async updateGerente(id: number, gerente: Partial<Gerente>): Promise<Gerente> {
    // 🆕 CORREÇÃO: Converter para o formato esperado pelo backend
    const gerenteData: GerenteUpdatePayload = {};
    
    if (gerente.nome) gerenteData.nome = gerente.nome;
    if (gerente.email) gerenteData.email = gerente.email;
    if (gerente.loja_id) gerenteData.id_loja = gerente.loja_id;

    console.log('📤 Enviando atualização do gerente:', gerenteData);

    const response = await api.put(`/managers/${id}`, gerenteData);
    return response.data;
  },

  async deleteGerente(id: number): Promise<void> {
    await api.delete(`/managers/${id}`);
  },

  // ===== VENDEDORES =====
  async getVendedores(): Promise<Vendedor[]> {
    const response = await api.get('/sellers');
    return response.data;
  },

  async getVendedorById(id: number): Promise<Vendedor> {
    const response = await api.get(`/sellers/${id}`);
    return response.data;
  },

  async createVendedor(vendedor: VendedorCreateData): Promise<Vendedor> {
  // 🆕 CORREÇÃO: Garantir conversão correta para number
  const idLoja = vendedor.id_loja || parseInt(vendedor.loja_id as string);
  
  const vendedorData = {
    nome: vendedor.nome,
    email: vendedor.email,
    senha: vendedor.senha,
    id_loja: idLoja
  };

  console.log('📤 Enviando dados do vendedor para o backend:', vendedorData);

  const response = await api.post('/sellers', vendedorData);
  return response.data;
},

async updateVendedor(id: number, vendedor: Partial<VendedorCreateData>): Promise<Vendedor> {
  // 🆕 CORREÇÃO: Converter dados corretamente
  const vendedorData: VendedorUpdatePayload = {};
  
  if (vendedor.nome) vendedorData.nome = vendedor.nome;
  if (vendedor.email) vendedorData.email = vendedor.email;
  if (vendedor.senha && vendedor.senha.length > 0) {
    vendedorData.senha = vendedor.senha;
  }
  
  // 🆕 CORREÇÃO: Converter loja_id para id_loja se necessário
  if (vendedor.id_loja || vendedor.loja_id) {
    vendedorData.id_loja = vendedor.id_loja || parseInt(vendedor.loja_id as string);
  }

  if (vendedor.status) {
    vendedorData.status = vendedor.status;
  }

  console.log('📤 Enviando atualização do vendedor:', vendedorData);

  const response = await api.put(`/sellers/${id}`, vendedorData);
  return response.data;
},

  async deleteVendedor(id: number): Promise<void> {
    await api.delete(`/sellers/${id}`);
  },

  async getVendedorStats(id: number): Promise<VendedorStats> {
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