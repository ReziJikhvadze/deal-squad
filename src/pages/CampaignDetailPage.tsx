import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignService } from '@/services/campaignService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CampaignDetail } from '@/components/CampaignDetail';
import { JoinCampaignModal } from '@/components/JoinCampaignModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';
import { useAuth } from '@/contexts/AuthContext';
import { Campaign } from '@/types/campaign';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignService.getCampaignById(id!),
    enabled: !!id,
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

  const handleJoinCampaign = (campaign: Campaign) => {
    if (!isAuthenticated) {
      handleLoginClick();
      return;
    }
    setShowJoinModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header onLoginClick={handleLoginClick} onSignupClick={handleSignupClick} />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-8">The campaign you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/campaigns')}
              className="text-primary hover:underline"
            >
              Back to Campaigns
            </button>
          </div>
        </main>
        <Footer onSignupClick={handleSignupClick} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      <main className="flex-1">
        <CampaignDetail
          campaign={campaign}
          onBack={() => navigate('/campaigns')}
          onJoinCampaign={() => handleJoinCampaign(campaign)}
        />
      </main>

      <Footer onSignupClick={handleSignupClick} />

      {showJoinModal && campaign && (
        <JoinCampaignModal
          campaign={campaign}
          onClose={() => setShowJoinModal(false)}
        />
      )}

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
