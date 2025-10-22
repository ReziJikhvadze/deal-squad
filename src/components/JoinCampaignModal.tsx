import { Campaign } from '@/types/campaign';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';

interface JoinCampaignModalProps { campaign: Campaign; onClose: () => void; }

export function JoinCampaignModal({ campaign, onClose }: JoinCampaignModalProps) {
  return <Dialog open onOpenChange={onClose}><DialogContent><DialogHeader><DialogTitle>Join {campaign.title}</DialogTitle></DialogHeader><div className="space-y-4"><p>Deposit required: ${(campaign.regularPrice * 0.1).toFixed(2)}</p><Button className="w-full">Confirm & Pay Deposit</Button></div></DialogContent></Dialog>;
}
