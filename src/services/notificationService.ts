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
    return apiClient.get<Notification[]>('/notifications');
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.post<void>(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post<void>('/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete<void>(`/notifications/${id}`);
  },
};
