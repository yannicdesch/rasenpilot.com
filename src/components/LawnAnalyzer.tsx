
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2, Sparkles, Camera, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLawn } from '@/context/LawnContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { analyzeImageWithAI, getMockAnalysis, AIAnalysisResult } from '@/services/aiAnalysisService';

interface LawnAnalyzerProps {
  onAnalysisComplete?: (results: any) => void;
  onImageSelected?: (imageUrl: string) => void;
  isOnboarding?: boolean;
}

const LawnAnalyzer: React.FC<LawnAnalyzerProps> = ({
  onAnalysisComplete,
  onImageSelected,
  isOnboarding = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AIAnalysisResult | null>(null);
  const { temporaryProfile, isAuthenticated, setTemporaryProfile, profile, syncProfileWithSupabase } = useLawn();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      
      if (onImageSelected) {
        onImageSelected(newPreviewUrl);
      }
      
      // Reset any previous analysis
      setAnalysisResults(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast("Bitte wähle zuerst ein Foto aus.");
      return;
    }

    // Check if free analyze is already used and not in onboarding mode
    const freeAnalysisUsed = localStorage.getItem('freeAnalysisUsed') === 'true';
    if (!isOnboarding && freeAnalysisUsed && !isAuthenticated) {
      toast("Du hast deine kostenlose Analyse bereits genutzt. Registriere dich für unbegrenzte Analysen.");
      return;
    }

    setIsAnalyzing(true);

    try {
      let analysisResult: AIAnalysisResult;

      if (isAuthenticated) {
        // Use real AI analysis for authenticated users
        console.log("Using AI analysis for authenticated user...");
        const result = await analyzeImageWithAI(
          selectedFile,
          temporaryProfile?.grassType || profile?.grassType,
          temporaryProfile?.lawnGoal || profile?.lawnGoal
        );

        if (result.success && result.analysis) {
          analysisResult = result.analysis;
          toast("KI-Analyse erfolgreich abgeschlossen!");
          console.log("AI analysis successful:", analysisResult);
        } else {
          console.warn("AI analysis failed, falling back to mock:", result.error);
          analysisResult = getMockAnalysis();
          toast("Analyse abgeschlossen (Fallback-Modus).");
        }
      } else {
        // Use mock analysis for free users
        console.log("Using mock analysis for free user...");
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time
        analysisResult = getMockAnalysis();
        toast("Kostenlose Demo-Analyse abgeschlossen!");
        
        // Mark free analysis as used for non-onboarding flows
        if (!isOnboarding) {
          localStorage.setItem('freeAnalysisUsed', 'true');
        }
      }

      setAnalysisResults(analysisResult);
      
      // Store the lawn picture in the profile or temporary profile
      if (previewUrl) {
        console.log("Saving lawn picture to profile from analyzer:", previewUrl);
        
        if (isAuthenticated && profile) {
          const updatedProfile = {
            ...profile,
            lawnPicture: previewUrl
          };
          
          setTemporaryProfile(updatedProfile);
          await syncProfileWithSupabase();
        } else {
          const newTempProfile = {
            ...(temporaryProfile || {}),
            lawnPicture: previewUrl,
            zipCode: temporaryProfile?.zipCode || "",
            grassType: temporaryProfile?.grassType || "",
            lawnSize: temporaryProfile?.lawnSize || "",
            lawnGoal: temporaryProfile?.lawnGoal || ""
          };
          
          setTemporaryProfile(newTempProfile);
        }
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast("Bei der Analyse ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (confidence > 0.6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  const freeAnalysisUsed = localStorage.getItem('freeAnalysisUsed') === 'true';

  return (
    <div className="space-y-6">
      <Card className={isOnboarding ? "border-green-100" : ""}>
        {!isOnboarding && (
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                <CardTitle>Rasen-Analyzer</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  {isAuthenticated ? 'KI-Analyse' : !freeAnalysisUsed ? '1 kostenlos' : 'Limit erreicht'}
                </Badge>
              </div>
            </div>
            <CardDescription>
              Lade ein Foto deines Rasens hoch und erhalte eine {isAuthenticated ? 'KI-basierte' : 'Demo'} Analyse und Pflegeempfehlungen
            </CardDescription>
          </CardHeader>
        )}
        <CardContent className={isOnboarding ? "" : "p-6"}>
          <div className="space-y-4">
            {!isOnboarding && (
              <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertTitle className="text-blue-800 dark:text-blue-400">
                  {isAuthenticated ? 'KI-Analyse verfügbar' : 'Demo-Analyse'}
                </AlertTitle>
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  {isAuthenticated 
                    ? 'Unsere KI erkennt Probleme wie Krankheiten, Nährstoffmangel und Schädlingsbefall mit fortschrittlicher Bildanalyse.'
                    : 'Diese Demo zeigt beispielhafte Analyseergebnisse. Registriere dich für echte KI-basierte Analysen.'
                  }
                </AlertDescription>
              </Alert>
            )}
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center relative">
              {!isOnboarding && freeAnalysisUsed && !isAuthenticated && (
                <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10 rounded-lg">
                  <Lock className="h-12 w-12 text-gray-500 mb-2" />
                  <h3 className="text-lg font-semibold mb-2">Analyse-Limit erreicht</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs text-center">
                    Du hast deine kostenlose Analyse bereits genutzt. Registriere dich für unbegrenzte Analysen.
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Kostenlos registrieren
                  </Button>
                </div>
              )}
              
              <label className="cursor-pointer block">
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {previewUrl ? (
                  <div className="relative">
                    <img 
                      src={previewUrl} 
                      alt="Vorschau" 
                      className="mx-auto max-h-64 rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                      <p className="text-white text-sm font-medium">Klicken zum Ändern</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">Klicke hier, um ein Foto deines Rasens hochzuladen</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG oder GIF, max. 10 MB</p>
                  </div>
                )}
              </label>
            </div>
            
            <Button
              onClick={analyzeImage}
              disabled={!selectedFile || isAnalyzing || (!isOnboarding && freeAnalysisUsed && !isAuthenticated)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isAuthenticated ? 'KI analysiert Rasen...' : 'Analysiere Rasen...'}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isAuthenticated ? 'KI-Analyse starten' : isOnboarding ? 'Kostenlose Analyse starten' : 'Demo-Analyse starten'}
                </>
              )}
            </Button>
            
            {!isOnboarding && !isAuthenticated && (
              <p className="text-xs text-gray-500 text-center">
                {!freeAnalysisUsed ? '1 kostenlose Demo-Analyse verfügbar' : 'Demo-Analyse bereits genutzt'} • 
                <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate('/auth')}>
                  Für echte KI-Analysen registrieren
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {analysisResults && !isOnboarding && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse-Ergebnisse</CardTitle>
            <CardDescription>
              {isAuthenticated 
                ? 'KI-basierte Analyse deines Rasens'
                : 'Demo-Analyseergebnisse (Registriere dich für echte KI-Analysen)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Overall Health Score */}
              {analysisResults.overallHealth && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Gesamtgesundheit</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-600 h-3 rounded-full" 
                        style={{ width: `${analysisResults.overallHealth * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{analysisResults.overallHealth}/10</span>
                  </div>
                </div>
              )}

              {/* Issues */}
              {analysisResults.issues?.map((result, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{result.issue}</h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadgeColor(result.confidence)}`}
                      >
                        {Math.round(result.confidence * 100)}% Sicherheit
                      </span>
                      <Badge variant={result.severity === 'high' ? 'destructive' : result.severity === 'medium' ? 'default' : 'secondary'}>
                        {result.severity === 'high' ? 'Hoch' : result.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                      </Badge>
                    </div>
                  </div>
                  <h4 className="text-sm font-medium mb-2">Empfehlungen:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.slice(0, isAuthenticated ? undefined : 2).map((rec, recIndex) => (
                      <li key={recIndex} className="flex items-start text-sm">
                        <Sparkles className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                    
                    {!isAuthenticated && result.recommendations.length > 2 && (
                      <li className="pt-1 pl-6">
                        <Button 
                          variant="link" 
                          className="text-green-700 p-0 h-auto text-sm"
                          onClick={() => navigate('/auth')}
                        >
                          + {result.recommendations.length - 2} weitere Empfehlungen mit Registrierung
                        </Button>
                      </li>
                    )}
                  </ul>
                </div>
              ))}

              {/* General Recommendations */}
              {analysisResults.generalRecommendations && analysisResults.generalRecommendations.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Allgemeine Empfehlungen</h3>
                  <ul className="space-y-1">
                    {analysisResults.generalRecommendations.map((rec, index) => (
                      <li key={index} className="flex items-start text-sm">
                        <Sparkles className="h-4 w-4 text-green-600 mr-2 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start border-t pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {isAuthenticated 
                ? 'Für kontinuierliche Überwachung empfehlen wir regelmäßige Analysen.'
                : 'Für echte KI-basierte Analysen und detailliertere Empfehlungen registriere dich jetzt.'
              }
            </p>
            {!isAuthenticated && (
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-green-600 hover:bg-green-700"
              >
                Kostenlos registrieren für KI-Analysen
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default LawnAnalyzer;
