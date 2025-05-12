
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Check, Leaf, Cloud, MessageSquare, Sprout, Calendar, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import FeatureCallToAction from '@/components/FeatureCallToAction';

const freeFunctions = [
  {
    title: 'Kostenloser 14-Tage-Pflegeplan',
    description: 'Erstellen Sie einen grundlegenden Rasenpflegeplan ohne Registrierung – für einen schnellen Überblick über anstehende Pflegemaßnahmen.',
    icon: <Calendar className="h-12 w-12 text-green-600"/>,
    link: '/free-plan',
    linkText: 'Pflegeplan erstellen'
  },
  {
    title: 'KI-Rasenberatung',
    description: 'Stellen Sie bis zu drei Fragen an unseren KI-Assistenten und erhalten Sie sofortige Expertentipps zur Rasenpflege.',
    icon: <MessageSquare className="h-12 w-12 text-green-700"/>,
    link: '/free-chat',
    linkText: 'Chat starten'
  },
  {
    title: 'Wetterbasierte Tipps',
    description: 'Sehen Sie lokale Wettervorhersagen und erhalten Sie darauf basierende Pflegetipps für optimale Rasenpflege.',
    icon: <Cloud className="h-12 w-12 text-blue-500"/>,
    link: '/free-weather',
    linkText: 'Wetter abrufen'
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
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-green-100 to-green-50 py-16 md:py-24 border-b border-green-200">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <div className="inline-block bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full text-green-800 font-medium text-sm mb-4 shadow-sm">
                  <Sprout className="inline-block mr-1 h-4 w-4" /> Ihr persönlicher Rasenberater
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-6">
                  Ihr KI-gestützter<br/> Rasenpflege-Assistent
                </h1>
                <p className="text-lg text-gray-700 mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-lg shadow-sm">
                  Erhalten Sie personalisierte Rasenpflegepläne, Expertenberatung und wetterkluge Empfehlungen für den perfekten Rasen mit minimalem Aufwand.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    className="px-8 py-6 text-lg rounded-full bg-green-600 hover:bg-green-700"
                    size="lg"
                    onClick={() => navigate('/free-plan')}
                  >
                    Kostenlos testen <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    className="px-8 py-6 text-lg rounded-full"
                    variant="outline"
                    size="lg"
                    onClick={() => navigate('/auth')}
                  >
                    <UserRound className="mr-2 h-5 w-5" /> Anmelden
                  </Button>
                </div>
              </div>
              <div className="md:w-1/2 mt-8 md:mt-0">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400/20 rounded-full z-0"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-green-400/20 rounded-full z-0"></div>
                  <img
                    src="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGxhd24lMjBjYXJlfGVufDB8fDB8fHww&auto=format&fit=crop&w=800&q=60"
                    alt="Perfekter grüner Rasen"
                    className="rounded-2xl shadow-xl w-full h-auto object-cover border-4 border-white relative z-10"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Kostenlose Funktionen */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-green-800">Testen Sie Rasenpilot kostenlos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Probieren Sie diese Funktionen ohne Registrierung aus und erleben Sie, was Rasenpilot für Ihren Rasen tun kann
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {freeFunctions.map((feature, index) => (
                <Card key={index} className="border-green-100 hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="mb-4 bg-green-50 p-4 rounded-full inline-block">{feature.icon}</div>
                    <CardTitle className="text-xl text-green-800">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-gray-600">{feature.description}</p>
                    <Button 
                      onClick={() => navigate(feature.link)} 
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {feature.linkText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Premium Features */}
        <section className="py-20 bg-green-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-green-800">Premium-Funktionen mit Registrierung</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Registrieren Sie sich kostenlos, um alle Funktionen zu nutzen und Ihre Daten dauerhaft zu speichern
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
        
        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-green-800">So funktioniert Rasenpilot</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Unser intelligenter Assistent hilft Ihnen bei jedem Schritt Ihrer Rasenpflege</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Profil erstellen</h3>
                <p className="text-gray-600">Geben Sie einige grundlegende Informationen über Ihren Rasen ein, wie Standort, Größe und Rasentyp.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Pflegeplan erhalten</h3>
                <p className="text-gray-600">Unsere KI generiert einen personalisierten Pflegeplan basierend auf Ihren individuellen Bedürfnissen.</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto bg-green-100 rounded-full h-20 w-20 flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-green-800">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-green-800">Rasen perfekt pflegen</h3>
                <p className="text-gray-600">Folgen Sie den Anweisungen, stellen Sie Fragen an den KI-Assistenten und genießen Sie Ihren perfekten Rasen.</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials */}
        <section className="py-16 bg-green-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4 text-green-800">Was unsere Benutzer sagen</h2>
            <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">Entdecken Sie, wie Rasenpilot anderen Gartenbesitzern geholfen hat</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-white border-green-100">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                        </svg>
                      ))}
                    </div>
                    <p className="text-gray-600 mb-4">
                      {i === 1 && "Rasenpilot hat die Art und Weise, wie ich mich um meinen Rasen kümmere, komplett verändert. Der personalisierte Plan ist so einfach zu befolgen, und mein Rasen sieht besser aus als je zuvor!"}
                      {i === 2 && "Die Möglichkeit, jederzeit mit dem KI-Assistenten zu chatten, wenn ich Fragen habe, war unglaublich hilfreich. Es ist, als hätte man rund um die Uhr einen Rasenexperten zur Hand."}
                      {i === 3 && "Die wetterbasierte Empfehlungen haben mir so viel Zeit und Wasser gespart. Ich mache mir keine Sorgen mehr, an Regentagen zu bewässern."}
                    </p>
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                        {i === 1 && "M"}
                        {i === 2 && "S"}
                        {i === 3 && "D"}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {i === 1 && "Michael R."}
                          {i === 2 && "Sarah T."}
                          {i === 3 && "David M."}
                        </p>
                        <p className="text-xs text-gray-500">
                          {i === 1 && "Hausbesitzer, Bayern"}
                          {i === 2 && "Hobby-Gärtnerin, NRW"}
                          {i === 3 && "Rasenliebhaber, Baden-Württemberg"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-green-600 to-green-700 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Bereit für einen perfekten Rasen?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Starten Sie noch heute – kostenlos und ohne Verpflichtung. Testen Sie unsere Funktionen und erleben Sie den Unterschied!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-green-700"
                onClick={() => navigate('/free-plan')}
              >
                Kostenlos testen
              </Button>
              <Button
                size="lg"
                className="bg-white text-green-700 hover:bg-green-100"
                onClick={() => navigate('/auth')}
              >
                <UserRound className="mr-2 h-5 w-5" />
                Konto erstellen
              </Button>
            </div>
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
          <p className="text-green-100 mb-4">Ihr intelligenter Begleiter für die perfekte Rasenpflege</p>
          <div className="text-sm text-green-200">
            &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
