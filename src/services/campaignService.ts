// Campaign Service
import { apiClient } from '@/lib/api';
import { Campaign, CampaignStats } from '@/types/campaign';

export const campaignService = {
  async getAllCampaigns(status?: string): Promise<Campaign[]> {
    const endpoint = status ? `/campaigns?status=${status}` : '/campaigns';
    return apiClient.get<Campaign[]>(endpoint);
  },

  async getCampaignById(id: string): Promise<Campaign> {
    return apiClient.get<Campaign>(`/campaigns/${id}`);
  },

  async getCampaignStats(): Promise<CampaignStats> {
    return apiClient.get<CampaignStats>('/campaigns/stats');
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    return apiClient.post<Campaign>('/campaigns', data);
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    return apiClient.put<Campaign>(`/campaigns/${id}`, data);
  },
};
