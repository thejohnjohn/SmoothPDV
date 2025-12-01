import { api } from './api';
import type { Vendedor, VendedorCreateData } from '../types/admin';

export interface SellerStats {
  total_vendas: number;
  total_vendido: number;
  ticket_medio: number;
  produtos_cadastrados: number;
}

export interface QuickSaleData {
  produtos: Array<{
    idmercadoria: number;
    quantidade: number;
  }>;
  metodo_pagamento: string;
  valor_pago?: number;
  observacao?: string;
}

export const sellerService = {
  // ===== VENDAS DO VENDEDOR =====
  async getSales(): Promise<any[]> {
    const response = await api.get('/seller/sales');
    return response.data;
  },

  async getSaleById(id: number): Promise<any> {
    const response = await api.get(`/seller/sales/${id}`);
    return response.data;
  },

  async createQuickSale(data: QuickSaleData): Promise<any> {
    const response = await api.post('/seller/sales/quick', data);
    return response.data;
  },

  // ===== ESTATÍSTICAS DO VENDEDOR =====
  async getStats(): Promise<SellerStats> {
    const response = await api.get('/seller/stats');
    return response.data;
  },

  // ===== RELATÓRIOS DO VENDEDOR =====
  async generatePDFReport(reportData: any): Promise<Blob> {
    const response = await api.post('/seller/reports/pdf', reportData, {
      responseType: 'blob'
    });
    return response.data;
  },

  async sendEmailReport(emailData: any): Promise<any> {
    const response = await api.post('/seller/reports/email', emailData);
    return response.data;
  },

  async generateInvoice(invoiceData: any): Promise<Blob> {
    const response = await api.post('/seller/reports/invoice', invoiceData, {
      responseType: 'blob'
    });
    return response.data;
  },

  async getVendedoresByGerente(): Promise<Vendedor[]> {
    const response = await api.get('/sellers');
    return response.data;
  },

  async createVendedor(data: VendedorCreateData): Promise<Vendedor> {
    // 🆕 CORREÇÃO: Sempre usar id_loja do gerente logado
    const vendedorData = {
      nome: data.nome,
      email: data.email,
      senha: data.senha,
      id_loja: data.id_loja // 🆕 Já deve vir com a loja do gerente
    };

    console.log('📤 [GERENTE] Enviando criação de vendedor:', vendedorData);

    const response = await api.post('/sellers', vendedorData);
    return response.data;
  },

  async updateVendedor(id: number, data: Partial<VendedorCreateData>): Promise<Vendedor> {
    // 🆕 CORREÇÃO: Sempre usar id_loja do gerente logado
    const vendedorData: any = {
      nome: data.nome,
      email: data.email,
      id_loja: data.id_loja // 🆕 Já deve vir com a loja do gerente
    };

    console.log('📤 [GERENTE] Enviando atualização de vendedor:', vendedorData);

    const response = await api.put(`/sellers/${id}`, vendedorData);
    return response.data;
  },

  async updateVendedorStatus(id: number, status: 'ativo' | 'inativo'): Promise<Vendedor> {
    const response = await api.patch(`/sellers/${id}/status`, { status });
    return response.data;
  },

  async deleteVendedor(id: number): Promise<void> {
    await api.delete(`/sellers/${id}`);
  },

  async getVendedorStats(id: number): Promise<any> {
    const response = await api.get(`/sellers/${id}/stats`);
    return response.data;
  }
};