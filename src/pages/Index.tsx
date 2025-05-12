
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Check, Leaf, Cloud, MessageSquare, Sprout, Calendar } from 'lucide-react';
import FeatureCallToAction from '@/components/FeatureCallToAction';

// Gallery of lawn images for the inspiration section
const lawnGallery = [
  {
    url: "https://images.unsplash.com/photo-1560179304-5a43b8a4ca10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlcmZlY3QlMjBsYXdufGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
    alt: "Perfekt gemähter Rasen mit geraden Linien"
  },
  {
    url: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGF3bnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=600&q=60",
    alt: "Saftig grüner Rasen im Sonnenuntergang"
  },
  {
    url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGxhd24lMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=600&q=60",
    alt: "Rasensprenger bei der Arbeit"
  },
  {
    url: "https://images.unsplash.com/photo-1556453825-eaa9c38b164f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8bGF3biUyMGNhcmV8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=600&q=60",
    alt: "Nahaufnahme gesundes Gras"
  }
];

const premiumFeatures = [
  {
    title: 'Persönliches Rasenprofil',
    description: 'Speichern und verwalten Sie Ihre Rasendaten und passen Sie diese jederzeit an.'
  },
  {
    title: 'Individueller Pflegeplan',
    description: 'Erhalten Sie einen detaillierten, dauerhaft gespeicherten Pflegeplan mit Fortschrittsverfolgung.'
  },
  {
    title: 'Unbegrenzter KI-Chat',
    description: 'Stellen Sie unbegrenzt viele Fragen und greifen Sie auf Ihren gespeicherten Chatverlauf zu.'
  },
  {
    title: 'Aufgabenmanagement',
    description: 'Verwalten Sie Ihre Rasenpflegeaufgaben und erhalten Sie Erinnerungen.'
  },
  {
    title: 'Foto-Upload & Analyse',
    description: 'Laden Sie Fotos Ihres Rasens hoch und verfolgen Sie den Fortschritt im Zeitverlauf.'
  }
];

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow">
        {/* Hero Section - Updated with new value proposition */}
        <section className="bg-gradient-to-br from-green-100 to-green-50 py-12 md:py-20 border-b border-green-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
                  Dein persönlicher Rasenpflege-Plan – in 30 Sekunden, kostenlos
                </h1>
                <p className="text-lg text-gray-700 mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                  Basierend auf deinem Standort, Rasentyp & Ziel. Sofort starten – ohne Anmeldung.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    className="px-8 py-6 text-lg rounded-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => navigate('/free-plan')}
                  >
                    Rasen-Check starten <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400/20 rounded-full z-0"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-400/20 rounded-full z-0"></div>
                  <img
                    src="https://images.unsplash.com/photo-1560179304-5a43b8a4ca10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHBlcmZlY3QlMjBsYXdufGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=70"
                    alt="Perfekter grüner Rasen"
                    className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-white relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works - Process Steps */}
        <section className="py-16 relative">
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold text-center mb-10 text-green-800">So einfach geht's</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Gib deine Rasendaten ein</h3>
                <p className="text-gray-600">Nur 3 kurze Fragen zu deinem Standort, Rasentyp und Ziel – ohne Anmeldung.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Erhalte deinen Plan sofort</h3>
                <p className="text-gray-600">Unser KI-System erstellt einen personalisierten 14-Tage-Pflegeplan für deinen Rasen.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Speichere deinen Fortschritt</h3>
                <p className="text-gray-600">Optional registrieren für erweiterte Funktionen wie Wetter-Updates und KI-Beratung.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Immediate Benefits Section */}
        <section className="py-12 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Sofortige Hilfe für deinen Rasen</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                Nutze diese kostenlosen Tools um sofort mit deiner Rasenpflege zu beginnen
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-green-100 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-green-50 p-4 rounded-full inline-block">
                    <Calendar className="h-12 w-12 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-800">14-Tage-Pflegeplan</h3>
                  <p className="text-gray-600 mb-4">
                    Erstelle einen grundlegenden Rasenpflegeplan ohne Registrierung – für einen schnellen Überblick.
                  </p>
                  <Button 
                    onClick={() => navigate('/free-plan')} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Pflegeplan erstellen <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-green-100 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-green-50 p-4 rounded-full inline-block">
                    <MessageSquare className="h-12 w-12 text-green-700" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-800">KI-Rasenberatung</h3>
                  <p className="text-gray-600 mb-4">
                    Stelle bis zu drei Fragen an unseren KI-Assistenten für sofortige Expertentipps zur Rasenpflege.
                  </p>
                  <Button 
                    onClick={() => navigate('/free-chat')} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Chat starten <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="border-green-100 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="mb-4 bg-green-50 p-4 rounded-full inline-block">
                    <Cloud className="h-12 w-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-green-800">Wetterbasierte Tipps</h3>
                  <p className="text-gray-600 mb-4">
                    Erhalte lokale Wettervorhersagen und darauf basierende Pflegetipps für optimale Rasenpflege.
                  </p>
                  <Button 
                    onClick={() => navigate('/free-weather')} 
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Wetter abrufen <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Gallery Section */}
        <section className="py-14">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-green-800 mb-4">Inspiration für deinen perfekten Rasen</h2>
              <p className="text-gray-600">
                So könnte dein Rasen mit der richtigen Pflege aussehen
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lawnGallery.map((image, index) => (
                <div 
                  key={index} 
                  className="overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 h-48 md:h-64"
                >
                  <img 
                    src={image.url} 
                    alt={image.alt} 
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Testimonial Section - Social Proof */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10 text-green-800">Was unsere Nutzer sagen</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border-green-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Nach nur 2 Wochen mit dem Pflegeplan sieht mein Rasen schon deutlich besser aus. Die einfachen Anweisungen waren genau das, was ich brauchte!"
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      M
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Michael R.</p>
                      <p className="text-xs text-gray-500">Hausbesitzer, Bayern</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-green-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "Endlich verstehe ich, wann ich meinen Rasen düngen soll! Die KI-Beratung war überraschend hilfreich und hat all meine Fragen beantwortet."
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      S
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Sarah T.</p>
                      <p className="text-xs text-gray-500">Hobby-Gärtnerin, NRW</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-green-100 shadow-md">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">
                    "In nur 30 Sekunden hatte ich einen kompletten Pflegeplan für meinen Rasen - ohne Registrierung. So einfach kann Rasenpflege sein!"
                  </p>
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                      D
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">David M.</p>
                      <p className="text-xs text-gray-500">Rasenliebhaber, Baden-Württemberg</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* Premium Features */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-green-800">Premium-Funktionen mit Registrierung</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Nach dem kostenlosen Rasen-Check kannst du dich registrieren, um Zugriff auf diese Funktionen zu erhalten
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-sm flex items-start gap-4">
                  <div className="mt-1">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800 mb-1">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 text-center">
              <FeatureCallToAction />
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Bereit für deinen perfekten Rasen?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              In nur 30 Sekunden erhältst du einen kostenlosen, personalisierten Pflegeplan – ohne Registrierung oder Verpflichtung.
            </p>
            <Button
              size="lg"
              className="px-8 py-6 text-lg rounded-full bg-white text-green-700 hover:bg-green-100"
              onClick={() => navigate('/free-plan')}
            >
              Rasen-Check starten <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 border-t border-green-700">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Leaf className="h-6 w-6 mr-2" />
            <span className="text-xl font-bold">Rasenpilot</span>
          </div>
          <p className="text-green-100 mb-4">Dein intelligenter Begleiter für die perfekte Rasenpflege</p>
          <div className="text-sm text-green-200">
            &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
