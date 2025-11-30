import { api } from './api';

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
  pagamento: {
    metodo_pagamento: string;
    valor: number;
    valor_pago?: number;
    observacao?: string;
  };
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
  }
};