// Participation Service
import { apiClient } from '@/lib/api';
import { Participation, CreateParticipationRequest } from '@/types/participation';

export const participationService = {
  async getUserParticipations(): Promise<Participation[]> {
    const response = await apiClient.get<{ data: Participation[] }>('/participations/my-participations');
    return response.data;
  },

  async joinCampaign(data: CreateParticipationRequest): Promise<Participation> {
    const response = await apiClient.post<{ data: Participation }>('/participations/join', data);
    return response.data;
  },

  async cancelParticipation(id: string): Promise<void> {
    await apiClient.post(`/participations/${id}/leave`, {});
  },

  async payFinal(participationId: string, paymentMethodId: string): Promise<void> {
    await apiClient.post('/participations/pay-final', {
      participationId,
      paymentMethodId,
    });
  },
};
