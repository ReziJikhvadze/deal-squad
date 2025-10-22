import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useState } from 'react';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';
import { ResetPasswordModal } from '@/components/auth/ResetPasswordModal';

export function HowItWorksPage() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onLoginClick={() => setShowLoginModal(true)} onSignupClick={() => setShowSignupModal(true)} />
      <main className="flex-1 container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">How It Works</h1>
        <div className="prose max-w-none">
          <p>GroupBuy makes saving money through group purchasing simple and secure.</p>
        </div>
      </main>
      <Footer onSignupClick={() => setShowSignupModal(true)} />
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onSignupClick={() => setShowSignupModal(true)} onResetPasswordClick={() => setShowResetPasswordModal(true)} />}
      {showSignupModal && <SignupModal onClose={() => setShowSignupModal(false)} onLoginClick={() => setShowLoginModal(true)} />}
      {showResetPasswordModal && <ResetPasswordModal onClose={() => setShowResetPasswordModal(false)} onBackToLogin={() => setShowLoginModal(true)} />}
    </div>
  );
}
