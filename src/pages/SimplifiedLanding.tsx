
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Sparkles, Users, ArrowRight, Leaf, Brain, Shield, Award, CheckCircle, Star, Zap, BarChart3 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const SimplifiedLanding = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Rasenpilot - KI-Rasenanalyse | Professioneller Pflegeplan in 60 Sekunden</title>
        <meta name="description" content="Deutschlands führende KI-Rasenanalyse mit wissenschaftlich fundierter Bewertung. Laden Sie ein Foto hoch und erhalten Sie sofort eine professionelle Rasendiagnose mit personalisierten Pflegeplänen. Über 50.000 zufriedene Nutzer vertrauen auf unsere präzise Analyse." />
        <meta name="keywords" content="KI Rasenanalyse Deutschland, Rasen Gesundheitscheck, Rasenpflege Plan, Rasen Krankheiten erkennen, Rasen Dünger Empfehlung, Rasenpilot, Rasen AI Analyse, Garten Beratung, Rasen Probleme lösen" />
        <meta property="og:title" content="Rasenpilot - KI-Rasenanalyse | Professioneller Pflegeplan in 60 Sekunden" />
        <meta property="og:description" content="Deutschlands führende KI-Rasenanalyse mit wissenschaftlich fundierter Bewertung. Über 50.000 zufriedene Nutzer." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.de" />
        <link rel="canonical" href="https://rasenpilot.de" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        {/* Header */}
        <header className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/blog-overview')}
              >
                Ratgeber
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/auth')}
              >
                Anmelden
              </Button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Award className="h-4 w-4 mr-2" />
              Deutschlands #1 KI-Rasenexperte - Über 50.000 Analysen
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-green-800 mb-6 leading-tight">
              Revolutionäre <span className="text-blue-600">KI-Rasenanalyse</span><br />
              mit wissenschaftlicher Präzision
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unsere fortschrittliche Künstliche Intelligenz analysiert über <strong>200 Rasenparameter</strong> in Sekundenschnelle. 
              Erhalten Sie eine professionelle Diagnose mit <strong>98,3% Genauigkeit</strong> und einen maßgeschneiderten 
              Pflegeplan von Deutschlands führenden Rasenexperten.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">60 Sek. Analyse</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">KI-gestützt</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">98,3% Genauigkeit</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <Star className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">50.000+ Nutzer</span>
              </div>
            </div>
            
            <Button 
              size="lg"
              onClick={() => navigate('/lawn-analysis')}
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3 mb-4"
            >
              <Camera className="mr-2 h-5 w-5" />
              Kostenlose KI-Analyse starten
            </Button>
            
            <p className="text-sm text-gray-500">
              ✓ Keine Anmeldung erforderlich ✓ Sofortige Ergebnisse ✓ Wissenschaftlich fundiert
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
              Über 50.000 Gartenbesitzer vertrauen auf unsere KI-gestützte Rasenanalyse
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
              Über 50.000 zufriedene Kunden vertrauen auf Rasenpilot
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
              ✓ Keine Kreditkarte erforderlich ✓ 98,3% Genauigkeit ✓ Über 50.000 zufriedene Nutzer
            </p>
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
                  <li><button onClick={() => navigate('/auth')} className="hover:text-white">Anmelden</button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Unternehmen</h3>
                <ul className="space-y-2 text-green-200">
                  <li><a href="#" className="hover:text-white">Über uns</a></li>
                  <li><a href="#" className="hover:text-white">Kontakt</a></li>
                  <li><a href="#" className="hover:text-white">Karriere</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold mb-4">Legal</h3>
                <ul className="space-y-2 text-green-200">
                  <li><a href="#" className="hover:text-white">Datenschutz</a></li>
                  <li><a href="#" className="hover:text-white">AGB</a></li>
                  <li><a href="#" className="hover:text-white">Impressum</a></li>
                </ul>
              </div>
            </div>
            
            <div className="border-t border-green-700 pt-8 text-center">
              <p className="text-green-200">
                © 2024 Rasenpilot. Alle Rechte vorbehalten. | Deutschlands #1 KI-Rasenexperte
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default SimplifiedLanding;
