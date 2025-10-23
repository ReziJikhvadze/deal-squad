// Payment Service
import { apiClient } from '@/lib/api';

export interface Payment {
  id: string;
  userId: string;
  campaignId: string;
  participantId: string;
  amount: number;
  type: 'Deposit' | 'Final' | 'Refund';
  status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
  paymentProvider: string;
  paymentMethod: string;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentService = {
  async getMyPayments(): Promise<Payment[]> {
    return apiClient.get<Payment[]>('/payments/my-payments');
  },

  async getPaymentById(id: string): Promise<Payment> {
    return apiClient.get<Payment>(`/payments/${id}`);
  },

  async getCampaignPayments(campaignId: string): Promise<Payment[]> {
    return apiClient.get<Payment[]>(`/payments/campaign/${campaignId}`);
  },
};
