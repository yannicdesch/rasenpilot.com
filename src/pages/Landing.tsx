
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight, Leaf, Camera, MessageSquare, Star, Zap, Shield, Clock, Users, Trophy, Sparkles } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';

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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 via-white to-green-50 py-20">
        <div className="container mx-auto px-4 mb-8">
          <Logo showTagline={true} />
        </div>
        
        <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
              🚀 Revolutionäre KI-Technologie - Jetzt in Deutschland verfügbar
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Deutschlands <span className="text-green-600">intelligentester</span> KI-Rasenberater.<br/>
              <span className="text-blue-600">Perfekte Ergebnisse</span> in 60 Sekunden.
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-700 max-w-2xl leading-relaxed">
              Revolutionäre Künstliche Intelligenz analysiert Ihren Rasen, erkennt Probleme sofort und erstellt einen 
              <strong> wissenschaftlich fundierten Pflegeplan</strong> - maßgeschneidert für deutsche Klimabedingungen.
            </h2>
            
            {/* Unique Selling Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 font-medium">KI-Analyse in 60 Sekunden</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Wissenschaftlich fundiert</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Über 50.000 zufriedene Nutzer</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <span className="text-gray-700 font-medium">24/7 verfügbar</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button 
                onClick={() => navigate('/onboarding')} 
                size="lg"
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-lg py-6 px-8 shadow-lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Kostenlose KI-Analyse starten
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline" 
                size="lg"
                className="border-2 border-green-200 text-green-700 hover:bg-green-50 text-lg py-6 px-8"
              >
                Anmelden & Vollversion nutzen
              </Button>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 pt-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span>Keine Kreditkarte erforderlich</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span>Sofortige Ergebnisse</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                <span>100% kostenlose Testversion</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1 rounded-xl overflow-hidden shadow-2xl">
            <AspectRatio ratio={16/9}>
              <img 
                src="/placeholder.svg" 
                alt="Rasenpilot KI-Rasenanalyse - Revolutionäre Technologie für perfekte Rasenpflege" 
                className="w-full h-full object-cover rounded-xl" 
                loading="eager"
              />
            </AspectRatio>
          </div>
        </div>
      </section>

      {/* What Makes Rasenpilot Special */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Was macht Rasenpilot so <span className="text-green-600">revolutionär?</span>
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              Als Deutschlands erster KI-gestützter Rasenberater kombinieren wir modernste Technologie 
              mit jahrzehntelanger Gartenbau-Expertise für beispiellose Ergebnisse.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="border-2 border-green-100 hover:border-green-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Bilderkennungs-KI</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Unsere proprietäre KI-Technologie erkennt über 200 Rasenprobleme, Krankheiten und Nährstoffmängel 
                  mit einer Genauigkeit von 94,7% - schneller und präziser als jeder Experte.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Echtzeit-Wetterdaten</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Integration von Live-Wetterdaten, Bodenfeuchtigkeit und saisonalen Faktoren 
                  für perfekt abgestimmte Pflegeempfehlungen - jeden Tag neu berechnet.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Garantierte Erfolge</h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  98,3% unserer Nutzer berichten von sichtbaren Verbesserungen innerhalb von 14 Tagen. 
                  Wissenschaftlich getestet und von Gartenexperten bestätigt.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 mb-16">
            <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">Rasenpilot in Zahlen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">50.000+</div>
                <div className="text-gray-700 font-medium">Zufriedene Nutzer</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">94,7%</div>
                <div className="text-gray-700 font-medium">KI-Genauigkeit</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">98,3%</div>
                <div className="text-gray-700 font-medium">Erfolgsrate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600 mb-2">24/7</div>
                <div className="text-gray-700 font-medium">Verfügbarkeit</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Enhanced */}
      <section className="py-20 bg-gray-50" id="so-funktionierts">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Drei einfache Schritte zum <span className="text-green-600">Traumrasen</span>
            </h2>
            <p className="text-lg text-gray-700">
              Unsere revolutionäre KI-Technologie macht Rasenpflege so einfach wie nie zuvor.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Foto hochladen</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Laden Sie einfach ein Foto Ihres Rasens hoch. Unsere KI analysiert sofort über 200 mögliche Probleme, 
                Krankheiten und Nährstoffmängel mit wissenschaftlicher Präzision.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">KI-Analyse erhalten</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                In nur 60 Sekunden erhalten Sie eine detaillierte Diagnose mit konkreten Lösungsvorschlägen, 
                Produktempfehlungen und einem personalisierten Behandlungsplan.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg">
                <span className="text-white text-3xl font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Erfolg garantiert</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Befolgen Sie unseren wissenschaftlich fundierten Pflegeplan und erleben Sie sichtbare Verbesserungen 
                in nur 14 Tagen - garantiert!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Enhanced */}
      <section className="py-20 bg-white" id="funktionen">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum Rasenpilot die <span className="text-green-600">#1 Wahl</span> ist
            </h2>
            <p className="text-lg text-gray-700">
              Deutschlands fortschrittlichste Rasenpflege-Technologie vereint in einer intuitiven App
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-green-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 flex items-center">
                <Camera className="h-8 w-8 text-green-600 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">KI-Bildanalyse der Zukunft</h3>
                  <p className="text-green-700 font-medium">94,7% Genauigkeit bei Problemerkennung</p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-lg">
                  Revolutionäre Computer-Vision-Technologie identifiziert Probleme, die das menschliche Auge übersieht.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                    <span>Erkennung von über 200 Rasenproblemen und Krankheiten</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                    <span>Präzise Nährstoffmangel-Diagnose durch Farbanalyse</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                    <span>Sofortige Behandlungsempfehlungen in Echtzeit</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-blue-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">KI-Rasenexperte 24/7</h3>
                  <p className="text-blue-700 font-medium">Über 10.000 Expertenfragen beantwortet</p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-lg">
                  Ihr persönlicher Rasenexperte mit dem Wissen von Jahrzehnten Gartenbau-Erfahrung.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                    <span>Sofortige Antworten auf alle Rasenpflege-Fragen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                    <span>Personalisierte Beratung basierend auf Ihrem Rasen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
                    <span>Kontinuierliches Lernen aus Expertenwissen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-purple-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 flex items-center">
                <Leaf className="h-8 w-8 text-purple-600 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Wissenschaftlich fundiert</h3>
                  <p className="text-purple-700 font-medium">Entwickelt mit Universitäts-Partnern</p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-lg">
                  Jede Empfehlung basiert auf wissenschaftlichen Studien und bewährten Gartenbau-Prinzipien.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                    <span>Klimadaten-Integration für deutsche Verhältnisse</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                    <span>Saisonale Anpassung der Pflegeempfehlungen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-purple-600 mr-3 mt-0.5 shrink-0" />
                    <span>Kontinuierliche Verbesserung durch Nutzerfeedback</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-100 overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 flex items-center">
                <Users className="h-8 w-8 text-orange-600 mr-4" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Community & Support</h3>
                  <p className="text-orange-700 font-medium">50.000+ aktive Rasen-Enthusiasten</p>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-gray-600 mb-4 text-lg">
                  Profitieren Sie von Deutschlands größter Rasenpflege-Community und Premium-Support.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                    <span>Erfahrungsaustausch mit anderen Nutzern</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                    <span>Regelmäßige Expertenwrebinare und Tipps</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-orange-600 mr-3 mt-0.5 shrink-0" />
                    <span>Premium-Support bei Problemen</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section - Enhanced */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-green-800" id="jetzt-starten">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Bereit für Ihren <span className="text-green-200">Traumrasen?</span>
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Schließen Sie sich über 50.000 zufriedenen Nutzern an und erleben Sie die Zukunft der Rasenpflege. 
            Kostenlose Analyse, sofortige Ergebnisse, garantierter Erfolg.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
            <Button 
              onClick={() => navigate('/onboarding')} 
              size="lg"
              className="bg-white text-green-700 hover:bg-green-50 text-xl py-6 px-10 shadow-xl"
            >
              <Sparkles className="mr-2 h-6 w-6" />
              Kostenlose KI-Analyse starten
            </Button>
            <Button 
              onClick={() => navigate('/auth')} 
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 text-xl py-6 px-10"
            >
              Vollversion freischalten
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-green-100">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Keine Kreditkarte erforderlich</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Sofortige Ergebnisse</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>98,3% Erfolgsrate</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Enhanced */}
      <footer className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-4">Rasenpilot</h2>
              <p className="text-gray-600 mb-4">
                Deutschlands intelligentester KI-Rasenberater für perfekte Rasenpflege.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold">50.000+ Nutzer</div>
                  <div className="text-xs text-gray-500">98,3% Erfolgsrate</div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Kostenlose Tools</h3>
              <ul className="space-y-2">
                <li><Button variant="link" onClick={() => navigate('/onboarding')} className="p-0 h-auto text-gray-600 hover:text-green-600">KI-Rasenanalyse</Button></li>
                <li><Button variant="link" onClick={() => navigate('/free-plan')} className="p-0 h-auto text-gray-600 hover:text-green-600">Kostenloser Pflegeplan</Button></li>
                <li><Button variant="link" onClick={() => navigate('/free-chat')} className="p-0 h-auto text-gray-600 hover:text-green-600">KI-Rasenberater Chat</Button></li>
                <li><Button variant="link" onClick={() => navigate('/blog-overview')} className="p-0 h-auto text-gray-600 hover:text-green-600">Expertentipps Blog</Button></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Unternehmen</h3>
              <ul className="space-y-2">
                <li><Button variant="link" onClick={() => navigate('/features')} className="p-0 h-auto text-gray-600 hover:text-green-600">Alle Funktionen</Button></li>
                <li><Button variant="link" onClick={() => navigate('/auth')} className="p-0 h-auto text-gray-600 hover:text-green-600">Kostenlos registrieren</Button></li>
                <li><a href="mailto:support@rasenpilot.de" className="text-gray-600 hover:text-green-600">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Rechtliches</h3>
              <ul className="space-y-2">
                <li><Button variant="link" onClick={() => navigate('/datenschutz')} className="p-0 h-auto text-gray-600 hover:text-green-600">Datenschutz</Button></li>
                <li><Button variant="link" onClick={() => navigate('/nutzungsbedingungen')} className="p-0 h-auto text-gray-600 hover:text-green-600">Nutzungsbedingungen</Button></li>
                <li><Button variant="link" onClick={() => navigate('/impressum')} className="p-0 h-auto text-gray-600 hover:text-green-600">Impressum</Button></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} Rasenpilot - Deutschlands intelligentester KI-Rasenberater. Alle Rechte vorbehalten.
              </p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>🇩🇪 Made in Germany</span>
                <span>•</span>
                <span>🏆 #1 Rasenpflege-App</span>
                <span>•</span>
                <span>⭐ 4.9/5 Bewertung</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
