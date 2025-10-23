import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { adminService } from '@/services/adminService';
import { DollarSign, Users, ShoppingBag, TrendingUp } from 'lucide-react';

export function AdminPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => adminService.getStats(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      description: 'Registered users',
    },
    {
      title: 'Total Campaigns',
      value: stats?.totalCampaigns || 0,
      icon: ShoppingBag,
      description: 'All campaigns',
    },
    {
      title: 'Active Campaigns',
      value: stats?.activeCampaigns || 0,
      icon: TrendingUp,
      description: 'Currently running',
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.totalRevenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      description: 'Total earnings',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onLoginClick={() => setShowLoginModal(true)}
        onSignupClick={() => setShowSignupModal(true)}
      />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <Footer onSignupClick={() => setShowSignupModal(true)} />
      
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSignupClick={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onResetPasswordClick={() => {
            setShowLoginModal(false);
            setShowResetPasswordModal(true);
          }}
        />
      )}
      
      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onLoginClick={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
      
      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={() => setShowResetPasswordModal(false)}
          onBackToLogin={() => {
            setShowResetPasswordModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
    </div>
  );
}
