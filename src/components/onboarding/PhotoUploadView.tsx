
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Upload, Sparkles, Loader2 } from 'lucide-react';
import { OnboardingData } from './OnboardingFlow';
import LawnImageUpload from '@/components/LawnImageUpload';
import AnalysisResults from './AnalysisResults';
import AnalysisLoading from './AnalysisLoading';

interface PhotoUploadViewProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  hasImage: boolean;
  isAnalyzing: boolean;
  showAnalysis: boolean;
  analysisResults: string | null;
  onImageSelected: (imageUrl: string) => void;
  onAnalyzeImage: () => void;
  onContinueToRegistration: () => void;
}

const PhotoUploadView: React.FC<PhotoUploadViewProps> = ({
  data,
  updateData,
  hasImage,
  isAnalyzing,
  showAnalysis,
  analysisResults,
  onImageSelected,
  onAnalyzeImage,
  onContinueToRegistration
}) => {
  const handleImageSelected = (imageUrl: string) => {
    console.log('Image selected in PhotoUploadView:', imageUrl);
    // Store the image URL for analysis
    localStorage.setItem('currentImageUrl', imageUrl);
    onImageSelected(imageUrl);
  };

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
            {(hasImage || data.rasenbild) && (
              <Button
                onClick={onAnalyzeImage}
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

            {isAnalyzing && <AnalysisLoading />}
          </>
        ) : (
          <>
            <AnalysisResults analysisResults={analysisResults} />
            <div className="flex justify-center pt-4">
              <Button 
                onClick={onContinueToRegistration}
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
};

export default PhotoUploadView;
