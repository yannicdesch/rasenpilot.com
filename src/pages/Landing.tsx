
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
        title="Rasenpilot - Intelligenter KI-Rasenberater | Kostenloser Pflegeplan in 30 Sekunden"
        description="Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen. Sofort starten - ohne Anmeldung."
        canonical="/"
        keywords="Rasenpflege Deutschland,KI-Rasenberater,intelligenter Rasen-Assistent,kostenloser Rasenpflegeplan,Rasen düngen,Rasen mähen,Rasenpilot,Rasenberatung,Rasen-Analyse kostenlos,Rasen-Probleme"
        type="website"
        structuredData={{
          type: 'Organization',
          data: {
            name: 'Rasenpilot',
            alternateName: 'Rasenpilot - Intelligenter KI-Rasenberater',
            description: 'Deutschlands führende KI-Plattform für intelligente Rasenpflege mit kostenlosen personalisierten Pflegeplänen',
            url: 'https://rasenpilot.de',
            logo: 'https://rasenpilot.de/logo.png',
            foundingDate: '2024',
            founder: 'Rasenpilot Team',
            areaServed: {
              "@type": "Country",
              name: "Deutschland"
            },
            serviceType: 'KI-gestützte Rasenpflege-Beratung',
            hasOfferCatalog: {
              "@type": "OfferCatalog",
              name: "Rasenpflege-Services",
              itemListElement: [
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: "Kostenloser KI-Rasenpflegeplan",
                    description: "Personalisierter Rasenpflegeplan in 30 Sekunden"
                  }
                },
                {
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service", 
                    name: "KI-Rasenanalyse",
                    description: "Intelligente Analyse Ihres Rasens mit Empfehlungen"
                  }
                }
              ]
            },
            sameAs: [
              "https://www.facebook.com/rasenpilot",
              "https://www.instagram.com/rasenpilot",
              "https://twitter.com/rasenpilot"
            ]
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
