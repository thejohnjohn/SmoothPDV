import { api } from './api';

export interface ReportData {
  startDate: string;
  endDate: string;
  reportType: 'vendas' | 'produtos' | 'financeiro';
  filters?: Record<string, unknown>;
}

export interface ReportEmailData extends ReportData {
  recipientEmail: string;
  subject?: string;
  message?: string;
  dashboardData?: unknown;
}

export interface SellerReportData {
  data_inicio: string;
  data_fim: string;
  tipo_relatorio?: string;
}

export interface SellerEmailData {
  recipientEmail: string;
  data_inicio: string;
  data_fim: string;
  message?: string;
}

export interface InvoiceData {
  sale_id: number;
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

  async sendEmail(data: ReportEmailData): Promise<unknown> {
    const response = await api.post('/reports/email', data);
    return response.data;
  },

  // ===== MÉTODOS ESPECÍFICOS PARA VENDEDORES =====
  async generateSellerPDF(data: SellerReportData): Promise<Blob> {
    const response = await api.post('/seller/reports/pdf', data, {
      responseType: 'blob'
    });
    return response.data;
  },

  async sendSellerEmail(data: SellerEmailData): Promise<unknown> {
    const response = await api.post('/seller/reports/email', data);
    return response.data;
  },

  async generateInvoice(data: InvoiceData): Promise<Blob> {
    const response = await api.post('/seller/reports/invoice', data, {
      responseType: 'blob'
    });
    return response.data;
  }
};