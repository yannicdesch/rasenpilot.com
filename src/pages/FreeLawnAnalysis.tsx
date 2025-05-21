
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
    <div className="min-h-screen flex flex-col bg-white">
      <MainNavigation />
      
      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-green-700 mb-4">
              KI-Rasenanalyse
            </h1>
            
            <p className="text-lg text-gray-700 mb-8">
              Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie sofortige KI-gestützte Analyse und Pflegeempfehlungen.
            </p>

            {!isAuthenticated && freeAnalysisUsed ? (
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-amber-600" />
                    <span>Kostenlose Analyse bereits genutzt</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <p className="text-gray-700">Du hast deine kostenlose Rasenanalyse bereits genutzt. Registriere dich für ein Konto, um unbegrenzte Analysen zu erhalten.</p>
                    <Button 
                      onClick={() => navigate('/auth')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserRound className="mr-2 h-4 w-4" />
                      Kostenlos registrieren
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="mb-8">
                <LawnAnalyzer />
              </div>
            )}

            <Card className="mb-8 border-green-200 shadow-md">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-xl text-green-800">So funktioniert die Rasenanalyse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col items-center text-center p-4 hover-grow">
                    <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4 shadow-sm">
                      <Camera className="h-7 w-7 text-green-600" />
                    </div>
                    <h3 className="font-medium mb-2 text-green-800">Foto hochladen</h3>
                    <p className="text-sm text-gray-600">
                      Machen Sie ein Foto Ihres Rasens und laden Sie es in unsere App hoch.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 hover-grow">
                    <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-sm">
                      <BrainCircuit className="h-7 w-7 text-blue-600" />
                    </div>
                    <h3 className="font-medium mb-2 text-green-800">KI analysiert</h3>
                    <p className="text-sm text-gray-600">
                      Unsere KI erkennt Probleme wie Krankheiten, Nährstoffmangel und Schädlingsbefall.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center p-4 hover-grow">
                    <div className="h-14 w-14 rounded-full bg-amber-100 flex items-center justify-center mb-4 shadow-sm">
                      <Sparkles className="h-7 w-7 text-amber-600" />
                    </div>
                    <h3 className="font-medium mb-2 text-green-800">Empfehlungen erhalten</h3>
                    <p className="text-sm text-gray-600">
                      Bekommen Sie personalisierte Pflegeempfehlungen für einen gesünderen Rasen.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8 bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-md">
              <CardHeader>
                <CardTitle className="text-xl text-green-800">Premium-Funktionen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-700 font-medium">
                    Mit einem kostenlosen Konto erhalten Sie Zugang zu erweiterten Analysefunktionen:
                  </p>
                  
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span className="text-gray-700">Detaillierte Bodenanalyse und pH-Wert-Empfehlungen</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span className="text-gray-700">Fortschrittsüberwachung mit Foto-Zeitverlauf</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span className="text-gray-700">Saisonale Pflegepläne basierend auf Ihren Fotos</span>
                    </li>
                    <li className="flex items-start bg-white p-3 rounded-lg shadow-sm border border-green-100">
                      <Check className="h-5 w-5 text-green-600 mr-2 shrink-0" />
                      <span className="text-gray-700">Unbegrenzte Bildanalysen und Empfehlungen</span>
                    </li>
                  </ul>

                  <div className="mt-4 flex justify-center">
                    <Button
                      className="bg-green-600 hover:bg-green-700 font-medium shadow-sm"
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
      
      <footer className="bg-white py-6 border-t border-gray-200 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Rasenpilot. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
};

export default FreeLawnAnalysis;
