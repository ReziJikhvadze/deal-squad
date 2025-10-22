import { Participation } from '@/types/participation';

interface UserDashboardProps { participations: Participation[]; isLoading: boolean; onViewCampaign: (id: string) => void; }

export function UserDashboard({ participations, isLoading }: UserDashboardProps) {
  if (isLoading) return <div className="container py-12">Loading...</div>;
  return <div className="container py-12"><h1 className="text-3xl font-bold mb-8">My Dashboard</h1><div className="text-muted-foreground">You have {participations.length} active participations</div></div>;
}
