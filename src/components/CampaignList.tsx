import { Search, SlidersHorizontal, Grid3x3, List, X, Clock, TrendingUp, DollarSign, Sparkles, ChevronDown } from 'lucide-react';
import { CampaignCard, Campaign } from './CampaignCard';
import { CampaignRowCard } from './CampaignRowCard';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './ui/pagination';
import { useState } from 'react';

interface CampaignListProps {
  campaigns: Campaign[];
  onViewDetails: (id: string) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'ending-soon' | 'price-low' | 'price-high' | 'popular' | 'newest';
type CategoryType = 'all' | 'electronics' | 'memberships' | 'travel' | 'furniture' | 'sports';

export function CampaignList({ campaigns, onViewDetails }: CampaignListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'successful' | 'failed'>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('ending-soon');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 3x3 grid

  // Categories based on campaign titles
  const categories: { value: CategoryType; label: string; icon: any }[] = [
    { value: 'all', label: 'All Categories', icon: Grid3x3 },
    { value: 'electronics', label: 'Electronics', icon: Sparkles },
    { value: 'memberships', label: 'Memberships', icon: TrendingUp },
    { value: 'travel', label: 'Travel', icon: Clock },
    { value: 'furniture', label: 'Furniture', icon: DollarSign },
    { value: 'sports', label: 'Sports & Fitness', icon: TrendingUp },
  ];

  // Helper function to categorize campaigns
  const getCampaignCategory = (campaign: Campaign): CategoryType => {
    // Use campaign.category if available, otherwise infer from title
    if (campaign.category) {
      return campaign.category;
    }
    
    const lowerTitle = campaign.title.toLowerCase();
    if (lowerTitle.includes('iphone') || lowerTitle.includes('macbook') || lowerTitle.includes('ipad') || 
        lowerTitle.includes('tv') || lowerTitle.includes('headphones') || lowerTitle.includes('switch') ||
        lowerTitle.includes('watch') || lowerTitle.includes('camera') || lowerTitle.includes('drone')) {
      return 'electronics';
    }
    if (lowerTitle.includes('membership') || lowerTitle.includes('gym') || lowerTitle.includes('pool')) {
      return 'memberships';
    }
    if (lowerTitle.includes('travel') || lowerTitle.includes('vacation') || lowerTitle.includes('trip')) {
      return 'travel';
    }
    if (lowerTitle.includes('furniture') || lowerTitle.includes('sofa') || lowerTitle.includes('chair')) {
      return 'furniture';
    }
    if (lowerTitle.includes('sports') || lowerTitle.includes('fitness')) {
      return 'sports';
    }
    return 'all';
  };

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || campaign.status === filterStatus;
    const campaignCategory = getCampaignCategory(campaign);
    const matchesCategory = selectedCategory === 'all' || campaignCategory === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort campaigns
  const sortedCampaigns = [...filteredCampaigns].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        return a.daysLeft - b.daysLeft;
      case 'price-low':
        return a.storePrice - b.storePrice;
      case 'price-high':
        return b.storePrice - a.storePrice;
      case 'popular':
        return b.currentParticipants - a.currentParticipants;
      case 'newest':
        return parseInt(b.id) - parseInt(a.id);
      default:
        return 0;
    }
  });

  // Get ending soon campaigns (active campaigns with <= 3 days left)
  const endingSoonCampaigns = campaigns.filter(
    c => c.status === 'active' && c.daysLeft > 0 && c.daysLeft <= 3
  ).sort((a, b) => a.daysLeft - b.daysLeft);

  const activeFilterCount = [
    filterStatus !== 'all' ? 1 : 0,
    selectedCategory !== 'all' ? 1 : 0,
    searchQuery ? 1 : 0
  ].reduce((a, b) => a + b, 0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(sortedCampaigns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  const handleFilterChange = (callback: () => void) => {
    callback();
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">All Campaigns</h1>
          <p className="text-xl text-gray-600">
            Browse all available group buying opportunities
          </p>
        </div>

        {/* Ending Soon Section */}
        {endingSoonCampaigns.length > 0 && (
          <div className="mb-8">
            <Card className="p-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-orange-500 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900">⚡ Ending Soon!</h2>
                  <p className="text-sm text-gray-600">Don't miss out - these campaigns close within 3 days</p>
                </div>
              </div>
              
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                {endingSoonCampaigns.slice(0, 3).map(campaign => (
                  viewMode === 'grid' ? (
                    <CampaignCard 
                      key={campaign.id}
                      campaign={campaign}
                      onViewDetails={onViewDetails}
                    />
                  ) : (
                    <CampaignRowCard
                      key={campaign.id}
                      campaign={campaign}
                      onViewDetails={onViewDetails}
                      featured={true}
                    />
                  )
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search campaigns by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ending-soon">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Ending Soon</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="price-low">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Price: Low to High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="price-high">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 rotate-180" />
                      <span>Price: High to Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      <span>Most Popular</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Newest First</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(() => setFilterStatus('all'))}
              >
                All
              </Button>
              <Button 
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(() => setFilterStatus('active'))}
              >
                Active
              </Button>
              <Button 
                variant={filterStatus === 'successful' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(() => setFilterStatus('successful'))}
              >
                Successful
              </Button>
              
              {/* More Filters Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Category Filters
                    {selectedCategory !== 'all' && (
                      <Badge className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-blue-600">
                        1
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter by Category</SheetTitle>
                    <SheetDescription>
                      Choose a category to narrow down your search
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-3">
                    {categories.map((category) => {
                      const Icon = category.icon;
                      return (
                        <Button
                          key={category.value}
                          variant={selectedCategory === category.value ? 'default' : 'outline'}
                          className="w-full justify-start"
                          onClick={() => handleFilterChange(() => setSelectedCategory(category.value))}
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {category.label}
                        </Button>
                      );
                    })}
                  </div>
                </SheetContent>
              </Sheet>

              {/* Clear Filters */}
              {activeFilterCount > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </div>

            {/* Active Category Badge */}
            {selectedCategory !== 'all' && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Active filter:</span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories.find(c => c.value === selectedCategory)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-red-600" 
                    onClick={() => setSelectedCategory('all')}
                  />
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Total Campaigns</p>
            <p className="text-2xl">{campaigns.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Active Now</p>
            <p className="text-2xl text-blue-600">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Successful</p>
            <p className="text-2xl text-green-600">
              {campaigns.filter(c => c.status === 'successful').length}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Ending Soon</p>
            <p className="text-2xl text-orange-600">
              {endingSoonCampaigns.length}
            </p>
          </Card>
        </div>

        {/* Result Count */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{startIndex + 1}-{Math.min(endIndex, sortedCampaigns.length)}</span> of{' '}
            <span className="font-semibold text-gray-900">{sortedCampaigns.length}</span> campaigns
            {sortedCampaigns.length !== campaigns.length && (
              <span className="text-gray-500"> (filtered from {campaigns.length} total)</span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            Sorted by: {sortBy === 'ending-soon' ? 'Ending Soon' : 
                       sortBy === 'price-low' ? 'Price: Low to High' :
                       sortBy === 'price-high' ? 'Price: High to Low' :
                       sortBy === 'popular' ? 'Most Popular' : 'Newest First'}
          </p>
        </div>

        {/* Campaigns Display */}
        {sortedCampaigns.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedCampaigns.map(campaign => (
                  <CampaignCard 
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={onViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {paginatedCampaigns.map(campaign => (
                  <CampaignRowCard 
                    key={campaign.id}
                    campaign={campaign}
                    onViewDetails={onViewDetails}
                    featured={false}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationEllipsis />
                          </PaginationItem>
                        );
                      }
                      return null;
                    })}

                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-4">
              <Search className="h-8 w-8" />
            </div>
            <h3 className="text-xl mb-2">No campaigns found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
            {activeFilterCount > 0 && (
              <Button onClick={clearAllFilters} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
