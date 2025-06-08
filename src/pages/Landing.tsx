
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Leaf, Camera, MessageSquare } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <SEO 
        title="Intelligenter KI-Rasenberater"
        description="Erstelle kostenlos deinen personalisierten Rasenpflegeplan in nur 30 Sekunden. KI-gestützte Empfehlungen basierend auf deinem Standort, Rasentyp und Zielen für einen perfekten Rasen."
        canonical="/"
        keywords="Rasenpflege kostenlos, KI Rasenberater, Rasenpflegeplan erstellen, Rasen-Analyse, intelligente Rasenpflege, Rasen-Tipps, Gartenpflege Deutschland"
        structuredData={{
          type: 'Service',
          data: {
            name: 'Rasenpilot KI-Rasenberatung',
            description: 'Intelligente KI-gestützte Rasenpflege-Beratung für den perfekten Rasen',
            url: 'https://rasenpilot.de',
            serviceType: 'Rasenpflege-Beratung',
            provider: 'Rasenpilot',
            image: 'https://rasenpilot.de/logo.png'
          }
        }}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-white py-20">
        {/* Add Logo at the top */}
        <div className="container mx-auto px-4 mb-8">
          <Logo showTagline={true} />
        </div>
        
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-medium">
              Neu: KI-gestützte Rasenpflege
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Was ist los mit deinem Rasen? Unsere KI sagt es dir – <span className="text-green-600">in nur 60 Sekunden.</span>
            </h1>
            <h2 className="text-lg md:text-xl text-gray-700 max-w-2xl">
              Lade ein Foto hoch oder beschreibe dein Problem – LawnAnalyzer gibt dir sofort eine kostenlose Einschätzung und professionelle Pflegeempfehlungen.
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/onboarding')} 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg"
                aria-label="Kostenlose Rasenanalyse starten"
              >
                Jetzt kostenlos Rasen analysieren <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                size="lg"
                className="border-green-200 text-green-700 hover:bg-green-50 text-lg"
                aria-label="Bei Rasenpilot anmelden"
              >
                Anmelden
              </Button>
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
            <AspectRatio ratio={16/9}>
              <img 
                src="/placeholder.svg" 
                alt="Rasenpilot KI-Rasenanalyse App Demo - Intelligente Rasenpflege in Aktion" 
                className="w-full h-full object-cover rounded-xl" 
                loading="eager"
              />
            </AspectRatio>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white" id="so-funktionierts">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              So funktioniert die KI-Rasenanalyse
            </h2>
            <p className="text-lg text-gray-700">
              Drei einfache Schritte zu deinem perfekten Rasen mit intelligenter KI-Unterstützung.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Foto hochladen oder Problem beschreiben</h3>
              <p className="text-gray-600">
                Lade ein Foto deines Rasens hoch oder beschreibe dein Rasenproblem. Unsere KI analysiert sofort den Zustand und erkennt Probleme wie Moos, Unkraut oder Nährstoffmangel.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">KI-Analyse erhalten</h3>
              <p className="text-gray-600">
                Erhalte eine detaillierte KI-gestützte Analyse mit präziser Problemerkennung und maßgeschneiderten Behandlungsempfehlungen für deinen Rasentyp.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Pflegeplan umsetzen</h3>
              <p className="text-gray-600">
                Befolge den personalisierten Pflegeplan mit Schritt-für-Schritt Anleitungen, Produktempfehlungen und zeitbasierten Aufgaben für deinen Traumrasen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50" id="kostenlose-funktionen">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Kostenlose KI-Rasenanalyse - Intelligent & Präzise
            </h2>
            <p className="text-lg text-gray-700">
              Starte mit einer kostenlosen, KI-gestützten Analyse deines Rasens und erhalte professionelle Empfehlungen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <Camera className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">KI-Bildanalyse</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Lade ein Foto hoch und erhalte sofort eine detaillierte KI-Analyse deines Rasens mit Problemerkennung und Lösungsvorschlägen.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Automatische Problemerkennung in Sekunden</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Personalisierte KI-Behandlungsempfehlungen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Erkennung von Moos, Unkraut, Nährstoffmangel</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <Leaf className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Intelligente Rasenpflege</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Profitiere von jahrelanger Rasenpflege-Expertise und wissenschaftlichen Erkenntnissen, intelligent verpackt in unserer KI.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Wetterbasierte Pflegeempfehlungen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Einfache Schritt-für-Schritt Anleitungen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Saisonale Pflegetipps und Produktempfehlungen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-green-600" id="jetzt-starten">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Starte jetzt deine kostenlose KI-Rasenanalyse
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Lade ein Foto hoch und erhalte sofort intelligente, KI-gestützte Empfehlungen für deinen perfekten Rasen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/onboarding')} 
              size="lg"
              className="bg-white text-green-700 hover:bg-green-100 text-lg"
              aria-label="Kostenlose KI-Rasenanalyse starten"
            >
              Jetzt kostenlos analysieren
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-10 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-2xl font-bold text-green-600">Rasenpilot</h2>
              <p className="text-gray-600 mt-2">Der intelligente KI-gestützte Rasenexperte</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kostenlose Tools</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" onClick={() => navigate('/onboarding')} className="p-0 h-auto text-gray-600">KI-Rasenanalyse</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/free-plan')} className="p-0 h-auto text-gray-600">Kostenloser Pflegeplan</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/auth')} className="p-0 h-auto text-gray-600">Anmelden</Button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Rechtliches</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" onClick={() => navigate('/datenschutz')} className="p-0 h-auto text-gray-600">Datenschutz</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/nutzungsbedingungen')} className="p-0 h-auto text-gray-600">Nutzungsbedingungen</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/impressum')} className="p-0 h-auto text-gray-600">Impressum</Button></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-10 pt-6 text-center">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Rasenpilot - Intelligenter KI-Rasenberater. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
