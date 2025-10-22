import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { campaignService } from '@/services/campaignService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignGrid } from '@/components/CampaignGrid';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';

export function CampaignsPage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: () => campaignService.getAllCampaigns(),
  });

  const closeAllModals = () => {
    setShowLoginModal(false);
    setShowSignupModal(false);
    setShowResetPasswordModal(false);
  };

  const handleLoginClick = () => {
    closeAllModals();
    setShowLoginModal(true);
  };

  const handleSignupClick = () => {
    closeAllModals();
    setShowSignupModal(true);
  };

  const handleResetPasswordClick = () => {
    closeAllModals();
    setShowResetPasswordModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Campaigns</h1>
          <p className="text-muted-foreground">Discover amazing group buying opportunities</p>
        </div>

        <CampaignGrid 
          campaigns={campaigns} 
          isLoading={isLoading}
          onViewDetails={(id) => navigate(`/campaigns/${id}`)}
        />
      </main>

      <Footer onSignupClick={handleSignupClick} />

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSignupClick={handleSignupClick}
          onResetPasswordClick={handleResetPasswordClick}
        />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onLoginClick={handleLoginClick}
        />
      )}

      {showResetPasswordModal && (
        <ResetPasswordModal
          onClose={() => setShowResetPasswordModal(false)}
          onBackToLogin={handleLoginClick}
        />
      )}
    </div>
  );
}
