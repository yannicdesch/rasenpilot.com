
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import LawnImageUpload from '@/components/LawnImageUpload';
import { useAnalysis } from '@/components/onboarding/hooks/useAnalysis';
import AnalysisLoading from '@/components/onboarding/AnalysisLoading';
import { toast } from 'sonner';

interface LawnAnalysisFormProps {
  onAnalysisComplete: (results: string) => void;
}

const LawnAnalysisForm: React.FC<LawnAnalysisFormProps> = ({ onAnalysisComplete }) => {
  const [imageSelected, setImageSelected] = useState(false);
  const [problemDescription, setProblemDescription] = useState('');
  const { isAnalyzing, handleAnalyzeImage } = useAnalysis();

  const handleImageSelected = (imageUrl: string) => {
    console.log('Image selected for analysis:', imageUrl);
    setImageSelected(true);
    // Store the image URL for analysis
    localStorage.setItem('currentImageUrl', imageUrl);
  };

  const handleStartAnalysis = async () => {
    if (!imageSelected) {
      toast.error('Bitte laden Sie zuerst ein Bild hoch');
      return;
    }

    try {
      await handleAnalyzeImage(
        problemDescription,
        (updates: any) => {
          if (updates.analysisCompleted) {
            // Get the analysis results from the hook's state
            setTimeout(() => {
              const analysisResults = localStorage.getItem('lastAnalysisResults');
              if (analysisResults) {
                onAnalysisComplete(analysisResults);
                localStorage.removeItem('lastAnalysisResults');
              }
            }, 100);
          }
        }
      );
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Fehler bei der Analyse');
    }
  };

  return (
    <Card className="border-green-100">
      <CardHeader>
        <CardTitle className="text-2xl text-green-800 flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Rasenanalyse starten
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Image Upload */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            📸 Aktuelles Rasenbild hochladen
          </Label>
          <LawnImageUpload onImageSelected={handleImageSelected} />
          <p className="text-xs text-gray-500 mt-2">
            Laden Sie ein aktuelles, gut beleuchtetes Foto Ihres Rasens hoch. 
            Beste Ergebnisse bei Tageslicht und direkter Draufsicht.
          </p>
        </div>

        {/* Problem Description */}
        <div>
          <Label htmlFor="problem" className="text-sm font-medium mb-2 block">
            🔍 Beschreibung des Problems (optional)
          </Label>
          <Textarea
            id="problem"
            placeholder="Beschreiben Sie spezifische Probleme, die Sie bemerkt haben. Z.B: Gelbe Flecken im hinteren Bereich, Moos zwischen den Gräsern, kahle Stellen nach dem Winter, ungleichmäßiges Wachstum..."
            value={problemDescription}
            onChange={(e) => setProblemDescription(e.target.value)}
            className="min-h-[120px]"
          />
          <p className="text-xs text-gray-500 mt-1">
            Je detaillierter Ihre Beschreibung, desto präziser werden die Empfehlungen.
          </p>
        </div>

        {/* Analysis Button */}
        <Button
          onClick={handleStartAnalysis}
          disabled={!imageSelected || isAnalyzing}
          className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              KI analysiert Ihren Rasen...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              KI-Analyse starten
            </>
          )}
        </Button>

        {isAnalyzing && <AnalysisLoading />}

        {/* Tips */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">💡 Tipps für beste Ergebnisse:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Fotografieren Sie bei Tageslicht für beste Farbwiedergabe</li>
            <li>• Halten Sie das Foto aus 1-2 Metern Entfernung</li>
            <li>• Zeigen Sie problematische Bereiche deutlich im Bild</li>
            <li>• Vermeiden Sie Schatten oder Überbelichtung</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default LawnAnalysisForm;
