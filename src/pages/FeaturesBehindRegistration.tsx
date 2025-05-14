
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Calendar, CloudSun, UserRound, Image, ArrowRight } from 'lucide-react';

const FeaturesBehindRegistration = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: "Personalisierter Rasenpflegeplan",
      description: "Erhalten Sie einen maßgeschneiderten 14-Tage-Pflegeplan für Ihren Rasen, basierend auf Ihren spezifischen Angaben.",
      icon: <Calendar className="h-12 w-12 text-green-600" />,
      route: "/free-care-plan",
      badge: "Kostenloser Test"
    },
    {
      title: "KI-Rasenberatung",
      description: "Stellen Sie Fragen an unseren KI-Assistenten und erhalten Sie sofortige Beratung zu allen Themen rund um Rasenpflege.",
      icon: <MessageSquare className="h-12 w-12 text-blue-600" />,
      route: "/free-chat",
      badge: "Begrenzte Fragen"
    },
    {
      title: "Wetterbasierte Tipps",
      description: "Erhalten Sie Rasenempfehlungen basierend auf dem aktuellen Wetter und der Wettervorhersage für Ihre Region.",
      icon: <CloudSun className="h-12 w-12 text-amber-600" />,
      route: "/free-weather",
      badge: "PLZ-basiert"
    },
    {
      title: "KI-Rasenanalyse mit Foto",
      description: "Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie eine KI-basierte Analyse mit personalisierten Pflegeempfehlungen.",
      icon: <Image className="h-12 w-12 text-violet-600" />,
      route: "/free-analysis",
      badge: "NEU"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <MainNavigation />
      
      <main className="flex-grow py-12">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-500 mb-4">
              Testen Sie Rasenpilot kostenlos
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Entdecken Sie einige unserer besten Funktionen, ohne sich registrieren zu müssen.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                      {feature.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-between"
                    onClick={() => navigate(feature.route)}
                  >
                    <span>Ausprobieren</span>
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto">
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/20">
                <CardTitle className="text-center text-green-800 dark:text-green-400">
                  Möchten Sie alle Funktionen nutzen?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Erstellen Sie ein kostenloses Konto, um Zugriff auf alle Premium-Funktionen zu erhalten:
                  </p>
                  <ul className="text-left space-y-2 max-w-md mx-auto">
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Personalisierter, jahreszeitlicher Pflegeplan</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Unbegrenzte KI-Beratung mit Chat-Verlauf</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Automatisch aktualisierte Wetterprognosen</span>
                    </li>
                    <li className="flex items-start">
                      <div className="mr-2 mt-1 h-5 w-5 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center">
                        <svg className="h-3.5 w-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Fortgeschrittene KI-Rasenanalyse mit Fortschrittsverfolgung</span>
                    </li>
                  </ul>
                  
                  <div className="pt-4">
                    <Button 
                      className="bg-green-600 hover:bg-green-700 py-6 px-8 text-lg"
                      onClick={() => navigate('/auth')}
                    >
                      <UserRound className="mr-2 h-5 w-5" />
                      Kostenlos registrieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FeaturesBehindRegistration;
