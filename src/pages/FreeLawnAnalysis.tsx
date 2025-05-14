
import React, { useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Image, UserRound } from 'lucide-react';
import FeatureCallToAction from '@/components/FeatureCallToAction';

const FreeLawnAnalysis = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLawn();
  
  useEffect(() => {
    // If user is already authenticated, redirect them to the full analysis page
    if (isAuthenticated) {
      navigate('/analysis');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">KI-Rasenanalyse</h1>
          
          <Card className="mb-8">
            <CardHeader className="text-center bg-green-50 dark:bg-green-900/30">
              <div className="mx-auto bg-white dark:bg-gray-800 rounded-full p-4 shadow-sm mb-4 w-16 h-16 flex items-center justify-center">
                <Lock className="h-8 w-8 text-green-600 dark:text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-800 dark:text-green-400">
                Premium-Funktion
              </CardTitle>
              <CardDescription className="text-lg">
                Die KI-Rasenanalyse ist nur für registrierte Nutzer verfügbar
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <Image className="h-5 w-5 text-green-600" />
                    KI-basierte Foto-Analyse
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Laden Sie ein Foto Ihres Rasens hoch und lassen Sie unsere KI Probleme wie Krankheiten, 
                    Nährstoffmangel oder Schädlingsbefall erkennen. Die KI wurde mit mehr als 10.000 
                    Rasenbildern trainiert, um präzise Diagnosen zu stellen.
                  </p>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium flex items-center gap-2 mb-2">
                    <Image className="h-5 w-5 text-green-600" />
                    Personalisierte Empfehlungen
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Erhalten Sie maßgeschneiderte Pflegeempfehlungen basierend auf der KI-Analyse 
                    und verfolgen Sie den Fortschritt Ihres Rasens im Zeitverlauf.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <p className="text-center text-gray-600 dark:text-gray-300">
                Registrieren Sie sich kostenlos, um Zugang zu unserer KI-Rasenanalyse zu erhalten.
              </p>
              <Button 
                className="w-full md:w-auto md:px-8 bg-green-600 hover:bg-green-700"
                onClick={() => navigate('/auth')}
              >
                <UserRound className="mr-2 h-4 w-4" />
                Kostenlos registrieren
              </Button>
            </CardFooter>
          </Card>
          
          <div className="mt-8">
            <FeatureCallToAction variant="minimal" />
          </div>
        </div>
      </main>
      
      <footer className="bg-white dark:bg-gray-800 py-6 border-t border-gray-200 dark:border-gray-700 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreeLawnAnalysis;
