
import React from 'react';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import HeroSection from '@/components/landing/HeroSection';
import SpecialFeaturesSection from '@/components/landing/SpecialFeaturesSection';
import HowItWorksSection from '@/components/landing/HowItWorksSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import FreeVsPremiumSection from '@/components/landing/FreeVsPremiumSection';
import CallToActionSection from '@/components/landing/CallToActionSection';
import FooterSection from '@/components/landing/FooterSection';
import StickyMobileCTA from '@/components/landing/StickyMobileCTA';
import Testimonials from '@/components/Testimonials';
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
      <FreeVsPremiumSection />
      
      {/* Social Proof - Testimonials */}
      <div className="py-16 bg-gradient-to-b from-background to-accent/20">
        <div className="container mx-auto px-4">
          <Testimonials 
            title="Das sagen unsere Nutzer"
            testimonials={[
              {
                id: 1,
                name: "Markus R.",
                location: "Stuttgart",
                rating: 5,
                text: "Endlich weiß ich, was meinem Rasen wirklich fehlt. Die KI-Analyse hat sofort erkannt, dass mein Boden zu verdichtet war. Nach 4 Wochen sieht mein Garten aus wie vom Profi gepflegt!",
                lawnType: "Zierrasen",
                improvement: "Von 38 auf 91 Punkte"
              },
              {
                id: 2,
                name: "Julia H.",
                location: "Köln",
                rating: 5,
                text: "Als berufstätige Mutter habe ich wenig Zeit für den Garten. Der Pflegekalender sagt mir genau, wann ich was tun muss. Mein Rasen war noch nie so grün – und ich spare sogar Zeit!",
                lawnType: "Spielrasen",
                improvement: "Von 42 auf 87 Punkte"
              },
              {
                id: 3,
                name: "Frank W.",
                location: "München",
                rating: 5,
                text: "Die Wetter-Integration ist genial. Ich bekomme immer genau die richtigen Tipps zur richtigen Zeit. Meine Nachbarn fragen schon, wie ich das geschafft habe.",
                lawnType: "Gebrauchsrasen",
                improvement: "Von 55 auf 93 Punkte"
              }
            ]}
          />
        </div>
      </div>

      <CallToActionSection />
      
      {/* Blog Call-to-Action */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/10 to-primary/5 border-y border-primary/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="container mx-auto px-4 py-16 relative">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center gap-8">
              <div className="p-4 bg-primary/10 rounded-2xl">
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl md:text-4xl font-bold text-foreground font-serif">
                  Expertentipps für Ihren perfekten Rasen
                </h3>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Entdecken Sie professionelle Ratgeber, saisonale Pflegetipps und bewährte Strategien für einen gesunden, grünen Rasen
                </p>
              </div>
              <Button 
                onClick={handleBlogClick}
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 px-8 py-6 text-lg"
              >
                Zum Ratgeber <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <FooterSection />
      <StickyMobileCTA />
    </div>
  );
};

export default Landing;
