
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
import { useInteractionTracking } from '@/hooks/useJourneyTracking';

const Landing = () => {
  const navigate = useNavigate();
  const { trackButtonClick } = useInteractionTracking('/');
  
  const handleBlogClick = () => {
    trackButtonClick('blog_cta_button', { section: 'blog_promotion' });
    navigate('/blog-overview');
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Rasenpilot - Intelligenter KI-Rasenberater | Kostenloser Pflegeplan in 30 Sekunden"
        description="Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen. Sofort starten - ohne Anmeldung."
        canonical="https://www.rasenpilot.com/"
        keywords="Rasenpflege Deutschland,KI-Rasenberater,intelligenter Rasen-Assistent,kostenloser Rasenpflegeplan,Rasen düngen,Rasen mähen,Rasenpilot,Rasenberatung,Rasen-Analyse kostenlos,Rasen-Probleme"
        type="website"
        structuredData={{
          type: 'Product',
          data: {
            name: 'KI-Rasenpflegeplan von Rasenpilot',
            description: 'Kostenloser personalisierter Rasenpflegeplan in 30 Sekunden. KI-gestützte Rasenanalyse mit professionellen Empfehlungen.',
            url: 'https://rasenpilot.com',
            image: 'https://rasenpilot.com/og-image.jpg',
            brand: 'Rasenpilot',
            category: 'Gartenberatung',
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "EUR",
              availability: "https://schema.org/InStock",
              validFrom: new Date().toISOString(),
              seller: {
                "@type": "Organization",
                name: "Rasenpilot"
              }
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "150",
              bestRating: "5",
              worstRating: "1"
            }
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
      
      {/* Blog Call-to-Action */}
      <div className="bg-green-50 border-y border-green-100">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="text-xl font-semibold text-green-800">Expertentipps für Ihren Rasen</h3>
                <p className="text-green-700">Entdecken Sie unsere aktuellen Ratgeber und Pflegetipps</p>
              </div>
            </div>
            <Button 
              onClick={handleBlogClick}
              className="bg-green-600 hover:bg-green-700 px-6 py-3"
            >
              Zum Blog <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      <FooterSection />
    </div>
  );
};

export default Landing;
