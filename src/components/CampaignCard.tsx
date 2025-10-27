import { Clock, Users, TrendingUp, Building2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Campaign as BackendCampaign } from '@/types/campaign';

export type Campaign = BackendCampaign & {
  image?: string;
  storePrice?: number;
  daysLeft?: number;
  store?: string;
  category?: 'electronics' | 'memberships' | 'travel' | 'furniture' | 'sports';
};

interface CampaignCardProps {
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  featured?: boolean;
}

export function CampaignCard({ campaign, onViewDetails, featured = false }: CampaignCardProps) {
  const displayPrice = campaign.storePrice || campaign.regularPrice;
  const deposit = displayPrice * 0.1;
  const progressPercentage = (campaign.currentParticipants / campaign.targetQuantity) * 100;
  const spotsLeft = campaign.targetQuantity - campaign.currentParticipants;
  const displayImage = campaign.image || campaign.imageUrl;
  const displayStatus = campaign.status.toLowerCase();
  const displayStore = campaign.store || 'Official Store';
  const endDate = new Date(campaign.endDate);
  const daysLeft = campaign.daysLeft || Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  const isAlmostFull = progressPercentage >= 80;
  const isUrgent = daysLeft <= 3;
  
  return (
    <Card className={`overflow-hidden hover:shadow-2xl transition-all duration-500 group relative ${
      featured ? 'ring-2 ring-blue-200 shadow-xl' : ''
    }`}>
      {featured && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-bl-lg rounded-tr-lg text-xs shadow-lg">
            ⭐ Featured
          </div>
        </div>
      )}
      
      <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        <ImageWithFallback 
          src={displayImage}
          alt={campaign.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isAlmostFull && (
            <Badge className="bg-orange-500 text-white shadow-lg animate-pulse">
              🔥 Almost Full!
            </Badge>
          )}
          {isUrgent && (
            <Badge className="bg-red-500 text-white shadow-lg animate-pulse">
              ⏰ Ending Soon
            </Badge>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <Badge className="bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white shadow-lg">
            {displayStatus === 'active' ? '✅ Active' : displayStatus === 'successful' ? '🎉 Success' : '❌ Failed'}
          </Badge>
        </div>
      </div>
      
      <div className="p-6 space-y-5">
        <div>
          <h3 className="mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-blue-600 transition-colors">{campaign.title}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Building2 className="h-3.5 w-3.5" />
            <span>{displayStore}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Campaign Progress</span>
            <span className="text-blue-600">
              {progressPercentage.toFixed(0)}% • {spotsLeft} spots left
            </span>
          </div>
          <div className="relative">
            <Progress value={progressPercentage} className="h-2.5" />
            {progressPercentage >= 90 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
            )}
          </div>
          <p className="text-xs text-gray-500">
            {campaign.currentParticipants} of {campaign.targetQuantity} participants joined
          </p>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-gray-700">{campaign.currentParticipants} joined</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className={`${isUrgent ? 'text-red-600' : 'text-gray-700'}`}>
              {daysLeft} days
            </span>
          </div>
        </div>

        <div className="pt-4 border-t space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">Store Price</span>
              <p className="text-3xl text-gray-900">${displayPrice}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Deposit</span>
              <p className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                ${deposit.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Only 10%</p>
            </div>
          </div>
          
          <Button 
            className="w-full h-12 text-base group/btn relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => onViewDetails(campaign.id)}
          >
            <span className="relative z-10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform" />
              Join Campaign
            </span>
          </Button>
        </div>
      </div>
    </Card>
  );
}
