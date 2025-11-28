import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, MessageSquare, Check, BookOpen, Trophy, Star, Medal, Award, Mail, Clock, Users, Target, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { SEOContentType } from '@/components/SEOContentEditor';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import PostAnalysisConversion from '@/components/conversion/PostAnalysisConversion';
import FreeVsPremiumSection from '@/components/landing/FreeVsPremiumSection';
import HeroSection from '@/components/landing/HeroSection';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const navigate = useNavigate();
  const [seoContent, setSeoContent] = useState<SEOContentType | null>(null);
  const [email, setEmail] = useState('');
  const [emailCaptured, setEmailCaptured] = useState(false);
  
  useEffect(() => {
    // Load SEO content
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      try {
        const parsedContent = JSON.parse(savedSeoContent);
        setSeoContent(parsedContent);
      } catch (e) {
        console.error("Error parsing saved SEO content:", e);
      }
    }
  }, []);
  
  const handleGetStarted = () => {
    navigate('/lawn-analysis');
  };

  const handleEmailCapture = (capturedEmail: string) => {
    setEmail(capturedEmail);
    setEmailCaptured(true);
    // Navigate to analysis after email capture
    setTimeout(() => {
      navigate('/lawn-analysis');
    }, 2000);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-white font-poppins">
      <SEO 
        title={seoContent?.title || "Rasenpilot - KI-Rasenberater | Kostenloser Pflegeplan in 30 Sekunden"}
        description={seoContent?.description || "✅ Kostenloser KI-Rasenpflegeplan in 30 Sek. ✅ 98,3% Genauigkeit ✅ Ohne Anmeldung ✅ Sofortige Ergebnisse → Jetzt starten!"}
        canonical="https://www.rasenpilot.com/"
        keywords={seoContent?.keywords || "Rasenpflege Deutschland,KI-Rasenberater,kostenloser Rasenpflegeplan,Rasen düngen,Rasen mähen,Rasenpilot,Rasenberatung,Rasen-Analyse kostenlos,Rasen-Probleme,intelligenter Rasen-Assistent"}
        type="website"
        structuredData={{
          type: 'WebSite',
          data: {
            name: 'Rasenpilot',
            description: 'Intelligenter KI-Rasenberater für personalisierten Rasenpflegeplan',
            url: 'https://rasenpilot.com',
            potentialAction: {
              "@type": "SearchAction",
              target: "https://rasenpilot.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            sameAs: [
              "https://rasenpilot.com/blog-overview",
              "https://rasenpilot.com/lawn-analysis"
            ]
          }
        }}
      />
      
      <StructuredData 
        type="Service"
        data={{
          name: "KI-Rasenpflegeplan von Rasenpilot",
          description: "Kostenloser personalisierter Rasenpflegeplan in 30 Sekunden. KI-gestützte Rasenanalyse mit professionellen Empfehlungen.",
          provider: "Rasenpilot",
          serviceType: "Rasenberatung"
        }}
      />
      
      <StructuredData 
        type="Organization"
        data={{
          name: "Rasenpilot",
          url: "https://rasenpilot.com",
          logo: "https://rasenpilot.com/logo.png",
          description: "Intelligenter KI-Rasenberater für Deutschland"
        }}
      />
      
      <MainNavigation />
      
      <HeroSection />
      
      {/* Value Proposition Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Warum 50.000+ Gartenbesitzer <br className="hidden md:block" />
              uns vertrauen
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Modernste KI-Technologie trifft auf jahrzehntelange Rasenexpertise
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="relative bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-3xl border border-green-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center transform rotate-12">
                <span className="text-2xl">🧠</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Deep Learning Analyse</h3>
              <p className="text-gray-700 leading-relaxed">
                Über <strong>200 Rasenparameter</strong> werden in Echtzeit analysiert. 
                Trainiert mit 1 Million+ Rasenbildern aus ganz Deutschland.
              </p>
              <div className="mt-6 pt-6 border-t border-green-200">
                <div className="text-3xl font-bold text-green-600">98,3%</div>
                <div className="text-sm text-gray-600">Genauigkeit</div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-3xl border border-blue-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center transform -rotate-12">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Wissenschaftlich validiert</h3>
              <p className="text-gray-700 leading-relaxed">
                Entwickelt mit Agrarwissenschaftlern. Basierend auf 
                <strong> DLG-Standards</strong> für professionelle Rasenpflege.
              </p>
              <div className="mt-6 pt-6 border-t border-blue-200">
                <div className="text-3xl font-bold text-blue-600">TÜV</div>
                <div className="text-sm text-gray-600">Geprüft</div>
              </div>
            </div>
            
            <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-3xl border border-amber-100 hover:shadow-xl transition-shadow duration-300">
              <div className="absolute top-6 right-6 w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center transform rotate-6">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Sofortige Ergebnisse</h3>
              <p className="text-gray-700 leading-relaxed">
                Kein Warten, keine Verzögerung. Dein personalisierter 
                <strong> Pflegeplan in 30 Sekunden</strong> – 24/7 verfügbar.
              </p>
              <div className="mt-6 pt-6 border-t border-amber-200">
                <div className="text-3xl font-bold text-amber-600">24/7</div>
                <div className="text-sm text-gray-600">Verfügbar</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              In 3 einfachen Schritten zum <br className="hidden md:block" />
              perfekten Rasen
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Keine Vorkenntnisse nötig • Keine Anmeldung erforderlich • Sofortige Ergebnisse
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Camera className="h-12 w-12 text-green-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Foto hochladen</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Mache ein Foto von deinem Rasen mit dem Smartphone. Achte auf gute Beleuchtung 
                  und einen Überblick über die Fläche.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Target className="h-12 w-12 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">KI-Analyse</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Unsere KI analysiert automatisch über 200 Parameter: Farbe, Dichte, 
                  Unkraut, Moos, Krankheiten und mehr.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <div className="bg-white p-8 pt-12 rounded-3xl shadow-lg border border-gray-100 h-full">
                <div className="mb-6">
                  <Check className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-center">Pflegeplan erhalten</h3>
                <p className="text-gray-600 text-center leading-relaxed">
                  Erhalte einen detaillierten, personalisierten Pflegeplan mit konkreten 
                  Schritten zur Verbesserung deines Rasens.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate('/lawn-analysis')} 
              size="lg"
              className="text-lg py-6 px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
              style={{ 
                background: 'linear-gradient(135deg, #00A651 0%, #00C853 100%)',
                color: 'white'
              }}
            >
              Jetzt kostenlos starten
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Premium Features Comparison */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 text-base">
              Beliebtes Upgrade
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-dm-serif text-primary">
              Hol dir noch mehr aus <br className="hidden md:block" />
              deinem Rasen
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Starte kostenlos und upgrade jederzeit für erweiterte Features
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-3xl border-2 border-gray-200">
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">Kostenlos</h3>
                <div className="text-4xl font-bold text-gray-900 mb-1">€0</div>
                <div className="text-gray-600">Für immer kostenlos</div>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">1 kostenlose Rasenanalyse</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Basis-Pflegeplan</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Allgemeine Empfehlungen</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/lawn-analysis')}
                variant="outline"
                className="w-full py-6 text-lg border-2"
              >
                Kostenlos starten
              </Button>
            </div>
            
            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 p-8 rounded-3xl border-2 border-green-500 shadow-2xl transform md:scale-105">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-2 text-base shadow-lg">
                  Beliebt
                </Badge>
              </div>
              
              <div className="mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-4xl font-bold">€9,99</span>
                  <span className="text-lg opacity-90">/Monat</span>
                </div>
                <div className="opacity-90">7 Tage kostenlos testen</div>
              </div>
              
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Unbegrenzte Analysen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Detaillierter Pflegekalender</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Wetter-basierte Empfehlungen</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">KI-Chat Assistent 24/7</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Fortschritts-Tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">Regionale Bestenliste</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => navigate('/subscription')}
                className="w-full py-6 text-lg bg-white text-green-700 hover:bg-gray-50 font-bold"
              >
                7 Tage kostenlos testen
              </Button>
              
              <p className="text-center text-white/80 text-sm mt-4">
                ✓ Jederzeit kündbar • ✓ 30 Tage Geld-zurück-Garantie
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Email Capture Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 via-green-700 to-green-800">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {!emailCaptured ? (
              <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full text-green-800 font-medium mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Limitiertes Angebot - Nur heute kostenlos!</span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                    Starten Sie jetzt Ihre <span className="text-green-600">kostenlose Rasenanalyse</span>
                  </h2>
                  
                  <p className="text-xl text-gray-600 mb-6">
                    Über 50.000 Gartenbesitzer vertrauen bereits unserem KI-Rasenexperten
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="flex items-center gap-2 justify-center md:justify-start">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">100% kostenlos</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Target className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Sofortige Ergebnisse</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center md:justify-end">
                      <Users className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">Wissenschaftlich validiert</span>
                    </div>
                  </div>
                </div>
                
                <PostAnalysisConversion 
                  score={75} // Demo score for homepage
                  onEmailCaptured={handleEmailCapture}
                  onRegistrationComplete={() => navigate('/lawn-analysis')}
                />
              </div>
            ) : (
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Perfekt! Sie werden in Kürze weitergeleitet...</h2>
                <p className="text-green-100">
                  Ihre kostenlose Rasenanalyse beginnt jetzt. Ihr personalisierter Plan wird an {email} gesendet.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">🏆 Rasen-Bestenliste</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Zeige deinen perfekten Rasen und kämpfe um den Spitzenplatz! Unsere KI bewertet jeden Rasen von 0-100 Punkten.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4 text-center">Top 3 Rasen-Champions</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">RasenProfi_München</p>
                      <p className="text-sm text-gray-600">München • Zierrasen • 250m²</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">97</div>
                    <div className="text-sm text-gray-500">Punkte</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-400 rounded-full">
                      <Medal className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">GrünDaumen_Berlin</p>
                      <p className="text-sm text-gray-600">Berlin • Spielrasen • 150m²</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">94</div>
                    <div className="text-sm text-gray-500">Punkte</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
                      <Award className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Rasenliebhaber_HH</p>
                      <p className="text-sm text-gray-600">Hamburg • Gebrauchsrasen • 300m²</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">91</div>
                    <div className="text-sm text-gray-500">Punkte</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
                <div className="text-gray-600">Rasen bewertet</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">87</div>
                <div className="text-gray-600">Durchschnittsscore</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
                <div className="text-gray-600">Neue Bewertungen</div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Möchtest du auch in die Bestenliste? Lade ein Foto deines Rasens hoch und erhalte eine professionelle KI-Bewertung!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/lawn-analysis')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Jetzt Rasen bewerten lassen
                </Button>
                <Button 
                  onClick={() => navigate('/highscore')}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Zur kompletten Bestenliste
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <Testimonials />
      
      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <FAQ />
        </div>
      </section>
      
      {/* Hidden SEO content for search engines */}
      {seoContent && (
        <div className="sr-only">
          <div dangerouslySetInnerHTML={{ __html: seoContent.content }} />
        </div>
      )}
      
      {/* Comprehensive Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-1 rounded-full">
                  <div className="h-5 w-5 bg-green-600 rounded-full"></div>
                </div>
                <span className="text-lg font-bold">Rasenpilot</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                Deutschlands intelligentester KI-Rasenberater. Kostenlose Pflegepläne für jeden Rasentyp mit professionellen Empfehlungen.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>⭐ 4.9/5 Sterne</span>
                <span>•</span>
                <span>1.000+ Nutzer</span>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/lawn-analysis" className="text-gray-300 hover:text-green-400 transition-colors">
                    Kostenlose Rasenanalyse
                  </Link>
                </li>
                <li>
                  <Link to="/care-plan" className="text-gray-300 hover:text-green-400 transition-colors">
                    Personalisierter Pflegeplan
                  </Link>
                </li>
                <li>
                  <Link to="/chat-assistant" className="text-gray-300 hover:text-green-400 transition-colors">
                    KI-Chat Assistent
                  </Link>
                </li>
                <li>
                  <Link to="/weather-advice" className="text-gray-300 hover:text-green-400 transition-colors">
                    Wetter-Ratgeber
                  </Link>
                </li>
                <li>
                  <Link to="/season-guide" className="text-gray-300 hover:text-green-400 transition-colors">
                    Saisonaler Leitfaden
                  </Link>
                </li>
                <li>
                  <Link to="/highscore" className="text-gray-300 hover:text-green-400 transition-colors">
                    Rasen-Bestenliste
                  </Link>
                </li>
              </ul>
            </div>

            {/* Content & Support */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Wissen & Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/blog-overview" className="text-gray-300 hover:text-green-400 transition-colors">
                    Rasenpflege Blog
                  </Link>
                </li>
                <li>
                  <Link to="/content-library" className="text-gray-300 hover:text-green-400 transition-colors">
                    Ratgeber & Tipps
                  </Link>
                </li>
                <li>
                  <Link to="/kontakt" className="text-gray-300 hover:text-green-400 transition-colors">
                    Kontakt & Support
                  </Link>
                </li>
                <li>
                  <a href="#faq" className="text-gray-300 hover:text-green-400 transition-colors">
                    Häufige Fragen (FAQ)
                  </a>
                </li>
                <li>
                  <Link to="/ueber-uns" className="text-gray-300 hover:text-green-400 transition-colors">
                    Über uns
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Local */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Rechtliches</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/impressum" className="text-gray-300 hover:text-green-400 transition-colors">
                    Impressum
                  </Link>
                </li>
                <li>
                  <Link to="/datenschutz" className="text-gray-300 hover:text-green-400 transition-colors">
                    Datenschutz
                  </Link>
                </li>
                <li>
                  <Link to="/agb" className="text-gray-300 hover:text-green-400 transition-colors">
                    AGB
                  </Link>
                </li>
              </ul>
              
              <div className="pt-4">
                <h4 className="text-sm font-semibold mb-2">Lokale Rasenpflege</h4>
                <ul className="space-y-1 text-xs">
                  <li>
                    <Link to="/local/berlin" className="text-gray-400 hover:text-green-400 transition-colors">
                      Rasenpflege Berlin
                    </Link>
                  </li>
                  <li>
                    <Link to="/local/munich" className="text-gray-400 hover:text-green-400 transition-colors">
                      Rasenpflege München
                    </Link>
                  </li>
                  <li>
                    <Link to="/local/hamburg" className="text-gray-400 hover:text-green-400 transition-colors">
                      Rasenpflege Hamburg
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-gray-700 mt-8 pt-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
              </div>
              
              <div className="flex items-center gap-6 text-sm">
                <span className="text-gray-400">Made with 💚 für deutsche Rasenliebhaber</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => navigate('/lawn-analysis')}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Kostenlos starten
                </Button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
