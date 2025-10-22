import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { participationService } from '@/services/participationService';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { UserDashboard } from '@/components/UserDashboard';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';
import { useAuth } from '@/contexts/AuthContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const { data: participations = [], isLoading } = useQuery({
    queryKey: ['participations'],
    queryFn: participationService.getUserParticipations,
    enabled: isAuthenticated,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        onLoginClick={handleLoginClick}
        onSignupClick={handleSignupClick}
      />

      <main className="flex-1">
        <UserDashboard
          participations={participations}
          isLoading={isLoading}
          onViewCampaign={(id) => navigate(`/campaigns/${id}`)}
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
