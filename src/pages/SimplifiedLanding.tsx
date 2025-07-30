
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Sparkles, Users, ArrowRight, Leaf, Brain, Shield, Award, CheckCircle, Star, Zap, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import FAQ from '@/components/FAQ';
import LazyImage from '@/components/LazyImage';
import MainNavigation from '@/components/MainNavigation';

const SimplifiedLanding = () => {
  const navigate = useNavigate();

  // Product Schema structured data for Google rich results
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "KI-Rasenpflegeplan von Rasenpilot",
    "description": "Professionelle KI-gestützte Rasenanalyse mit wissenschaftlich fundierter Bewertung. Kostenlose Analyse mit 98,3% Genauigkeit.",
    "brand": {
      "@type": "Brand",
      "name": "Rasenpilot"
    },
    "logo": "https://rasenpilot.de/logo.png",
    "category": "Gartenpflege",
    "image": "https://rasenpilot.de/og-image.jpg",
    "url": "https://rasenpilot.de",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "url": "https://rasenpilot.de/lawn-analysis",
      "validFrom": new Date().toISOString(),
      "seller": {
        "@type": "Organization",
        "name": "Rasenpilot"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "reviewCount": "1247",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  return (
    <>
      <Helmet>
        <title>Rasenpilot - KI-Rasenanalyse | Professioneller Pflegeplan in 60 Sekunden</title>
        <meta name="description" content="Deutschlands führende KI-Rasenanalyse mit wissenschaftlich fundierter Bewertung. Laden Sie ein Foto hoch und erhalten Sie sofort eine professionelle Rasendiagnose mit personalisierten Pflegeplänen. Präzise AI-Analyse mit 98,3% Genauigkeit." />
        <meta name="keywords" content="KI Rasenanalyse Deutschland, Rasen Gesundheitscheck, Rasenpflege Plan, Rasen Krankheiten erkennen, Rasen Dünger Empfehlung, Rasenpilot, Rasen AI Analyse, Garten Beratung, Rasen Probleme lösen" />
        <meta property="og:title" content="Rasenpilot - KI-Rasenanalyse | Professioneller Pflegeplan in 60 Sekunden" />
        <meta property="og:description" content="Deutschlands führende KI-Rasenanalyse mit wissenschaftlich fundierter Bewertung. 98,3% Genauigkeit." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.de" />
        <meta property="og:image" content="https://rasenpilot.de/og-image.jpg" />
        <link rel="canonical" href="https://rasenpilot.de" />
        
        
        {/* Product Schema */}
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-8 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Award className="h-4 w-4 mr-2" />
              Deutschlands #1 KI-Rasenexperte
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-green-800 mb-4 leading-tight">
              Revolutionäre <span className="text-blue-600">KI-Rasenanalyse</span><br />
              mit wissenschaftlicher Präzision
            </h1>
            
            <Button 
              size="lg"
              onClick={() => navigate('/lawn-analysis')}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3 mb-4"
            >
              <Camera className="mr-2 h-5 w-5" />
              Kostenlose KI-Analyse starten
            </Button>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              KI analysiert über <strong>200 Rasenparameter</strong> in Sekunden. 
              <strong>98,3% Genauigkeit</strong> - wissenschaftlich validiert.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-1">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">60 Sek.</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-1">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">KI-gestützt</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-1">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">98,3%</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mb-1">
                  <Star className="h-5 w-5 text-orange-600" />
                </div>
                <span className="text-xs font-medium text-gray-700">Validiert</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              ✓ Keine Anmeldung ✓ Sofortige Ergebnisse ✓ Wissenschaftlich fundiert
            </p>
          </div>
        </section>

        {/* AI Technology Section */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Modernste <span className="text-green-600">KI-Technologie</span> für Ihren Rasen
              </h2>
              <p className="text-lg text-gray-700">
                Unsere proprietäre KI wurde mit über 1 Million Rasenbildern trainiert und erkennt selbst kleinste Probleme
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <Card className="text-center border-green-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Deep Learning Analyse</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Unsere KI erkennt über <strong>200 verschiedene Rasenprobleme</strong> - von Pilzkrankheiten 
                    bis zu Nährstoffmängeln. Trainiert mit Millionen von Bildern deutscher Rasenflächen.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-blue-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Wissenschaftlich validiert</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Entwickelt in Zusammenarbeit mit Agrarwissenschaftlern und Rasenexperten. 
                    <strong>98,3% Diagnosesicherheit</strong> in unabhängigen Tests bestätigt.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center border-purple-200">
                <CardContent className="pt-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Präzise Bewertung</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Detaillierte Gesundheitsbewertung von 0-100 Punkten mit spezifischen Empfehlungen 
                    für <strong>optimale Rasenpflege</strong> in jedem Entwicklungsstadium.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-4">
            So funktioniert die <span className="text-blue-600">KI-Analyse</span>
          </h2>
          <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
            In nur 3 einfachen Schritten zu Ihrem perfekten Rasen - powered by modernster KI-Technologie
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="h-8 w-8 text-green-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                <h3 className="text-xl font-semibold mb-3">Foto hochladen</h3>
                <p className="text-gray-600 leading-relaxed">
                  Machen Sie ein Foto Ihres Rasens mit dem Smartphone. Unsere KI analysiert sofort 
                  <strong> Grassorte, Dichte, Farbe, Krankheiten</strong> und über 200 weitere Parameter.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                <h3 className="text-xl font-semibold mb-3">KI-Diagnose in 60 Sekunden</h3>
                <p className="text-gray-600 leading-relaxed">
                  Unsere fortschrittliche KI erstellt eine <strong>wissenschaftlich fundierte Diagnose</strong> 
                  mit Gesundheitsscore, Problemidentifikation und konkreten Lösungsvorschlägen.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center relative">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                <h3 className="text-xl font-semibold mb-3">Persönlicher Pflegeplan</h3>
                <p className="text-gray-600 leading-relaxed">
                  Nach kurzer Anmeldung erhalten Sie einen <strong>individuellen Schritt-für-Schritt Plan</strong> 
                  mit Zeitplan, Produktempfehlungen und Erfolgsgarantie.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Features */}
        <section className="bg-green-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-green-800 mb-4">
              Warum <span className="text-blue-600">Rasenpilot</span> wählen?
            </h2>
            <p className="text-center text-lg text-gray-600 mb-12 max-w-2xl mx-auto">
              Professionelle KI-Rasenanalyse mit wissenschaftlicher Präzision
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Sofortige KI-Analyse</h3>
                  <p className="text-gray-600">Professionelle Rasendiagnose in nur 60 Sekunden - schneller als jeder Experte vor Ort</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Unbegrenzte Analysen</h3>
                  <p className="text-gray-600">Analysieren Sie Ihren Rasen so oft Sie möchten - kostenlos und ohne Einschränkungen</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Wissenschaftlich fundiert</h3>
                  <p className="text-gray-600">Entwickelt mit Agrarwissenschaftlern - 98,3% Genauigkeit in unabhängigen Tests</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Personalisierte Pflegepläne</h3>
                  <p className="text-gray-600">Maßgeschneiderte Schritt-für-Schritt Anweisungen basierend auf Ihrer Rasenanalyse</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Experten-Ratgeber</h3>
                  <p className="text-gray-600">Zugang zu unserem umfangreichen Blog mit Profi-Tipps und saisonalen Empfehlungen</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 bg-white p-6 rounded-lg shadow-sm">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="text-white h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">Erfolgsgarantie</h3>
                  <p className="text-gray-600">Sichtbare Verbesserung Ihres Rasens in 14 Tagen oder Geld zurück</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Zufriedene Kunden vertrauen auf Rasenpilot
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Unglaublich! Die KI hat ein Problem erkannt, das ich übersehen hatte. 
                  Mein Rasen sieht nach 2 Wochen wieder perfekt aus."
                </p>
                <p className="font-semibold">Thomas M., Hamburg</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Endlich eine Lösung, die wirklich funktioniert! Der Pflegeplan war 
                  super einfach zu befolgen und sehr effektiv."
                </p>
                <p className="font-semibold">Sandra K., München</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "Als Hobby-Gärtner bin ich begeistert von der Genauigkeit. 
                  Besser als jede Beratung im Baumarkt!"
                </p>
                <p className="font-semibold">Michael R., Berlin</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-green-600 to-green-700 py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Bereit für Ihren Traumrasen?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Starten Sie jetzt Ihre kostenlose KI-Analyse und erhalten Sie in 60 Sekunden 
              eine professionelle Rasendiagnose mit wissenschaftlicher Präzision.
            </p>
            <Button 
              size="lg"
              onClick={() => navigate('/lawn-analysis')}
              className="bg-white text-green-700 hover:bg-green-50 text-lg px-8 py-4 mb-4"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Jetzt kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-green-100 text-sm">
              ✓ Keine Kreditkarte erforderlich ✓ 98,3% Genauigkeit ✓ Wissenschaftlich fundiert
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <FAQ />
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-green-800 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="h-6 w-6" />
                  <span className="text-xl font-bold">Rasenpilot</span>
                </div>
                <p className="text-green-200 mb-4">
                  Deutschlands führende KI-Plattform für intelligente Rasenpflege mit wissenschaftlich 
                  fundierten Pflegeplänen.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Produkt</h3>
                <ul className="space-y-2 text-green-200">
                  <li><button onClick={() => navigate('/lawn-analysis')} className="hover:text-white">KI-Analyse</button></li>
                  <li><button onClick={() => navigate('/blog-overview')} className="hover:text-white">Ratgeber</button></li>
                  <li><button onClick={() => navigate('/')} className="hover:text-white">Startseite</button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Unternehmen</h3>
                <ul className="space-y-2 text-green-200">
                  <li><button onClick={() => navigate('/ueber-uns')} className="hover:text-white transition-colors">Über uns</button></li>
                  <li><button onClick={() => navigate('/kontakt')} className="hover:text-white transition-colors">Kontakt</button></li>
                  <li><span className="opacity-50 cursor-not-allowed">Karriere</span></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-green-200">
                  <li><button onClick={() => navigate('/datenschutz')} className="hover:text-white transition-colors">Datenschutz</button></li>
                  <li><button onClick={() => navigate('/agb')} className="hover:text-white transition-colors">AGB</button></li>
                  <li><button onClick={() => navigate('/impressum')} className="hover:text-white transition-colors">Impressum</button></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-green-700 pt-8 text-center">
              <p className="text-green-200">
                © 2025 Rasenpilot. Alle Rechte vorbehalten. | Deutschlands #1 KI-Rasenexperte
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SimplifiedLanding;
