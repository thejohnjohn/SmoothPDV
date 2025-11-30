import { api } from './api';

export interface EmailData {
  recipientEmail: string;
  subject: string;
  message?: string;
  htmlContent?: string;
  textContent?: string;
  attachments?: any[];
}

export const emailService = {
  async sendEmail(data: EmailData): Promise<any> {
    const response = await api.post('/email/send', data);
    return response.data;
  },

  async sendSimpleEmail(data: Omit<EmailData, 'attachments'>): Promise<any> {
    const response = await api.post('/email/send-simple', data);
    return response.data;
  },

  async testConnection(): Promise<any> {
    const response = await api.get('/email/test');
    return response.data;
  }
};