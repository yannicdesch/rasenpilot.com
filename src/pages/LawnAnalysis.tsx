
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import MainNavigation from '@/components/MainNavigation';
import LawnAnalysisForm from '@/components/analysis/LawnAnalysisForm';
import AnalysisResults from '@/components/analysis/AnalysisResults';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, ArrowLeft, Sparkles } from 'lucide-react';

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLawn();
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/auth?redirectTo=/lawn-analysis');
    return null;
  }

  const handleAnalysisComplete = (results: string) => {
    setAnalysisResults(results);
    setShowResults(true);
  };

  const handleStartNewAnalysis = () => {
    setAnalysisResults(null);
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Dashboard
            </Button>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Camera className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                KI-Rasenanalyse
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Laden Sie ein aktuelles Foto Ihres Rasens hoch und erhalten Sie eine detaillierte 
                KI-Analyse mit personalisierten Lösungen und Pflegeempfehlungen.
              </p>
            </div>
          </div>

          {/* Feature Benefits */}
          {!showResults && (
            <Card className="mb-8 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                  <Sparkles className="h-6 w-6" />
                  Was unsere KI-Analyse bietet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-800">Problemerkennung</h4>
                      <p className="text-sm text-blue-700">
                        Automatische Erkennung von Krankheiten, Schädlingen und Nährstoffmängeln
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-800">Maßgeschneiderte Lösungen</h4>
                      <p className="text-sm text-blue-700">
                        Spezifische Empfehlungen basierend auf Ihrem Rasentyp und Problemen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-800">Zeitnahe Umsetzung</h4>
                      <p className="text-sm text-blue-700">
                        Priorisierte Aufgaben mit konkreten Zeitplänen
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium text-blue-800">Produktempfehlungen</h4>
                      <p className="text-sm text-blue-700">
                        Konkrete Produktvorschläge mit Preisen und Bezugsquellen
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {!showResults ? (
            <LawnAnalysisForm onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <div className="space-y-6">
              <AnalysisResults analysisResults={analysisResults} />
              
              <div className="text-center">
                <Button 
                  onClick={handleStartNewAnalysis}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Neue Analyse starten
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawnAnalysis;
