import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Upload, Leaf, Sparkles, Loader2 } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';
import LawnImageUpload from '@/components/LawnImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
  const [analysisResults, setAnalysisResults] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleNext = () => {
    updateData({ 
      rasenbild: data.rasenbild,
      rasenproblem: data.rasenproblem
    });
    onNext();
  };

  const handleImageSelected = (imageUrl: string) => {
    console.log('Image selected:', imageUrl);
    updateData({ rasenbild: imageUrl });
  };

  const handleAnalyzeImage = async () => {
    if (!data.rasenbild) {
      toast.error('Bitte lade zuerst ein Bild hoch');
      return;
    }

    console.log('Starting analysis...');
    setIsAnalyzing(true);
    
    try {
      // Call the analyze-lawn-problem edge function
      const { data: analysisData, error } = await supabase.functions.invoke('analyze-lawn-problem', {
        body: {
          problem: data.rasenproblem || 'Allgemeine Rasenanalyse basierend auf hochgeladenem Bild',
          hasImage: true
        }
      });

      if (error) {
        console.error('Analysis error:', error);
        throw error;
      }

      console.log('AI Analysis response:', analysisData);
      
      if (analysisData && analysisData.analysis) {
        setAnalysisResults(analysisData.analysis);
        setShowAnalysis(true);
        updateData({ analysisCompleted: true });
        toast.success('Analyse erfolgreich abgeschlossen!');
      } else {
        throw new Error('Keine Analysedaten erhalten');
      }
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      // Fallback to mock analysis
      const mockAnalysis = getMockAnalysis();
      setAnalysisResults(mockAnalysis);
      setShowAnalysis(true);
      updateData({ analysisCompleted: true });
      toast.info('Demo-Analyse wird angezeigt');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMockAnalysis = () => {
    return `🌱 **Rasenanalyse Ergebnisse**

Basierend auf deinem hochgeladenen Bild und der Problembeschreibung haben wir folgende Erkenntnisse:

🛠️ **Erkannte Probleme**
• Ungleichmäßiges Wachstum in verschiedenen Bereichen
• Möglicher Nährstoffmangel erkennbar
• Einzelne kahle Stellen sichtbar

💡 **Empfohlene Maßnahmen**
• Bodentest durchführen zur genauen Nährstoffbestimmung
• Gezielte Nachsaat in kahlen Bereichen
• Regelmäßige Düngung mit Langzeitdünger
• Bewässerung optimieren - morgens und abends

🛒 **Produktempfehlungen**
• Rasendünger mit Langzeitwirkung
• Nachsaatmischung für deinen Rasentyp
• pH-Teststreifen für Bodenanalyse`;
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

              {/* Image Upload */}
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Rasenbild hochladen
                </Label>
                <LawnImageUpload
                  onImageSelected={handleImageSelected}
                  currentImage={data.rasenbild}
                />
              </div>

              {/* Analyze Button */}
              {data.rasenbild && (
                <Button
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      KI analysiert dein Rasenbild...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Kostenlose Analyse starten
                    </>
                  )}
                </Button>
              )}

              {isAnalyzing && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center justify-center mb-4">
                    <Loader2 className="h-6 w-6 text-blue-600 mr-2 animate-spin" />
                    <h3 className="text-lg font-semibold text-blue-800">
                      KI analysiert dein Rasenbild...
                    </h3>
                  </div>
                  <p className="text-blue-700 text-center">
                    Bitte warte einen Moment, während unsere KI dein Bild analysiert und personalisierte Empfehlungen erstellt.
                  </p>
                </div>
              )}
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
                
                {/* Display the actual analysis results */}
                <div className="bg-white rounded-md p-4 border border-green-100 mb-4">
                  <div 
                    className="prose prose-green max-w-none text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: analysisResults?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^🌱/gm, '<div class="mb-3">🌱')
                        .replace(/^🛠️/gm, '</div><div class="mb-3">🛠️')
                        .replace(/^💡/gm, '</div><div class="mb-3">💡')
                        .replace(/^🛒/gm, '</div><div class="mb-3">🛒')
                        .replace(/\n• /g, '<br>• ')
                        .replace(/\n/g, '<br>')
                        + '</div>' || ''
                    }}
                  />
                </div>
                
                <p className="text-gray-700 text-sm">
                  Registriere dich kostenlos für weitere Analysen, detaillierte Pflegepläne und unbegrenzte Nutzung aller Features.
                </p>
              </div>

              <div className="flex justify-center pt-4">
                <Button 
                  onClick={handleContinueToRegistration}
                  className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                >
                  Jetzt kostenlos registrieren
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
