// Notification Service
import { apiClient } from '@/lib/api';

export interface Notification {
  id: string;
  userId: string;
  campaignId?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  async getMyNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<{ data: Notification[] }>('/notifications');
    return response.data;
  },

  async markAsRead(id: string): Promise<void> {
    await apiClient.post(`/notifications/${id}/mark-read`, {});
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.post('/notifications/mark-all-read', {});
  },

  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`/notifications/${id}`);
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ data: { count: number } }>('/notifications/unread-count');
    return response.data.count;
  },
};
