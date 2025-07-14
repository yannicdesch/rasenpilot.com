import React, { useState } from 'react';
import { useSimpleLawnAnalysis } from '@/hooks/useSimpleLawnAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  overall_health: string;
  grass_condition: string;
  problems: string[];
  recommendations: string[];
  timeline: string;
  score: string;
}

export const SimpleLawnAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [grassType, setGrassType] = useState<string>('');
  const [lawnGoal, setLawnGoal] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const { analyze, isLoading, error } = useSimpleLawnAnalysis();
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: "Fehler",
        description: "Bitte wählen Sie ein Bild aus",
        variant: "destructive"
      });
      return;
    }

    try {
      const result = await analyze(selectedFile, grassType, lawnGoal);
      setAnalysisResult(result);
      
      toast({
        title: "Analyse abgeschlossen!",
        description: "Ihre Rasenanalyse wurde erfolgreich durchgeführt.",
      });
    } catch (err) {
      toast({
        title: "Analyse fehlgeschlagen",
        description: error || "Ein unbekannter Fehler ist aufgetreten",
        variant: "destructive"
      });
    }
  };

  const getScoreColor = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return "bg-green-500";
    if (numScore >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Einfache Rasenanalyse mit KI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div>
            <Label htmlFor="image-upload">Rasenbild hochladen</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="mt-1"
            />
            {previewUrl && (
              <div className="mt-4">
                <img 
                  src={previewUrl} 
                  alt="Vorschau" 
                  className="max-w-xs rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Grass Type */}
          <div>
            <Label htmlFor="grass-type">Rasentyp (optional)</Label>
            <Select value={grassType} onValueChange={setGrassType}>
              <SelectTrigger>
                <SelectValue placeholder="Rasentyp auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unknown">Unbekannt</SelectItem>
                <SelectItem value="english-lawn">Englischer Rasen</SelectItem>
                <SelectItem value="sport-lawn">Sportrasen</SelectItem>
                <SelectItem value="shadow-lawn">Schattenrasen</SelectItem>
                <SelectItem value="utility-lawn">Gebrauchsrasen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lawn Goal */}
          <div>
            <Label htmlFor="lawn-goal">Rasenziel (optional)</Label>
            <Textarea
              id="lawn-goal"
              placeholder="z.B. Dichten Rasen für Kinder zum Spielen, Unkraut entfernen..."
              value={lawnGoal}
              onChange={(e) => setLawnGoal(e.target.value)}
            />
          </div>

          {/* Analyze Button */}
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedFile || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analysiere...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Rasen analysieren
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Analyseergebnisse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score and Health */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-xl ${getScoreColor(analysisResult.score)}`}>
                  {analysisResult.score}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Gesamtbewertung</p>
              </div>
              <div>
                <p className="font-semibold">Allgemeine Gesundheit: {analysisResult.overall_health}%</p>
                <p className="text-sm text-muted-foreground">Zeitrahmen: {analysisResult.timeline}</p>
              </div>
            </div>

            {/* Grass Condition */}
            <div>
              <h4 className="font-semibold mb-2">Rasenzustand:</h4>
              <p className="text-sm bg-muted p-3 rounded-lg">{analysisResult.grass_condition}</p>
            </div>

            {/* Problems */}
            {analysisResult.problems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Identifizierte Probleme:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.problems.map((problem, index) => (
                    <Badge key={index} variant="destructive">{problem}</Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Empfehlungen:</h4>
                <ul className="space-y-1">
                  {analysisResult.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};