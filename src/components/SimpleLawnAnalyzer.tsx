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
    <div className="max-w-4xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Mobile-Optimized Upload Section - Priority positioning */}
      <Card className="border-2 border-green-100 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader className="text-center pb-3 md:pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-xl md:text-2xl font-bold text-green-800">
            <Camera className="h-6 w-6 md:h-7 md:w-7" />
            Einfache Rasenanalyse mit KI
          </CardTitle>
          <p className="text-green-700 font-medium">Rasenbild hochladen</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Input with better mobile styling */}
          <div className="text-center">
            <div className="relative">
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full max-w-sm mx-auto file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
              />
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <img 
                src={previewUrl} 
                alt="Rasen Vorschau" 
                className="max-w-full max-h-48 md:max-h-64 rounded-lg border-2 border-green-200 shadow-lg"
              />
            </div>
          )}

          {/* Mobile-First Quick Analyze Button */}
          <div className="block md:hidden">
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedFile || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 text-lg rounded-xl shadow-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analysiere Rasen...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Rasen analysieren
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Short Multi-LLM Technology Section */}
      <div className="text-center">
        <p className="text-sm text-gray-600 bg-blue-50 rounded-full px-4 py-2 inline-block">
          🚀 Revolutionäre Rasenanalyse mit Multi-LLM Technologie für präzise Diagnosen
        </p>
      </div>

      {/* Optional Settings - Compact on mobile */}
      <Card className="border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg text-gray-700">
            Zusätzliche Einstellungen (optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mobile-optimized form fields */}
          <div className="space-y-4">
            {/* Grass Type */}
            <div>
              <Label htmlFor="grass-type" className="text-sm font-medium">Rasentyp (optional)</Label>
              <Select value={grassType} onValueChange={setGrassType}>
                <SelectTrigger className="mt-1 h-11">
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
              <Label htmlFor="lawn-goal" className="text-sm font-medium">Rasenziel (optional)</Label>
              <Textarea
                id="lawn-goal"
                placeholder="z.B. Dichten Rasen für Kinder zum Spielen, Unkraut entfernen..."
                value={lawnGoal}
                onChange={(e) => setLawnGoal(e.target.value)}
                className="mt-1 min-h-[80px]"
                rows={3}
              />
            </div>
          </div>

          {/* Desktop Analyze Button */}
          <div className="hidden md:block">
            <Button 
              onClick={handleAnalyze} 
              disabled={!selectedFile || isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 text-lg rounded-lg"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Analysiere Rasen...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Rasen analysieren
                </>
              )}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-200">
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
              lawnImageUrl={previewUrl}
              grassType={grassType}
              lawnSize={lawnGoal}
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