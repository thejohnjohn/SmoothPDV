import { api } from './api';

export const dashboardService = {
  async getAdminDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/admin', { params: dateRange });
    return response.data;
  },

  async getGerenteDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/gerente', { params: dateRange });
    return response.data;
  },

  async getVendedorDashboard(dateRange: { startDate: string; endDate: string }) {
    const response = await api.get('/dashboard/vendedor', { params: dateRange });
    return response.data;
  }
};