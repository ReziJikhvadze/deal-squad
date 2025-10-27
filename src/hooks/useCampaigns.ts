import { useQuery } from '@tanstack/react-query';
import { campaignService } from '@/services/campaignService';

export function useCampaigns(status?: string) {
  return useQuery({
    queryKey: ['campaigns', status],
    queryFn: () => campaignService.getAllCampaigns(status),
    staleTime: 30000, // 30 seconds
  });
}

export function useCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaignById(id!),
    enabled: !!id,
  });
}
