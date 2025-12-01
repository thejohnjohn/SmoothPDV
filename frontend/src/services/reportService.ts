import { api } from './api';

export interface ReportData {
  startDate: string;
  endDate: string;
  reportType: 'vendas' | 'produtos' | 'financeiro';
  filters?: Record<string, any>;
}

export const reportService = {
  async generatePDF(data: ReportData): Promise<Blob> {
    const response = await api.post('/reports/pdf', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  async generateExcel(data: ReportData): Promise<Blob> {
    const response = await api.post('/reports/excel', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  async sendEmail(data: ReportData & { recipientEmail: string; message?: string }): Promise<any> {
    const response = await api.post('/reports/email', data);
    return response.data;
  },

  // ===== MÉTODOS ESPECÍFICOS PARA VENDEDORES =====
  async generateSellerPDF(data: any): Promise<Blob> {
    const response = await api.post('/seller/reports/pdf', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  async sendSellerEmail(data: any): Promise<any> {
    const response = await api.post('/seller/reports/email', data);
    return response.data;
  },

  async generateInvoice(data: any): Promise<Blob> {
    const response = await api.post('/seller/reports/invoice', data, {
      responseType: 'blob'
    });
    return response.data;
  }
};