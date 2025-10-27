// Campaign Service
import { apiClient } from '@/lib/api';
import { Campaign, CampaignStats } from '@/types/campaign';

export const campaignService = {
  async getAllCampaigns(status?: string): Promise<Campaign[]> {
    const endpoint = status ? `/campaigns?status=${status}` : '/campaigns';
    const response = await apiClient.get<{ data: Campaign[] }>(endpoint);
    return response.data || [];
  },

  async getCampaignById(id: string): Promise<Campaign> {
    const response = await apiClient.get<{ data: Campaign }>(`/campaigns/${id}`);
    return response.data;
  },

  async getCampaignStats(): Promise<CampaignStats> {
    const response = await apiClient.get<{ data: CampaignStats }>('/campaigns/stats');
    return response.data;
  },

  async createCampaign(data: Partial<Campaign>): Promise<Campaign> {
    const response = await apiClient.post<{ data: Campaign }>('/campaigns', data);
    return response.data;
  },

  async updateCampaign(id: string, data: Partial<Campaign>): Promise<Campaign> {
    const response = await apiClient.put<{ data: Campaign }>(`/campaigns/${id}`, data);
    return response.data;
  },
};
