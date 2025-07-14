
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import LawnAnalyzer from '@/components/LawnAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Leaf, Camera, Sparkles, BrainCircuit, Check, UserRound, Lock } from 'lucide-react';
import FeatureCallToAction from '@/components/FeatureCallToAction';
import { useLawn } from '@/context/LawnContext';

const FreeLawnAnalysis = () => {
  const navigate = useNavigate();
  const [freeAnalysisUsed, setFreeAnalysisUsed] = useState(false);
  const { isAuthenticated } = useLawn();
  
  useEffect(() => {
    // Check if the user has already used their free analysis
    const hasUsedFreeAnalysis = localStorage.getItem('freeAnalysisUsed') === 'true';
    setFreeAnalysisUsed(hasUsedFreeAnalysis);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow py-4 sm:py-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-700 mb-2 sm:mb-4">
                KI-Rasenanalyse
              </h1>
              
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed px-2 sm:px-0">
                Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie sofortige KI-gestützte Analyse und Pflegeempfehlungen.
              </p>
            </div>

            {!isAuthenticated && freeAnalysisUsed ? (
              <Card className="mb-6 sm:mb-8 border-amber-200 bg-amber-50 mx-2 sm:mx-0">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Lock className="h-5 w-5 text-amber-600 flex-shrink-0" />
                    <span>Kostenlose Analyse bereits genutzt</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-700 text-sm sm:text-base">
                      Du hast deine kostenlose Rasenanalyse bereits genutzt. Registriere dich für ein Konto, um unbegrenzte Analysen zu erhalten.
                    </p>
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                      size="lg"
                    >
                      <UserRound className="mr-2 h-4 w-4" />
                      Kostenlos registrieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="mb-6 sm:mb-8 mx-2 sm:mx-0">
                <LawnAnalyzer />
              </div>
            )}

            <Card className="mb-6 sm:mb-8 border-green-200 shadow-md mx-2 sm:mx-0">
              <CardHeader className="bg-green-50 rounded-t-lg">
                <CardTitle className="text-lg sm:text-xl text-green-800 text-center sm:text-left">
                  So funktioniert die Rasenanalyse
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <Camera className="h-6 w-6 sm:h-7 sm:w-7 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-green-800 text-sm sm:text-base">Foto hochladen</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Machen Sie ein Foto Ihres Rasens und laden Sie es in unsere App hoch.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-blue-100 flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-green-800 text-sm sm:text-base">KI analysiert</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Unsere KI erkennt Probleme wie Krankheiten, Nährstoffmangel und Schädlingsbefall.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-3 sm:p-4 rounded-lg bg-white shadow-sm border border-green-100 hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
                    <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full bg-amber-100 flex items-center justify-center mb-3 sm:mb-4 shadow-sm">
                      <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600" />
                    </div>
                    <h3 className="font-semibold mb-2 text-green-800 text-sm sm:text-base">Empfehlungen erhalten</h3>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Bekommen Sie personalisierte Pflegeempfehlungen für einen gesünderen Rasen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 sm:mb-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md mx-2 sm:mx-0">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-lg sm:text-xl text-green-800 text-center sm:text-left">
                  Premium-Funktionen
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4 sm:space-y-6">
                  <p className="text-gray-700 font-medium text-sm sm:text-base text-center sm:text-left">
                    Mit einem kostenlosen Konto erhalten Sie Zugang zu erweiterten Analysefunktionen:
                  </p>
                  
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    <div className="flex items-start bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">Detaillierte Bodenanalyse und pH-Wert-Empfehlungen</span>
                    </div>
                    <div className="flex items-start bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">Fortschrittsüberwachung mit Foto-Zeitverlauf</span>
                    </div>
                    <div className="flex items-start bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">Saisonale Pflegepläne basierend auf Ihren Fotos</span>
                    </div>
                    <div className="flex items-start bg-white p-3 sm:p-4 rounded-lg shadow-sm border border-green-100 hover:shadow-md transition-shadow">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm sm:text-base">Unbegrenzte Bildanalysen und Empfehlungen</span>
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 flex justify-center">
                    <Button
                      className="bg-green-600 hover:bg-green-700 font-medium shadow-sm w-full sm:w-auto"
                      onClick={() => navigate('/auth')}
                      size="lg"
                    >
                      <UserRound className="mr-2 h-4 w-4" />
                      Kostenlos registrieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6 sm:mt-8 mx-2 sm:mx-0">
              <FeatureCallToAction />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-4 sm:py-6 border-t border-gray-200 mt-6 sm:mt-8">
        <div className="container mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreeLawnAnalysis;
