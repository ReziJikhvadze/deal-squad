import { Campaign } from '@/types/campaign';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

interface FeaturedCampaignsProps {
  campaigns: Campaign[];
  isLoading: boolean;
  onViewAll: () => void;
}

export function FeaturedCampaigns({ campaigns, isLoading, onViewAll }: FeaturedCampaignsProps) {
  const navigate = useNavigate();

  if (isLoading) return <div className="container py-12 text-center">Loading...</div>;

  return (
    <section className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Featured Campaigns</h2>
        <Button variant="outline" onClick={onViewAll}>View All</Button>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {campaigns.map(campaign => (
          <Card key={campaign.id} className="p-6 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/campaigns/${campaign.id}`)}>
            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h3 className="font-bold text-lg mb-2">{campaign.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
