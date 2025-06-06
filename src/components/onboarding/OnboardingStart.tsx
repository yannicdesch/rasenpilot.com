import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Upload, Leaf, Sparkles } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';
import LawnAnalyzer from '@/components/LawnAnalyzer';

interface OnboardingStartProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onNext: () => void;
  onAnalysisComplete?: () => void;
  isPhotoUpload?: boolean;
}

const OnboardingStart: React.FC<OnboardingStartProps> = ({ 
  data, 
  updateData, 
  onNext,
  onAnalysisComplete,
  isPhotoUpload = false
}) => {
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleNext = () => {
    updateData({ 
      rasenbild: data.rasenbild,
      rasenproblem: data.rasenproblem
    });
    onNext();
  };

  const handleAnalysisComplete = (results: any) => {
    console.log('Analysis completed with results:', results);
    setAnalysisResults(results);
    setShowAnalysis(true);
    updateData({ analysisCompleted: true });
  };

  const handleContinueToRegistration = () => {
    if (onAnalysisComplete) {
      onAnalysisComplete();
    }
  };

  if (isPhotoUpload) {
    return (
      <Card className="border-green-100">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Upload className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">
            Lade ein Foto deines Rasens hoch
          </CardTitle>
          <p className="text-gray-600">
            Erhalte eine kostenlose KI-Analyse deines Rasens
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showAnalysis ? (
            <>
              {/* Problem Description */}
              <div>
                <Label htmlFor="problem" className="text-sm font-medium mb-2 block">
                  Beschreibe dein Rasenproblem (optional)
                </Label>
                <Textarea
                  id="problem"
                  placeholder="z.B. Gelbe Stellen trotz regelmäßigem Gießen, Moos breitet sich aus, kahle Stellen im Schatten..."
                  value={data.rasenproblem}
                  onChange={(e) => updateData({ rasenproblem: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>

              {/* Lawn Analyzer */}
              <div>
                <LawnAnalyzer 
                  onAnalysisComplete={handleAnalysisComplete}
                  onImageSelected={(imageUrl) => updateData({ rasenbild: imageUrl })}
                  isOnboarding={true}
                />
              </div>
            </>
          ) : (
            <>
              {/* Analysis Results Display */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <Sparkles className="h-6 w-6 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-green-800">
                    Deine kostenlose Rasenanalyse ist fertig!
                  </h3>
                </div>
                <p className="text-gray-700 mb-4">
                  Wir haben dein Rasenbild analysiert und personalisierte Empfehlungen erstellt. 
                  Um die vollständigen Ergebnisse zu sehen und weitere Analysen zu nutzen, registriere dich kostenlos.
                </p>
                <div className="bg-white rounded-md p-4 border border-green-100">
                  <h4 className="font-medium text-green-800 mb-2">Vorschau deiner Analyse:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Erkannte Problembereiche identifiziert</li>
                    <li>• Spezifische Behandlungsempfehlungen</li>
                    <li>• Personalisierte Pflegetipps</li>
                    <li>• Produktempfehlungen für deinen Rasen</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleContinueToRegistration}
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                >
                  Vollständige Analyse anzeigen
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  // Original goal selection for when not used as photo upload
  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Leaf className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">
          Willkommen bei Rasenpilot
        </CardTitle>
        <p className="text-gray-600">
          Lass uns deinen perfekten Rasen gemeinsam planen
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-4 block">
            Was ist dein Hauptziel für deinen Rasen?
          </Label>
          <div className="grid grid-cols-1 gap-3">
            {[
              { id: 'gesund', title: 'Gesunder grüner Rasen', description: 'Allgemeine Rasengesundheit verbessern' },
              { id: 'dicht', title: 'Dichter Rasen', description: 'Kahle Stellen schließen und Dichte erhöhen' },
              { id: 'unkraut', title: 'Unkraut bekämpfen', description: 'Moos und Unkraut dauerhaft entfernen' },
              { id: 'pflegeleicht', title: 'Pflegeleichter Rasen', description: 'Weniger Aufwand bei der Rasenpflege' },
            ].map((goal) => (
              <Button
                key={goal.id}
                variant="outline"
                onClick={() => updateData({ rasenziel: goal.id })}
                className={`h-auto p-4 border-2 transition-all hover:border-green-500 hover:bg-green-50 ${
                  data.rasenziel === goal.id ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="text-left w-full">
                  <div className="font-medium text-sm">{goal.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{goal.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            onClick={handleNext}
            disabled={!data.rasenziel}
            className="bg-green-600 hover:bg-green-700"
          >
            Weiter
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingStart;
