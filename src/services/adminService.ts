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
    return apiClient.get<AdminStats>('/admin/stats');
  },

  async getAllUsers(): Promise<any[]> {
    return apiClient.get<any[]>('/admin/users');
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    return apiClient.put<void>(`/admin/users/${userId}/role`, { role });
  },
};
