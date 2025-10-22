// Campaign Types matching backend DTOs
export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  regularPrice: number;
  discountedPrice: number;
  targetQuantity: number;
  currentParticipants: number;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Active' | 'Successful' | 'Failed' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  totalCampaigns: number;
  activeCampaigns: number;
  successfulCampaigns: number;
  totalParticipants: number;
}
