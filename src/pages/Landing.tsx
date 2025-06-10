
import React from 'react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import HeroSection from '@/components/landing/HeroSection';
import SpecialFeaturesSection from '@/components/landing/SpecialFeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import FooterSection from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();
  
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
      
      {/* Blog Call-to-Action */}
      <div className="bg-green-50 border-b border-green-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Expertentipps für Ihren Rasen</h3>
                <p className="text-sm text-green-700">Entdecken Sie unsere aktuellen Ratgeber und Pflegetipps</p>
              </div>
            </div>
            <Button 
              onClick={() => navigate('/blog-overview')}
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              Zum Blog <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
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
