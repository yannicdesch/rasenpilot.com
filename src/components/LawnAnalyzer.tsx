
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Image as ImageIcon, Loader2, Sparkles, Camera, Lock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useLawn } from '@/context/LawnContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

// Mock analysis results for the demo version
const mockAnalysisResults = [
  {
    issue: "Rasenkrankheit",
    confidence: 0.85,
    recommendations: [
      "Überprüfe deinen Rasen auf braune oder gelbe Flecken, die sich ausbreiten.",
      "Entferne infizierte Bereiche, um die Ausbreitung zu verhindern.",
      "Verwende ein Fungizid, das für Rasen geeignet ist.",
      "Vermeide übermäßiges Wässern, insbesondere am Abend."
    ]
  },
  {
    issue: "Nährstoffmangel",
    confidence: 0.72,
    recommendations: [
      "Führe einen Bodentest durch, um festzustellen, welche Nährstoffe fehlen.",
      "Verwende einen ausgewogenen Rasendünger mit NPK-Verhältnis 3-1-2.",
      "Dünge während der Hauptwachstumsperiode alle 6-8 Wochen.",
      "Bei Eisenmangel (gelbe Blätter) verwende einen eisenhaltigen Dünger."
    ]
  },
  {
    issue: "Unkrautbefall",
    confidence: 0.68,
    recommendations: [
      "Identifiziere die Unkrautart, um die geeignete Bekämpfungsmethode zu wählen.",
      "Verwende selektive Herbizide für Gräser-Unkraut oder händisches Entfernen.",
      "Mähe regelmäßig, um die Samenbildung zu verhindern.",
      "Stärke deinen Rasen durch richtige Pflege, um Unkraut natürlich zu unterdrücken."
    ]
  }
];

const LawnAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<typeof mockAnalysisResults | null>(null);
  const [analyzesUsed, setAnalyzesUsed] = useState(0);
  const { temporaryProfile, isAuthenticated } = useLawn();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Reset any previous analysis
      setAnalysisResults(null);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) {
      toast({
        title: "Fehler",
        description: "Bitte wähle zuerst ein Foto aus.",
        variant: "destructive",
      });
      return;
    }

    // Check if free analyze is already used
    if (analyzesUsed >= 1 && !isAuthenticated) {
      toast({
        title: "Analyse-Limit erreicht",
        description: "Du hast deine kostenlose Analyse bereits genutzt. Registriere dich für unbegrenzte Analysen.",
      });
      
      return;
    }

    setIsAnalyzing(true);

    try {
      // In a real implementation, this would be an API call to an image analysis service
      // For this demo, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll return mock results
      setAnalysisResults(mockAnalysisResults);
      setAnalyzesUsed(prevCount => prevCount + 1);
      
      toast({
        title: "Analyse abgeschlossen",
        description: "Die KI hat deinen Rasen analysiert und Empfehlungen erstellt.",
      });
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Fehler",
        description: "Bei der Analyse ist ein Fehler aufgetreten.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence > 0.8) return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    if (confidence > 0.6) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              <CardTitle>Rasen-Analyzer</CardTitle>
            </div>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
              {isAuthenticated ? 'Unbegrenzt' : analyzesUsed === 0 ? '1 kostenlos' : 'Limit erreicht'}
            </Badge>
          </div>
          <CardDescription>
            Lade ein Foto deines Rasens hoch und erhalte eine KI-basierte Analyse und Pflegeempfehlungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-800 dark:text-blue-400">KI-Analyse</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Unsere KI erkennt Probleme wie Krankheiten, Nährstoffmangel und Schädlingsbefall und gibt dir personalisierte Empfehlungen.
              </AlertDescription>
            </Alert>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center relative">
              {analyzesUsed >= 1 && !isAuthenticated && (
                <div className="absolute inset-0 bg-gray-100/80 dark:bg-gray-900/80 flex flex-col items-center justify-center z-10 rounded-lg">
                  <Lock className="h-12 w-12 text-gray-500 mb-2" />
                  <h3 className="text-lg font-semibold mb-2">Analyse-Limit erreicht</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs text-center">
                    Du hast deine kostenlose Analyse bereits genutzt. Upgrade auf Pro für unbegrenzte Analysen.
                  </p>
                  <Button
                    onClick={() => navigate('/auth')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Pro-Plan für €4.99/Monat
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
              disabled={!selectedFile || isAnalyzing || (analyzesUsed >= 1 && !isAuthenticated)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analysiere Rasen...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Rasen analysieren
                </>
              )}
            </Button>
            
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 text-center">
                {analyzesUsed === 0 ? '1 kostenlose Analyse verfügbar' : 'Kostenlose Analyse bereits genutzt'} • 
                <Button variant="link" className="text-xs p-0 h-auto" onClick={() => navigate('/auth')}>
                  Pro-Plan für unbegrenzte Analysen
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {analysisResults && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse-Ergebnisse</CardTitle>
            <CardDescription>
              Basierend auf deinem Foto wurden folgende Probleme erkannt
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {analysisResults.map((result, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">{result.issue}</h3>
                    <span 
                      className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceBadgeColor(result.confidence)}`}
                    >
                      {Math.round(result.confidence * 100)}% Wahrscheinlichkeit
                    </span>
                  </div>
                  <h4 className="text-sm font-medium mb-2">Empfehlungen:</h4>
                  <ul className="space-y-1">
                    {result.recommendations.slice(0, isAuthenticated ? 4 : 2).map((rec, recIndex) => (
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
                          + {result.recommendations.length - 2} weitere Empfehlungen mit Pro-Plan
                        </Button>
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start border-t pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Für detailliertere Analysen und fortlaufende Überwachung registriere dich für den Pro-Plan.
            </p>
            <Button 
              onClick={() => navigate('/auth')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Pro-Plan für nur €4.99/Monat
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default LawnAnalyzer;
