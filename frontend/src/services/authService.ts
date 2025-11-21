import { User, LoginData } from '../types/auth';
import { api } from './api';

export const authService = {
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: { nome: string; email: string; senha: string }) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response.data.user;
  },

  async logout() {
    localStorage.removeItem('token');
  }
};