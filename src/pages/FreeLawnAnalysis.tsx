
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { SimpleLawnAnalyzer } from '@/components/SimpleLawnAnalyzer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Sparkles, BrainCircuit } from 'lucide-react';

const FreeLawnAnalysis = () => {
  const navigate = useNavigate();

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

            <div className="mb-8">
              <SimpleLawnAnalyzer />
            </div>

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
