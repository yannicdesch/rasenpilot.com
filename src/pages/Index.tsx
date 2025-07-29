import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import MainNavigation from '@/components/MainNavigation';
import { useLawn } from '@/context/LawnContext';
import { useNavigate, Link } from 'react-router-dom';
import { Camera, Calendar, ArrowRight, MessageSquare, Check, BookOpen, Trophy, Star, Medal, Award } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import type { SEOContentType } from '@/components/SEOContentEditor';
import Logo from '@/components/Logo';

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
      <Helmet>
        <title>{seoContent?.title || "Rasenpilot - Ihr intelligenter Rasenberater"}</title>
        <meta name="description" content={seoContent?.description || "Erstellen Sie kostenlos Ihren 14-Tage-Rasenpflegeplan mit dem KI-gestützten Rasenberater."} />
        <meta name="keywords" content={seoContent?.keywords || "Rasenpflege, Rasenberatung, KI-Rasenberater, Rasenpflegeplan"} />
        <link rel="canonical" href="https://rasenpilot.com/" />
        <meta property="og:title" content={seoContent?.title || "Rasenpilot - Ihr intelligenter Rasenberater"} />
        <meta property="og:description" content={seoContent?.description || "Erstellen Sie kostenlos Ihren 14-Tage-Rasenpflegeplan mit dem KI-gestützten Rasenberater."} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.de/" />
      </Helmet>
      
      {/* Logo with tagline */}
      <div className="container mx-auto px-4 py-4">
        <Logo showTagline={true} />
      </div>
      
      <MainNavigation />
      
      <section className="bg-gradient-to-b from-green-50 to-white py-16 md:py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="lg:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-green-800 leading-tight">
                Dein persönlicher Rasenpflegeplan in 30 Sekunden
              </h1>
              <p className="text-xl text-gray-600">
                Erstelle kostenlos deinen Pflegeplan und erhalte tägliche Aufgaben für einen gesunden, schönen Rasen.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <Button 
                  onClick={handleGetStarted} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 py-6"
                >
                  Kostenlos starten <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 pt-2">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  <span>Kein Konto nötig</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  <span>Wetter-basierte Tipps</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  <span>KI-Empfehlungen</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-green-600 mr-1" />
                  <span>Für alle Rasentypen</span>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2">
              <img 
                src="/placeholder.svg" 
                alt="Rasenpilot App - Rasenpflegeplan erstellen" 
                className="rounded-lg shadow-xl w-full" 
                width={600}
                height={400}
              />
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
              Kostenlos testen <ArrowRight className="ml-2 h-4 w-4" />
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
      
      {/* Hidden SEO content for search engines */}
      {seoContent && (
        <div className="sr-only">
          <div dangerouslySetInnerHTML={{ __html: seoContent.content }} />
        </div>
      )}
      
      <footer className="bg-white py-6 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          <div className="mt-2 flex justify-center gap-4">
            <Link to="/blog-overview" className="text-gray-600 hover:text-green-600">Blog</Link>
            <span className="text-gray-400">|</span>
            <Link to="/free-plan" className="text-gray-600 hover:text-green-600">Kostenloser Plan</Link>
            <span className="text-gray-400">|</span>
            <Link to="/free-chat" className="text-gray-600 hover:text-green-600">KI-Chat</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
