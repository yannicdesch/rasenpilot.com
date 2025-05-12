
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Lock, Leaf, Calendar, MessageSquare, CheckSquare, Image, CloudSun, User } from 'lucide-react';

const FeaturesBehindRegistration = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-green-800 dark:text-green-400 mb-4">
              Premium-Funktionen mit Registrierung
            </h1>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Für das beste Rasenpflege-Erlebnis empfehlen wir die kostenlose Registrierung, 
              um Zugang zu diesen personalisierten Funktionen zu erhalten:
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Persönliches Rasenprofil */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <User className="text-green-600 dark:text-green-500" size={22} />
                    Persönliches Rasenprofil
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Speichern und verwalten Sie Ihre Rasendaten</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Verwaltung und Speicherung von Nutzerdaten wie Postleitzahl, Rasentyp, Rasenfläche und Pflegezielen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Möglichkeit, das Profil später anzupassen oder zu erweitern</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Individueller Pflegeplan */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar className="text-green-600 dark:text-green-500" size={22} />
                    Individueller Pflegeplan
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Personalisierte und dauerhafte Pflegeanleitungen</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Generierung eines personalisierten 14-Tage- oder Monatsplans, der im Nutzerprofil gespeichert wird</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Fortschrittsverfolgung und Historie vergangener Pflegepläne</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* KI-Chatverlauf */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MessageSquare className="text-green-600 dark:text-green-500" size={22} />
                    KI-Chatverlauf
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Speicherung Ihrer Beratungsgespräche</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Speicherung des Chatverlaufs für spätere Referenz</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Personalisierte Beratungen basierend auf Ihrem individuellen Kontext</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Aufgaben- und Erinnerungsmanagement */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CheckSquare className="text-green-600 dark:text-green-500" size={22} />
                    Aufgaben & Erinnerungen
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Interaktive Pflege-Checklisten und Benachrichtigungen</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Interaktives Checklisten-System zum Markieren erledigter Aufgaben</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Personalisierte Erinnerungen per E-Mail oder SMS</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Fotoverwaltung */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Image className="text-green-600 dark:text-green-500" size={22} />
                    Rasenfotos verwalten
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Dokumentieren Sie Ihren Rasenfortschritt visuell</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Fortschrittsfotos hochladen und in einer chronologischen Galerie darstellen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Speicherung der Bilder mit Kommentaren in Ihrem persönlichen Konto</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
            
            {/* Wetteranpassungen */}
            <Card className="border-green-100 dark:border-green-800 hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <CloudSun className="text-green-600 dark:text-green-500" size={22} />
                    Wetterbezogene Anpassungen
                  </CardTitle>
                  <Lock className="text-amber-500 h-5 w-5" />
                </div>
                <CardDescription>Pflegeplan basierend auf lokalem Wetter</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Personalisierte Anpassung des Pflegeplans basierend auf aktuellen Wetterdaten</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Spezielle wetterbezogene Tipps in Ihrer Historie</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          
          <Separator className="my-12" />
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-800 dark:text-green-400 mb-6">
              Kostenlos registrieren und alle Premium-Funktionen nutzen
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
                onClick={() => navigate('/auth')}
              >
                Jetzt registrieren
              </Button>
              
              <Button 
                variant="outline" 
                className="border-green-600 text-green-700 hover:bg-green-50 px-8 py-6 text-lg"
                onClick={() => navigate('/auth')}
              >
                Anmelden
              </Button>
            </div>
            
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Die Registrierung ist kostenlos und dauert nur wenige Minuten.
            </p>
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
