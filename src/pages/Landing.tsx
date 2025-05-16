import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Leaf, CalendarDays, CloudRain, Camera, MessageSquare, Star } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Logo from '@/components/Logo';

const Landing = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
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
              Ihr perfekter Rasen mit <span className="text-green-600">KI-Unterstützung</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl">
              Rasenpilot analysiert Ihren Rasen und erstellt einen personalisierten Pflegeplan basierend auf Wetter, Bodentyp und Ihren Zielen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/free-plan')} 
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg"
              >
                Gratis Pflegeplan erstellen <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                size="lg"
                className="border-green-200 text-green-700 hover:bg-green-50 text-lg"
              >
                Anmelden
              </Button>
            </div>
          </div>
          <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
            <AspectRatio ratio={16/9}>
              <img 
                src="/placeholder.svg" 
                alt="Rasenpilot App Demo" 
                className="w-full h-full object-cover rounded-xl" 
              />
            </AspectRatio>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              So funktioniert's
            </h2>
            <p className="text-lg text-gray-700">
              Rasenpilot vereinfacht die Rasenpflege mit maßgeschneiderten Empfehlungen in nur drei einfachen Schritten.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Profil erstellen</h3>
              <p className="text-gray-600">
                Beantworten Sie einige einfache Fragen zu Ihrem Rasen, wie Größe, Grassorte und gewünschtes Ergebnis.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Foto hochladen</h3>
              <p className="text-gray-600">
                Laden Sie ein Foto Ihres Rasens hoch und unsere KI analysiert den Zustand und erkennt potenzielle Probleme.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                <span className="text-green-700 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Plan befolgen</h3>
              <p className="text-gray-600">
                Erhalten Sie einen maßgeschneiderten Pflegeplan mit täglichen Aufgaben basierend auf Ihrem Rasen und lokalem Wetter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Alle Funktionen im Überblick
            </h2>
            <p className="text-lg text-gray-700">
              Entdecken Sie, was Rasenpilot zu Ihrem persönlichen Rasenexperten macht
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <Leaf className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">14-Tage Pflegeplan</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Beginnen Sie kostenlos mit einem personalisierten 14-Tage Pflegeplan, der auf Ihren Rasentyp und Ihre Ziele abgestimmt ist.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Tägliche Aufgaben für eine optimale Pflege</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Wetterbasierte Empfehlungen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <Camera className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">KI-Rasenanalyse</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie eine detaillierte Analyse der Gesundheit und Problemzonen.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Erkennung von Krankheiten und Schädlingen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Personalisierte Behandlungsempfehlungen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <MessageSquare className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">KI-Rasenexperte Chat</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Stellen Sie Fragen zu Ihrem Rasen und erhalten Sie sofortige Antworten von unserem KI-gestützten Rasenexperten.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Spezifische Hilfe zu Ihren Rasenproblemen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Unterstützung bei Dünger- und Samenwahl</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-100 overflow-hidden">
              <div className="bg-green-50 p-4 flex items-center">
                <CloudRain className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Wetterbasierte Empfehlungen</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Automatische Anpassung Ihres Pflegeplans basierend auf der lokalen Wettervorhersage und den Bedürfnissen Ihres Rasens.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Optimierte Bewässerungspläne</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Intelligente Mäh- und Düngeempfehlungen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-green-100 overflow-hidden md:col-span-2">
              <div className="bg-green-50 p-4 flex items-center">
                <CalendarDays className="h-6 w-6 text-green-600 mr-3" />
                <h3 className="text-xl font-bold text-gray-900">Smarter Rasenkalender (Pro)</h3>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4">
                  Mit dem Pro-Plan erhalten Sie Zugriff auf einen vollständigen Jahreskalender für Ihren Rasen, der saisonale Aktivitäten und lokale Bedingungen berücksichtigt.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <span>Vollständiger Jahresplan</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <span>Saisonale Anpassungen</span>
                    </li>
                  </ul>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <span>Erinnerungen für wichtige Aufgaben</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                      <span>Fortschrittsverfolgung</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Free vs Pro Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Vergleich: Kostenlos vs. Pro
            </h2>
            <p className="text-lg text-gray-700">
              Wählen Sie den Plan, der am besten zu Ihnen passt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-100">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Kostenloser Plan</h3>
                  <p className="text-lg text-green-600 font-bold">€0 / Monat</p>
                  <p className="text-gray-600 mt-2">Perfekt zum Starten</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>14-Tage personalisierter Pflegeplan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>1x KI-Rasenanalyse (Foto-Upload)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>3 Fragen an den KI-Rasenexperten</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Grundlegende Wettervorhersage</span>
                  </li>
                </ul>

                <Button
                  onClick={() => navigate('/free-plan')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Kostenlos starten
                </Button>
              </CardContent>
            </Card>

            <Card className="border-green-600 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-600 text-white px-4 py-1 rounded-bl-lg font-medium">
                Empfohlen
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro Plan</h3>
                  <p className="text-lg text-green-600 font-bold">€4.99 / Monat</p>
                  <p className="text-gray-600 mt-2">Vollständige Unterstützung</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Vollständiger Jahres-Pflegeplan</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Unbegrenzte KI-Rasenanalysen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Unbegrenzter Zugang zum KI-Rasenexperten</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Fortgeschrittene Wetterintegration</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Foto-Zeitverlauf zur Fortschrittsverfolgung</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 shrink-0" />
                    <span>Erinnerungen & Benachrichtigungen</span>
                  </li>
                </ul>

                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Pro-Zugang freischalten
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Das sagen unsere Nutzer
            </h2>
            <p className="text-lg text-gray-700">
              Entdecken Sie, wie Rasenpilot Gartenbesitzern zu einem gesünderen und schöneren Rasen verhilft
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  "Seit ich Rasenpilot nutze, hat sich mein Rasen komplett erholt. Die KI-Analyse hat mir geholfen, Probleme zu erkennen, die ich selbst übersehen hatte."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Michael Schneider</p>
                    <p className="text-sm text-gray-500">Hobbygärtner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  "Der personalisierte Pflegeplan hat mir die Arbeit enorm erleichtert. Endlich weiß ich genau, wann ich was tun muss, um meinen Rasen optimal zu pflegen."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Laura Wagner</p>
                    <p className="text-sm text-gray-500">Hausbesitzerin</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6">
                  "Als Anfänger in der Rasenpflege war ich anfangs überfordert. Mit Rasenpilot kann ich jetzt Schritt für Schritt vorgehen und sehe echte Verbesserungen."
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">Thomas Müller</p>
                    <p className="text-sm text-gray-500">Neuer Hausbesitzer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bereit für einen gesünderen Rasen?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Starten Sie noch heute mit Ihrem kostenlosen personalisierten Pflegeplan und sehen Sie selbst den Unterschied.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              onClick={() => navigate('/free-plan')} 
              size="lg"
              className="bg-white text-green-700 hover:bg-green-100 text-lg"
            >
              Kostenlos starten
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-green-700/50 text-lg"
            >
              Anmelden
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
              <p className="text-gray-600 mt-2">Der KI-gestützte Rasenexperte</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Produkt</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" onClick={() => navigate('/free-plan')} className="p-0 h-auto text-gray-600">Kostenloser Plan</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/auth')} className="p-0 h-auto text-gray-600">Pro Plan</Button></li>
                  <li><Button variant="link" onClick={() => navigate('/free-analysis')} className="p-0 h-auto text-gray-600">Rasenanalyse</Button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Ressourcen</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">Blog</Button></li>
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">FAQ</Button></li>
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">Support</Button></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Rechtliches</h3>
                <ul className="space-y-2">
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">Datenschutz</Button></li>
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">Nutzungsbedingungen</Button></li>
                  <li><Button variant="link" className="p-0 h-auto text-gray-600">Impressum</Button></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-200 mt-10 pt-6 text-center">
            <p className="text-gray-600 text-sm">
              &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
