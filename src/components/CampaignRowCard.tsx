import { Clock, Users, TrendingUp, Building2, Target, Zap, Award, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Campaign } from './CampaignCard';

interface CampaignRowCardProps {
  campaign: Campaign;
  onViewDetails: (id: string) => void;
  featured?: boolean;
}

export function CampaignRowCard({ campaign, onViewDetails, featured = false }: CampaignRowCardProps) {
  const deposit = campaign.storePrice * 0.1;
  const refundAmount = deposit * 0.8;
  const progressPercentage = (campaign.currentParticipants / campaign.targetQuantity) * 100;
  const spotsLeft = campaign.targetQuantity - campaign.currentParticipants;
  const isAlmostFull = progressPercentage >= 80;
  const isUrgent = campaign.daysLeft <= 3;
  const savings = Math.round(campaign.storePrice * 0.35); // 35% average savings
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-2xl transition-all duration-500 group relative cursor-pointer ${
        featured ? 'ring-2 ring-blue-200 shadow-xl' : ''
      }`}
      onClick={() => onViewDetails(campaign.id)}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-1 -left-1 z-10">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1.5 rounded-br-lg rounded-tl-lg shadow-lg flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5" />
            <span className="text-xs">Featured</span>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="relative lg:w-64 h-48 lg:h-auto flex-shrink-0 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          <ImageWithFallback 
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Image Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          
          {/* Badges on Image */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isAlmostFull && (
              <Badge className="bg-orange-500 text-white shadow-lg animate-pulse backdrop-blur-sm text-xs py-0.5">
                <Zap className="h-3 w-3 mr-1" />
                Almost Full!
              </Badge>
            )}
            {isUrgent && (
              <Badge className="bg-red-500 text-white shadow-lg animate-pulse backdrop-blur-sm text-xs py-0.5">
                <Clock className="h-3 w-3 mr-1" />
                Ending Soon
              </Badge>
            )}
          </div>
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3 z-10">
            <Badge className="bg-white/95 backdrop-blur-sm text-blue-600 hover:bg-white shadow-lg text-xs py-0.5">
              {campaign.status.toLowerCase() === 'active' ? '✅ Active' : campaign.status.toLowerCase() === 'successful' ? '🎉 Success' : '❌ Failed'}
            </Badge>
          </div>

          {/* Hover CTA Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <div className="bg-white/95 backdrop-blur-sm px-6 py-3 rounded-xl shadow-2xl transform group-hover:scale-105 transition-transform">
              <p className="flex items-center gap-2">
                <span>View Details</span>
                <ChevronRight className="h-4 w-4" />
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Details Column */}
          <div className="flex-1 p-4 lg:p-5 space-y-3">
            {/* Title & Store */}
            <div className="space-y-1">
              <h3 className="line-clamp-1 group-hover:text-blue-600 transition-colors">
                {campaign.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-xs">{campaign.store}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
              {campaign.description}
            </p>

            {/* Progress Section */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Target className="h-3.5 w-3.5 text-blue-600" />
                  <span className="text-xs text-gray-600">Progress</span>
                </div>
                <span className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {progressPercentage.toFixed(0)}%
                </span>
              </div>
              
              <div className="relative">
                <Progress value={progressPercentage} className="h-2" />
                {progressPercentage >= 90 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                )}
              </div>
              
              <div className="flex items-center justify-between text-[10px] text-gray-500">
                <span>{campaign.currentParticipants}/{campaign.targetQuantity}</span>
                <span className={spotsLeft <= 50 ? 'text-orange-600' : ''}>
                  {spotsLeft} spots left
                </span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors">
                <div className="h-8 w-8 rounded-md bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Participants</p>
                  <p className="text-sm text-gray-900">{campaign.currentParticipants}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 group-hover:from-orange-100 group-hover:to-red-100 transition-colors">
                <div className="h-8 w-8 rounded-md bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-500">Time Left</p>
                  <p className={`text-sm ${isUrgent ? 'text-red-600' : 'text-gray-900'}`}>
                    {campaign.daysLeft}d
                  </p>
                </div>
              </div>
            </div>

            {/* Join Button */}
            <Button 
              className="w-full h-10 relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 group/btn text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(campaign.id);
              }}
            >
              <span className="relative z-10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                Join Campaign
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
            </Button>
          </div>

          {/* Pricing Column */}
          <div className="lg:w-60 p-4 lg:p-5 bg-gradient-to-br from-gray-50 to-blue-50/30 border-l-0 lg:border-l flex flex-col justify-center space-y-2">
            {/* Pricing Cards */}
            <div className="space-y-2">
              {/* Store Price */}
              <div className="bg-white rounded-lg p-2.5 border shadow-sm">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Store Price</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl text-gray-900">${campaign.storePrice}</span>
                  <span className="text-[10px] text-gray-400 line-through">${campaign.storePrice + savings}</span>
                </div>
              </div>

              {/* Deposit */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-2.5 text-white shadow-lg relative overflow-hidden group-hover:shadow-xl transition-shadow">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />
                <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/10 rounded-full -ml-6 -mb-6" />
                <div className="relative">
                  <p className="text-[10px] text-blue-100 uppercase tracking-wide mb-0.5">Pay Now (10%)</p>
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="text-xl">${deposit.toFixed(0)}</span>
                    <span className="text-[10px] text-blue-200">deposit</span>
                  </div>
                  <p className="text-[10px] text-blue-100">
                    +${(campaign.storePrice - deposit).toFixed(0)} on success
                  </p>
                </div>
              </div>

              {/* Savings */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-2.5 border border-green-100">
                <p className="text-[10px] text-green-700 uppercase tracking-wide mb-0.5">Your Savings</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg text-green-600">${savings}</span>
                  <span className="text-[10px] text-green-600">(~35%)</span>
                </div>
              </div>
            </div>

            {/* Trust Indicator */}
            <div className="pt-2 border-t flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Secure</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
