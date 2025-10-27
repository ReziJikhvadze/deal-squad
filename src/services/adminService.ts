// Admin Service
import { apiClient } from '@/lib/api';

export interface AdminStats {
  totalUsers: number;
  totalCampaigns: number;
  activeCampaigns: number;
  totalRevenue: number;
  pendingPayments: number;
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<{ data: AdminStats }>('/admin/dashboard-stats');
    return response.data;
  },

  async getAllUsers(): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/admin/users');
    return response.data;
  },

  async banUser(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/ban`, {});
  },

  async unbanUser(userId: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/unban`, {});
  },

  async getAllPayments(): Promise<any[]> {
    const response = await apiClient.get<{ data: any[] }>('/admin/payments');
    return response.data;
  },
};
