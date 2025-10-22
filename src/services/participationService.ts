// Participation Service
import { apiClient } from '@/lib/api';
import { Participation, CreateParticipationRequest } from '@/types/participation';

export const participationService = {
  async getUserParticipations(): Promise<Participation[]> {
    return apiClient.get<Participation[]>('/participations/my');
  },

  async joinCampaign(data: CreateParticipationRequest): Promise<Participation> {
    return apiClient.post<Participation>('/participations', data);
  },

  async cancelParticipation(id: string): Promise<void> {
    return apiClient.delete<void>(`/participations/${id}`);
  },
};
