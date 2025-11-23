import { api } from './api';

export const dashboardService = {
  async getDashboard(dateRange: { startDate: string; endDate: string }, userType: string) {
    let endpoint = '/dashboard';
    
    switch (userType) {
      case 'ADMIN':
        endpoint = '/dashboard/admin';
        break;
      case 'GERENTE':
        endpoint = '/dashboard/gerente';
        break;
      case 'VENDEDOR':
        endpoint = '/dashboard/vendedor';
        break;
      default:
        throw new Error('Tipo de usuário não suportado');
    }

    const response = await api.get(endpoint, { params: dateRange });
    return response.data;
  },

  async generatePDF(pdfData: any) {
    const response = await api.post('/reports/pdf', pdfData, {
      responseType: 'blob' // Importante para receber arquivo
    });
    return response.data;
  },

  async sendEmailReport(emailData: any) {
    const response = await api.post('/reports/email', emailData);
    return response.data;
  }
};