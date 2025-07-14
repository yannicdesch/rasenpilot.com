import React, { useState, useRef } from 'react';
import { useSimpleLawnAnalysis } from '@/hooks/useSimpleLawnAnalysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Camera, CheckCircle, AlertCircle, ImageIcon, X } from 'lucide-react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { analyze, isLoading, error } = useSimpleLawnAnalysis();
  const { toast } = useToast();

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files[0] && files[0].type.startsWith('image/')) {
      handleFileSelect(files[0]);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Upload Section */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!previewUrl ? (
            <div
              className={`relative border-2 border-dashed rounded-lg transition-colors cursor-pointer
                ${isDragOver 
                  ? 'border-primary bg-primary/5' 
                  : 'border-gray-300 hover:border-gray-400'
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Rasenbild hochladen
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Ziehen Sie ein Bild hierher oder klicken Sie zum Auswählen
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>JPG, PNG bis 10MB</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Hochgeladenes Rasenbild" 
                className="w-full h-48 sm:h-64 object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                <p className="text-white text-sm font-medium">
                  {selectedFile?.name}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Options Section - Only show when image is uploaded */}
      {selectedFile && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Zusätzliche Informationen
            </h3>
            
            {/* Grass Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Rasentyp (optional)
              </Label>
              <Select value={grassType} onValueChange={setGrassType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wählen Sie Ihren Rasentyp" />
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
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Ihr Rasenziel (optional)
              </Label>
              <Textarea
                placeholder="Beschreiben Sie, wie Ihr Rasen aussehen soll..."
                value={lawnGoal}
                onChange={(e) => setLawnGoal(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analyze Button */}
      {selectedFile && (
        <Button 
          onClick={handleAnalyze} 
          disabled={isLoading}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              KI analysiert Ihren Rasen...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-5 w-5" />
              Jetzt analysieren
            </>
          )}
        </Button>
      )}

      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-3 text-red-600 bg-red-50 p-4 rounded-lg border border-red-200">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-sm">Analyse fehlgeschlagen</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {analysisResult && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Ihre Rasenanalyse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score and Health */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-white font-bold text-xl ${getScoreColor(analysisResult.score)}`}>
                  {analysisResult.score}
                </div>
                <p className="text-xs text-gray-500 mt-1">Gesamtscore</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  Gesundheit: {analysisResult.overall_health}
                </p>
                <p className="text-sm text-gray-600">
                  Zeitrahmen: {analysisResult.timeline}
                </p>
              </div>
            </div>

            {/* Grass Condition */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Aktueller Zustand:</h4>
              <p className="text-sm text-gray-700 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                {analysisResult.grass_condition}
              </p>
            </div>

            {/* Problems */}
            {analysisResult.problems.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Identifizierte Probleme:</h4>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.problems.map((problem, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {problem}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysisResult.recommendations.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Empfohlene Maßnahmen:</h4>
                <div className="space-y-3">
                  {analysisResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};