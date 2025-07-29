import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowRight, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const SimplifiedLanding = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/onboarding');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Helmet>
        <title>Rasenpilot - Kostenloser KI-Rasenpflegeplan in 30 Sekunden</title>
        <meta name="description" content="Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen. Sofort starten - ohne Anmeldung." />
        <meta name="keywords" content="Rasenpflege Deutschland, KI-Rasenberater, kostenloser Rasenpflegeplan, Rasen düngen, Rasen mähen, Rasenpilot, Rasenberatung, Rasen-Analyse kostenlos" />
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="googlebot" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="language" content="de" />
        <meta name="geo.region" content="DE" />
        <meta name="geo.country" content="Deutschland" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Rasenpilot - Kostenloser KI-Rasenpflegeplan in 30 Sekunden" />
        <meta property="og:description" content="Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.com" />
        <meta property="og:image" content="https://rasenpilot.com/og-image.jpg" />
        <link rel="canonical" href="https://rasenpilot.com" />
        
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Rasenpilot",
            "description": "Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Rasenanalyse basierend auf Standort, Rasentyp & Zielen.",
            "url": "https://rasenpilot.com",
            "applicationCategory": "UtilitiesApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "EUR"
            }
          })}
        </script>
      </Helmet>

      
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="text-xl font-bold text-green-800">Rasenpilot</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-6">
            Dein persönlicher Rasenpflegeplan in{' '}
            <span className="text-green-600">30 Sekunden</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Erstelle kostenlos deinen personalisierten Rasenpflegeplan mit KI-gestützter Analyse basierend auf Standort, Rasentyp und deinen Zielen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              onClick={handleGetStarted} 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg"
            >
              Kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-1" />
              <span>Kein Konto nötig</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-1" />
              <span>Sofort verfügbar</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-1" />
              <span>KI-optimiert</span>
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-1" />
              <span>Wetter-basiert</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-6 text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <CardTitle className="text-xl">Schnelle Analyse</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Beantworte 3 einfache Fragen zu deinem Rasen und erhalte sofort deinen personalisierten Plan.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <CardTitle className="text-xl">KI-Empfehlungen</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Unsere KI erstellt basierend auf Wetter, Standort und Rasentyp den optimalen Pflegeplan.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="p-6 text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <CardTitle className="text-xl">Sofortige Ergebnisse</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Erhalte täglich konkrete Aufgaben und Tipps für deinen perfekten Rasen.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center bg-green-50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-green-800 mb-4">
            Tausende zufriedene Nutzer vertrauen bereits auf Rasenpilot
          </h2>
          <div className="flex justify-center items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
            ))}
            <span className="ml-2 text-gray-600">4.8/5 Bewertung</span>
          </div>
          <p className="text-gray-600 mb-6">
            "Endlich ein Rasenpflegeplan, der wirklich funktioniert! Mein Rasen sieht nach nur 2 Wochen deutlich besser aus."
          </p>
          <Button 
            onClick={handleGetStarted} 
            size="lg" 
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            Jetzt kostenlos testen <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>&copy; 2024 Rasenpilot. Alle Rechte vorbehalten.</p>
        </div>
      </footer>
    </div>
  );
};

export default SimplifiedLanding;
