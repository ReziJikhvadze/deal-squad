import { Campaign } from '@/types/campaign';
import { Card } from './ui/card';

interface CampaignGridProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onViewDetails: (id: string) => void;
}

export function CampaignGrid({ campaigns, isLoading, onViewDetails }: CampaignGridProps) {
  if (isLoading) return <div className="text-center py-12">Loading campaigns...</div>;
  if (campaigns.length === 0) return <div className="text-center py-12">No campaigns found</div>;

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {campaigns.map(campaign => (
        <Card key={campaign.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onViewDetails(campaign.id)}>
          <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-48 object-cover rounded-lg mb-4" />
          <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{campaign.description}</p>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-medium">{campaign.currentParticipants}/{campaign.targetQuantity}</span></div>
        </Card>
      ))}
    </div>
  );
}
