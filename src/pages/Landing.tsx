
import React from 'react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import HeroSection from '@/components/landing/HeroSection';
import SpecialFeaturesSection from '@/components/landing/SpecialFeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import FooterSection from '@/components/landing/FooterSection';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Rasenpilot - Deutschlands intelligentester KI-Rasenberater"
        description="Revolutionäre KI-Technologie für Ihren perfekten Rasen. Kostenlose Analyse in 60 Sekunden, personalisierte Pflegepläne und Expertenwissen - alles in einer App."
        canonical="/"
        keywords="KI Rasenberater, intelligente Rasenpflege, Rasen-KI, automatischer Pflegeplan, Rasenpilot Deutschland, AI Garten, Smart Rasenpflege"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpilot - KI-Rasenberatung',
            description: 'Deutschlands fortschrittlichste KI-Technologie für perfekte Rasenpflege',
            url: 'https://rasenpilot.de',
            serviceType: 'KI-gestützte Rasenpflege-Beratung',
            provider: 'Rasenpilot',
            image: 'https://rasenpilot.de/logo.png'
          }
        }}
      />
      
      <div className="container mx-auto px-4 mb-2 sm:mb-4">
        <Logo showTagline={true} />
      </div>
      
      <HeroSection />
      <SpecialFeaturesSection />
      <HowItWorksSection />
      <FeaturesSection />
      <CallToActionSection />
      <FooterSection />
    </div>
  );
};

export default Landing;
