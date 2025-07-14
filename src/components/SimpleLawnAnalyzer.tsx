import React, { useState } from 'react';
import { useSimpleLawnAnalysis } from '@/hooks/useSimpleLawnAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, CheckCircle, AlertCircle, Trophy, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ScoreSubmissionForm from '@/components/ScoreSubmissionForm';
import CarePlanDownload from '@/components/CarePlanDownload';

interface AnalysisResult {
  overall_health: string;
  grass_condition: string;
  problems: string[];
  recommendations: string[];
  timeline: string;
  score: string;
  detailed_analysis?: string;
  next_steps?: string[];
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
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl">
            <Camera className="h-5 w-5 md:h-6 md:w-6" />
            Einfache Rasenanalyse mit KI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload - Centered and Mobile Friendly */}
          <div className="text-center">
            <Label htmlFor="image-upload" className="text-base md:text-lg font-medium">Rasenbild hochladen</Label>
            <div className="mt-4">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="max-w-sm mx-auto"
              />
            </div>
            {previewUrl && (
              <div className="mt-6 flex justify-center">
                <img 
                  src={previewUrl} 
                  alt="Vorschau" 
                  className="max-w-full max-h-64 md:max-h-80 rounded-lg border shadow-lg"
                />
              </div>
            )}
          </div>

          {/* Form Fields - Stack on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {/* Grass Type */}
            <div>
              <Label htmlFor="grass-type">Rasentyp (optional)</Label>
              <Select value={grassType} onValueChange={setGrassType}>
                <SelectTrigger className="mt-1">
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
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Analyze Button - Full width on mobile */}
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedFile || isLoading}
            className="w-full text-base md:text-lg py-3 md:py-4"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analysiere...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Rasen analysieren
              </>
            )}
          </Button>

          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm md:text-base">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
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

            {/* Detailed Analysis */}
            {analysisResult.detailed_analysis && (
              <div>
                <h4 className="font-semibold mb-2">Detaillierte Analyse:</h4>
                <p className="text-sm bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">{analysisResult.detailed_analysis}</p>
              </div>
            )}

            {/* Problems */}
            {analysisResult.problems.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Identifizierte Probleme:</h4>
                <div className="space-y-2">
                  {analysisResult.problems.map((problem, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm bg-red-50 p-2 rounded border-l-4 border-red-500">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>{problem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Empfehlungen:</h4>
                <div className="space-y-2">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm bg-green-50 p-2 rounded border-l-4 border-green-500">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysisResult.next_steps && analysisResult.next_steps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Nächste Schritte:</h4>
                <div className="space-y-2">
                  {analysisResult.next_steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-500">
                      <div className="flex-shrink-0 w-5 h-5 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Score Submission Form */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Score zur Bestenliste hinzufügen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreSubmissionForm 
              score={parseInt(analysisResult.score)} 
              onSubmitSuccess={() => {
                toast({
                  title: "Score eingereicht!",
                  description: "Ihr Score wurde erfolgreich zur Bestenliste hinzugefügt.",
                });
              }} 
            />
          </CardContent>
        </Card>
      )}

      {/* Care Plan Download */}
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              14-Tage Pflegeplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CarePlanDownload 
              analysisResult={analysisResult}
              grassType={grassType}
              lawnGoal={lawnGoal}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};