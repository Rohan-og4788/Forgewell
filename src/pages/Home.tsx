import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Hero } from '../components/Hero';
import { SocialProof } from '../components/SocialProof';
import { Features } from '../components/Features';
import { HowItWorks } from '../components/HowItWorks';
import { AIReviewSection } from '../components/AIReviewSection';
import { WorkspaceDashboard } from '../components/WorkspaceDashboard';
import { PortfolioShowcase } from '../components/PortfolioShowcase';
import { Pricing } from '../components/Pricing';
import { Testimonials } from '../components/Testimonials';
import { FAQ } from '../components/FAQ';
import { FinalCTA } from '../components/FinalCTA';
import { Footer } from '../components/Footer';
import { AuthModal } from '../components/AuthModal';

export function Home() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleOpenAuth = (mode: 'login' | 'signup', plan?: string) => {
    setAuthMode(mode);
    setSelectedPlan(plan || null);
    setAuthModalOpen(true);
  };

  const handleSelectPlan = (planId: string) => {
    handleOpenAuth('signup', planId);
  };

  return (
    <div className="min-h-screen bg-[#08090d] text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-300">
      <Navbar onOpenAuth={handleOpenAuth} />
      <main className="flex-1">
        <Hero onOpenAuth={handleOpenAuth} />
        <SocialProof />
        <Features />
        <HowItWorks />
        <AIReviewSection />
        <WorkspaceDashboard />
        <PortfolioShowcase />
        <Pricing onSelectPlan={handleSelectPlan} />
        <Testimonials />
        <FAQ />
        <FinalCTA onOpenAuth={handleOpenAuth} />
      </main>
      <Footer />
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        selectedPlan={selectedPlan}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
