import { Campaign } from '@/types/campaign';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';

interface CampaignDetailProps { campaign: Campaign; onBack: () => void; onJoinCampaign: () => void; }

export function CampaignDetail({ campaign, onBack, onJoinCampaign }: CampaignDetailProps) {
  return <div className="container py-8"><Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button><div className="grid md:grid-cols-2 gap-8"><img src={campaign.imageUrl} alt={campaign.title} className="w-full rounded-lg" /><div><h1 className="text-3xl font-bold mb-4">{campaign.title}</h1><p className="text-muted-foreground mb-6">{campaign.description}</p><Button size="lg" onClick={onJoinCampaign}>Join Campaign</Button></div></div></div>;
}
