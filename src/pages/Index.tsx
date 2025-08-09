import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, MessageSquare, Check, BookOpen, Trophy, Star, Medal, Award } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { SEOContentType } from '@/components/SEOContentEditor';
import Logo from '@/components/Logo';
import SEO from '@/components/SEO';
import StructuredData from '@/components/StructuredData';
import FAQ from '@/components/FAQ';
import Testimonials from '@/components/Testimonials';
import lawnBefore from '@/assets/lawn-before.jpg';
import lawnAfter from '@/assets/lawn-after.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [seoContent, setSeoContent] = useState<SEOContentType | null>(null);
  
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
  
  return (
    <div className="min-h-screen flex flex-col">
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
      
      <section 
        className="py-10 md:py-16 lg:py-20 flex-grow"
        style={{
          background: 'linear-gradient(to bottom, #E6F5E6 0%, #ffffff 100%)'
        }}
      >
        <div className="container mx-auto px-8 sm:px-10 md:px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
            
            {/* Left Column */}
            <div className="flex-1 space-y-6 lg:space-y-8 text-center lg:text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center bg-green-100 px-4 py-2 rounded-full text-green-800 text-sm font-medium">
                🏆 Deutschlands #1 KI-Rasenexperte • 50.000+ zufriedene Nutzer
              </div>
              
              {/* Headline */}
              <h1 
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight"
                style={{ color: '#006400', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif' }}
              >
                Perfekter Rasen in 30 Sekunden – kostenlos & wissenschaftlich präzise
              </h1>
              
              {/* Internal domain link for SEO */}
              <div className="mb-6">
                <a 
                  href="https://www.rasenpilot.com/" 
                  className="inline-flex items-center text-sm text-green-600 hover:text-green-700 font-medium"
                  title="Rasenpilot - Deutschlands #1 KI-Rasenexperte"
                >
                  🏠 www.rasenpilot.com - Deutschlands führender KI-Rasenberater
                </a>
              </div>
              
              {/* Paragraph */}
              <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto lg:mx-0">
                Unsere KI analysiert über <strong>200 Rasenparameter</strong> und erstellt deinen persönlichen Pflegeplan – 
                mit <strong>98,3 % Genauigkeit</strong>.
              </p>
              
              {/* CTA Button */}
              <div className="pt-2">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg"
                  className="text-lg sm:text-xl py-4 sm:py-6 px-8 sm:px-12 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  style={{ 
                    backgroundColor: '#00A651',
                    color: 'white'
                  }}
                >
                  <div className="mr-3 h-5 w-5 sm:h-6 sm:w-6">🚀</div>
                  Jetzt kostenlose Rasenanalyse starten
                </Button>
              </div>
              
              {/* Trust Badges */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-4">
                {/* Stars and 50,000+ */}
                <div className="flex items-center gap-2">
                  <div className="flex text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <span className="text-xl font-bold text-gray-900">50.000+</span>
                </div>
                
                {/* Text */}
                <span className="text-gray-700 font-medium">Von Gartenexperten empfohlen</span>
                
                {/* Validation Badge */}
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                  <div className="h-4 w-4 text-blue-600">🛡️</div>
                  <span className="text-sm text-blue-700 font-medium">Wissenschaftlich validiert</span>
                </div>
              </div>
            </div>
            
            {/* Right Column */}
            <div className="flex-1 w-full max-w-lg lg:max-w-none">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                {/* Before/After Container */}
                <div className="flex h-64 sm:h-80 lg:h-96">
                  
                  {/* Vorher (Before) */}
                  <div className="flex-1 relative">
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                      Vorher
                    </div>
                    <img 
                      src={lawnBefore} 
                      alt="Rasen vorher - schlecht gepflegt mit Unkraut und kahlen Stellen" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Nachher (After) */}
                  <div className="flex-1 relative">
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                      Nachher
                    </div>
                    <img 
                      src={lawnAfter} 
                      alt="Rasen nachher - perfekt gepflegt, grün und gesund" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                
                {/* Yellow Floating Badge */}
                <div 
                  className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center shadow-lg text-black font-bold z-10"
                  style={{ backgroundColor: '#FFD700' }}
                >
                  <span className="text-lg sm:text-xl font-bold">30</span>
                  <span className="text-xs sm:text-sm leading-tight text-center">Sekunden<br/>später...</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
      
      {/* KI Technology Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Modernste <span className="text-green-600">KI-Technologie</span> für Ihren Rasen
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Unsere proprietäre KI wurde mit über 1 Million Rasenbildern trainiert und erkennt selbst kleinste Probleme
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-green-50 p-8 rounded-2xl border border-green-100">
              <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                🧠
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Deep Learning Analyse</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Unsere KI erkennt über <strong>200 verschiedene Rasenprobleme</strong> - von Pilzkrankheiten bis zu Nährstoffmängel. Trainiert mit Millionen von Bildern deutscher Rasenflächen.
              </p>
            </div>
            
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-6">
                🛡️
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Wissenschaftlich validiert</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Entwickelt in Zusammenarbeit mit Agrarwissenschaftlern und Rasenexperten <strong>98,3% Diagnosesicherheit</strong> in unabhängigen Tests bestätigt. 
                Basierend auf <a href="https://www.dlg.org/" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 underline font-medium">DLG-Standards</a> für Rasenpflege.
              </p>
            </div>
            
            <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100">
              <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                📊
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Präzise Bewertung</h3>
              <p className="text-gray-600 text-center leading-relaxed">
                Detaillierte Gesundheitsbewertung von 0-100 Punkten mit spezifischen Empfehlungen für <strong>optimale Rasenpflege</strong> in jedem Entwicklungsstadium.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">So funktioniert's</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              In nur drei einfachen Schritten zu deinem personalisierten Rasenpflegeplan
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Onboarding</h3>
              <p className="text-gray-600">
                Beantworte kurze Fragen zu deinem Rasen (PLZ, Größe, Ziele)
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pflegeplan</h3>
              <p className="text-gray-600">
                Erhalte tägliche Aufgaben mit wetterbasierter Anpassung
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-700">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Registrieren</h3>
              <p className="text-gray-600">
                Erstelle ein Konto für weitere Funktionen
              </p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-green-800 mb-4">Unsere Funktionen</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Alles was du für deinen perfekten Rasen brauchst
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Tägliche Aufgaben</h3>
              <p className="text-gray-600">
                Personalisierter Plan mit einfachen, täglichen Aufgaben für deinen Rasen
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Camera className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Rasen-Analyzer</h3>
              <p className="text-gray-600">
                Lade Fotos hoch und erhalte KI-Diagnosen zu Problemen wie Krankheiten und Nährstoffmangel
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">KI-Chatbot</h3>
              <p className="text-gray-600">
                Stelle deine Rasenfragen und erhalte sofort fachkundige Antworten
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-700" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Blog & Ratgeber</h3>
              <p className="text-gray-600">
                Entdecke unsere Expertentipps und Anleitungen für deinen perfekten Rasen
              </p>
              <Button 
                onClick={() => navigate('/blog-overview')} 
                variant="ghost" 
                className="mt-2 text-green-600 hover:text-green-700 p-0"
              >
                Zum Blog <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={handleGetStarted} 
              className="bg-green-600 hover:bg-green-700"
            >
              Jetzt kostenlose Rasenanalyse starten!
            </Button>
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
