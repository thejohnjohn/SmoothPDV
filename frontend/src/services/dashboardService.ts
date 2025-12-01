import { api } from './api';

export const dashboardService = {
  async getAdminDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/admin', { 
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    });
    return response.data;
  },

  async getGerenteDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/gerente', { 
      params: {
        data_inicio: dateRange.startDate, // Nome correto do parâmetro no backend
        data_fim: dateRange.endDate
      }
    });
    return response.data;
  },

  async getVendedorDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/vendedor', { 
      params: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      }
    });
    return response.data;
  }
};