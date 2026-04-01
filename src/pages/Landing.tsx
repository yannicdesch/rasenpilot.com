
import React from 'react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import HeroSection from '@/components/landing/HeroSection';
import DemoAnalysisPreview from '@/components/landing/DemoAnalysisPreview';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FreeVsPremiumSection from '@/components/landing/FreeVsPremiumSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import FooterSection from '@/components/landing/FooterSection';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';
import ExitIntentPopup from '@/components/ExitIntentPopup';
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
              seller: { "@type": "Organization", name: "Rasenpilot" }
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: "4.8",
              reviewCount: "7",
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
      <DemoAnalysisPreview />
      <HowItWorksSection />
      <FeaturesSection />
      <FreeVsPremiumSection />
      <CallToActionSection />
      
      {/* Blog Call-to-Action */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-12 md:py-16 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <BookOpen className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                  Expertentipps für deinen perfekten Rasen
                </h3>
                <p className="text-base text-muted-foreground max-w-xl">
                  Professionelle Ratgeber, saisonale Pflegetipps und bewährte Strategien
                </p>
              </div>
              <Button 
                onClick={handleBlogClick}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg px-8 py-5 text-base"
              >
                Zum Ratgeber <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <FooterSection />
      <StickyMobileCTA />
      <ExitIntentPopup />
    </div>
  );
};

export default Landing;
