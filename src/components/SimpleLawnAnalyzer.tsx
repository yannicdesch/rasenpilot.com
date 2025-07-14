import React, { useState } from 'react';
import { useSimpleLawnAnalysis } from '@/hooks/useSimpleLawnAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, CheckCircle, AlertCircle, Image, Sparkles, TrendingUp, Target } from 'lucide-react';
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
  const [isDragOver, setIsDragOver] = useState(false);

  const { analyze, isLoading, error } = useSimpleLawnAnalysis();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
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
    if (numScore >= 80) return "from-green-500 to-green-600";
    if (numScore >= 60) return "from-yellow-500 to-yellow-600";
    return "from-red-500 to-red-600";
  };

  const getScoreRing = (score: string) => {
    const numScore = parseInt(score);
    if (numScore >= 80) return "stroke-green-500";
    if (numScore >= 60) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Upload Section */}
      <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl mb-4">
              <Camera className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Rasen-Foto hochladen
            </h2>
            <p className="text-gray-600">
              Laden Sie ein Foto Ihres Rasens hoch und erhalten Sie eine KI-gestützte Analyse
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
              ${isDragOver 
                ? 'border-green-400 bg-green-50' 
                : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'
              }
            `}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block">
                  <img 
                    src={previewUrl} 
                    alt="Vorschau" 
                    className="max-w-xs max-h-64 rounded-xl shadow-lg border border-gray-200"
                  />
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-sm text-green-600 font-medium">
                  Bild erfolgreich hochgeladen
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl">
                  <Image className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Foto hier ablegen oder klicken zum Auswählen
                  </p>
                  <p className="text-sm text-gray-500">
                    Unterstützte Formate: JPG, PNG, WEBP
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          {selectedFile && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Rasentyp (optional)
                </label>
                <Select value={grassType} onValueChange={setGrassType}>
                  <SelectTrigger className="h-12 border-gray-200 bg-white/80 backdrop-blur-sm">
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

              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Rasenziel (optional)
                </label>
                <Textarea
                  placeholder="z.B. Dichten Rasen für Kinder zum Spielen..."
                  value={lawnGoal}
                  onChange={(e) => setLawnGoal(e.target.value)}
                  className="min-h-12 border-gray-200 bg-white/80 backdrop-blur-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Analyze Button */}
          {selectedFile && (
            <div className="mt-8 flex flex-col items-center">
              <Button 
                onClick={handleAnalyze} 
                disabled={!selectedFile || isLoading}
                className="w-full md:w-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analysiere mit KI...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Rasen analysieren
                  </>
                )}
              </Button>
              
              {!isLoading && (
                <p className="text-xs text-gray-500 mt-2">
                  Analyse dauert ca. 10-15 Sekunden
                </p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-6 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-xl border border-red-200">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Score Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Rasen-Score</h3>
                    <p className="text-gray-600 text-sm">Gesamtbewertung Ihres Rasens</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <svg className="w-20 h-20 transform -rotate-90">
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="40"
                        cy="40"
                        r="36"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2.26 * parseInt(analysisResult.score)} 226`}
                        className={getScoreRing(analysisResult.score)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-gray-900">{analysisResult.score}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Gesundheit</p>
                    <p className="text-lg font-semibold text-gray-900">{analysisResult.overall_health}%</p>
                    <p className="text-sm text-gray-500">Zeitrahmen: {analysisResult.timeline}</p>
                  </div>
                </div>

                <div className={`px-4 py-2 rounded-xl text-white font-medium bg-gradient-to-r ${getScoreColor(analysisResult.score)}`}>
                  {parseInt(analysisResult.score) >= 80 ? 'Ausgezeichnet' : 
                   parseInt(analysisResult.score) >= 60 ? 'Gut' : 'Verbesserungswürdig'}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Condition Card */}
          <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Rasenzustand</h3>
                  <p className="text-gray-600 text-sm">Detaillierte Bewertung</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                <p className="text-gray-700 leading-relaxed">{analysisResult.grass_condition}</p>
              </div>
            </CardContent>
          </Card>

          {/* Problems & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Problems */}
            {analysisResult.problems.length > 0 && (
              <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Probleme</h3>
                      <p className="text-gray-600 text-sm">Erkannte Schwachstellen</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.problems.map((problem, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-gray-700">{problem}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-500 to-teal-500 rounded-xl">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Empfehlungen</h3>
                      <p className="text-gray-600 text-sm">Maßnahmen zur Verbesserung</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {analysisResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{rec}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};