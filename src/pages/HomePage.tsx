import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { campaignService } from '@/services/campaignService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { LandingHero } from '@/components/LandingHero';
import { FeaturedCampaigns } from '@/components/FeaturedCampaigns';
import { HowItWorks } from '@/components/HowItWorks';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';

export function HomePage() {
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', 'active'],
    queryFn: () => campaignService.getAllCampaigns('Active'),
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

  const featuredCampaigns = campaigns.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      <main className="flex-1">
        <LandingHero
          onExplore={() => navigate('/campaigns')}
          onLearnMore={() => navigate('/how-it-works')}
        />

        <FeaturedCampaigns
          campaigns={featuredCampaigns}
          isLoading={isLoading}
          onViewAll={() => navigate('/campaigns')}
        />

        <HowItWorks onGetStarted={handleSignupClick} />
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
