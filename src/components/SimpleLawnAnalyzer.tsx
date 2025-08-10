import React, { useState, useRef, useEffect } from 'react';
import { useSimpleLawnAnalysis } from '@/hooks/useSimpleLawnAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, CheckCircle, AlertCircle, Trophy, Download, Leaf } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ScoreSubmissionForm from '@/components/ScoreSubmissionForm';
import CarePlanDownload from '@/components/CarePlanDownload';
import WeatherEnhancedResults from '@/components/WeatherEnhancedResults';
import { supabase } from '@/lib/supabase';

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
  const [zipCode, setZipCode] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>('');

  const { analyze, isLoading, error } = useSimpleLawnAnalysis();
  const { toast } = useToast();
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Start analysis automatically
      try {
        // First upload the image to Supabase storage to get a permanent URL
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lawn-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast({
            title: "Upload fehlgeschlagen",
            description: "Das Bild konnte nicht hochgeladen werden",
            variant: "destructive"
          });
          return;
        }

        // Get the public URL for the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from('lawn-images')
          .getPublicUrl(fileName);
        
        setUploadedImageUrl(publicUrl);
        console.log('Image uploaded successfully:', publicUrl);

        const result = await analyze(file, grassType, lawnGoal, zipCode);
        setAnalysisResult(result);
        
        console.log('Analysis result:', result);
        console.log('Uploaded image URL for highscore:', publicUrl);
        
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
      // First upload the image to Supabase storage to get a permanent URL
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lawn-images')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast({
          title: "Upload fehlgeschlagen",
          description: "Das Bild konnte nicht hochgeladen werden",
          variant: "destructive"
        });
        return;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('lawn-images')
        .getPublicUrl(fileName);
      
      setUploadedImageUrl(publicUrl);
      console.log('Image uploaded successfully:', publicUrl);

      const result = await analyze(selectedFile, grassType, lawnGoal, zipCode);
      setAnalysisResult(result);
      
      console.log('Analysis result:', result);
      console.log('Uploaded image URL for highscore:', publicUrl);
      
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

  // Auto-scroll to results when analysis is complete
  useEffect(() => {
    if (analysisResult && resultsRef.current) {
      resultsRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [analysisResult]);

  const getScoreColor = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return "bg-green-500";
    if (numScore >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Modern Upload Section */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-green-50 via-white to-emerald-50 overflow-hidden">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl md:text-3xl font-bold">
            <div className="p-2 bg-white/20 rounded-full">
              <Camera className="h-7 w-7 md:h-8 md:w-8" />
            </div>
            Einfache Rasenanalyse mit KI
          </CardTitle>
          <p className="text-green-100 font-medium text-lg">Rasenbild hochladen</p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          {/* Drag & Drop Upload Area */}
          <div className="relative">
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={`
              border-3 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg
              ${previewUrl 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50'
              }
            `}>
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img 
                      src={previewUrl} 
                      alt="Rasen Vorschau" 
                      className="max-w-full max-h-64 md:max-h-80 rounded-xl shadow-lg border-2 border-green-200"
                    />
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-2">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  </div>
                   <p className="text-green-700 font-medium">
                    {isLoading ? "🔄 Analysiere..." : "✅ Analyse abgeschlossen"}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-300 text-green-700 hover:bg-green-50"
                  >
                    Anderes Bild wählen
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-10 w-10 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Rasen-Foto hier ablegen
                    </h3>
                    <p className="text-gray-600 mb-4">
                      oder <span className="text-green-600 font-medium">hier klicken zum Auswählen</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      JPG, PNG oder WEBP • Max. 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Display */}
          <div className="mt-6">
            {isLoading && (
              <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-bold py-4 text-lg rounded-xl border border-green-300 flex items-center justify-center">
                <Loader2 className="mr-3 h-6 w-6 animate-spin text-green-600" />
                Analysiere Rasen...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modern Tech Badge */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-full shadow-sm hover:shadow-md transition-shadow">
          <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">
            🚀 Revolutionäre Rasenanalyse mit Multi-LLM Technologie
          </span>
        </div>
      </div>

      {/* Modern Optional Settings */}
      <Card className="border-0 shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            Zusätzliche Einstellungen (optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Modern Form Fields */}
          <div className="space-y-6">
            {/* Grass Type */}
            <div className="space-y-2">
              <Label htmlFor="grass-type" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                Rasentyp (optional)
              </Label>
              <Select value={grassType} onValueChange={setGrassType}>
                <SelectTrigger className="h-12 border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors rounded-xl bg-gray-50 hover:bg-white">
                  <SelectValue placeholder="Wählen Sie Ihren Rasentyp..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-gray-200 shadow-xl">
                  <SelectItem value="unknown" className="rounded-lg">🤷‍♂️ Unbekannt</SelectItem>
                  <SelectItem value="english-lawn" className="rounded-lg">🇬🇧 Englischer Rasen</SelectItem>
                  <SelectItem value="sport-lawn" className="rounded-lg">⚽ Sportrasen</SelectItem>
                  <SelectItem value="shadow-lawn" className="rounded-lg">🌲 Schattenrasen</SelectItem>
                  <SelectItem value="utility-lawn" className="rounded-lg">🏠 Gebrauchsrasen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lawn Goal */}
            <div className="space-y-2">
              <Label htmlFor="lawn-goal" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                Rasenziel (optional)
              </Label>
              <Textarea
                id="lawn-goal"
                placeholder="Beschreiben Sie Ihr Ziel... z.B. 'Dichten Rasen für Kinder zum Spielen', 'Unkraut entfernen', 'Kahle Stellen beheben'..."
                value={lawnGoal}
                onChange={(e) => setLawnGoal(e.target.value)}
                className="min-h-[100px] border-2 border-gray-200 hover:border-green-300 focus:border-green-500 transition-colors rounded-xl bg-gray-50 hover:bg-white resize-none"
                rows={4}
              />
            </div>

            {/* Zip Code for Weather Integration */}
            <div className="space-y-2">
              <Label htmlFor="zip-code" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.4 4.4 0 003 15z" />
                </svg>
                Postleitzahl für Wetteranalyse (optional)
              </Label>
              <Input
                id="zip-code"
                placeholder="z.B. 10115 für Berlin"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 transition-colors rounded-xl bg-gray-50 hover:bg-white"
                maxLength={5}
              />
              <p className="text-xs text-gray-500">
                Wetterbasierte Empfehlungen für Ihren Standort
              </p>
            </div>
          </div>

          {/* Status Display */}
          <div className="pt-4 border-t border-gray-100">
            {isLoading && (
              <div className="w-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 font-bold py-4 text-lg rounded-xl border border-green-300 flex items-center justify-center">
                <Loader2 className="mr-3 h-6 w-6 animate-spin text-green-600" />
                <span>Analysiere Rasen...</span>
              </div>
            )}
          </div>

          {/* Modern Error Display */}
          {error && (
            <div className="flex items-start gap-3 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200 shadow-sm">
              <div className="p-1 bg-red-100 rounded-full">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Fehler bei der Analyse</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResult && (
        <Card ref={resultsRef}>
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
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  Identifizierte Probleme
                </h4>
                <div className="space-y-3">
                  {analysisResult.problems.map((problem, index) => (
                    <div key={index} className="bg-red-50 border border-red-100 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-red-800">{problem}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  RasenPilot empfiehlt: Sofort-Maßnahmen
                </h4>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-green-800">{rec}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            {analysisResult.next_steps && analysisResult.next_steps.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  RasenPilot empfiehlt: Langfristige Pflege
                </h4>
                <div className="space-y-3">
                  {analysisResult.next_steps.map((step, index) => (
                    <div key={index} className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm text-blue-800">{step}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Weather Enhanced Results */}
      {analysisResult && zipCode && (
        <WeatherEnhancedResults 
          zipCode={zipCode}
          recommendations={analysisResult.recommendations}
        />
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
              lawnImageUrl={uploadedImageUrl || previewUrl}
              grassType={grassType}
              lawnSize={lawnGoal}
              onSubmitSuccess={() => {
                console.log('Score submitted successfully!');
                toast({
                  title: "Score eingereicht!",
                  description: "Ihr Score wurde erfolgreich zur Bestenliste hinzugefügt.",
                });
              }} 
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};