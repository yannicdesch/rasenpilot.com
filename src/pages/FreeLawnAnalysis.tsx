
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import LawnAnalyzer from '@/components/LawnAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Sparkles, BrainCircuit, Check, UserRound } from 'lucide-react';
import FeatureCallToAction from '@/components/FeatureCallToAction';

const FreeLawnAnalysis = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white dark:from-gray-900 dark:to-gray-950">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-green-800 dark:text-green-400 mb-4">
              KI-Rasenanalyse
            </h1>
            
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie sofortige KI-gestützte Analyse und Pflegeempfehlungen.
            </p>

            <div className="mb-8">
              <LawnAnalyzer />
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">So funktioniert die Rasenanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                      <Camera className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="font-medium mb-2">Foto hochladen</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Machen Sie ein Foto Ihres Rasens und laden Sie es in unsere App hoch.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                      <BrainCircuit className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="font-medium mb-2">KI analysiert</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Unsere KI erkennt Probleme wie Krankheiten, Nährstoffmangel und Schädlingsbefall.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4">
                    <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
                      <Sparkles className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="font-medium mb-2">Empfehlungen erhalten</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bekommen Sie personalisierte Pflegeempfehlungen für einen gesünderen Rasen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-xl">Premium-Funktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-600 dark:text-gray-300">
                    Mit einem kostenlosen Konto erhalten Sie Zugang zu erweiterten Analysefunktionen:
                  </p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span>Detaillierte Bodenanalyse und pH-Wert-Empfehlungen</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span>Fortschrittsüberwachung mit Foto-Zeitverlauf</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span>Saisonale Pflegepläne basierend auf Ihren Fotos</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span>Unbegrenzte Bildanalysen und Empfehlungen</span>
                    </li>
                  </ul>

                  <div className="mt-4 flex justify-center">
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => navigate('/auth')}
                    >
                      <UserRound className="mr-2 h-4 w-4" />
                      Kostenlos registrieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-8">
              <FeatureCallToAction />
            </div>
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
