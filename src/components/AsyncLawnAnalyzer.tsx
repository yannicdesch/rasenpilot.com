
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Sparkles, Camera, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { startImageAnalysis, pollJobStatus, AnalysisJob } from '@/services/asyncAnalysisService';
import { AIAnalysisResult } from '@/services/aiAnalysisService';

interface AsyncLawnAnalyzerProps {
  onAnalysisComplete?: (results: AIAnalysisResult) => void;
  grassType?: string;
  lawnGoal?: string;
}

const AsyncLawnAnalyzer: React.FC<AsyncLawnAnalyzerProps> = ({
  onAnalysisComplete,
  grassType,
  lawnGoal
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentJob, setCurrentJob] = useState<AnalysisJob | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 50MB for original)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Das Bild ist zu groß", {
          description: "Bitte wähle ein Bild unter 50MB."
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Ungültiger Dateityp", {
          description: "Bitte wähle ein Bild (JPG, PNG, etc.)."
        });
        return;
      }

      setSelectedFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Bitte wähle zuerst ein Foto aus');
      return;
    }

    setIsProcessing(true);
    setProgress(10);
    setStatusMessage('Bild wird hochgeladen...');

    try {
      const result = await startImageAnalysis(selectedFile, grassType, lawnGoal);
      
      if (!result.success || !result.jobId) {
        throw new Error(result.error || 'Failed to start analysis');
      }

      setProgress(30);
      setStatusMessage('Analyse wird gestartet...');
      toast.success('Analyse gestartet! Dies kann einige Minuten dauern.');

      // Start polling for results
      const cleanup = pollJobStatus(
        result.jobId,
        (job) => {
          setCurrentJob(job);
          
          switch (job.status) {
            case 'pending':
              setProgress(40);
              setStatusMessage('Warten auf verfügbare KI-Kapazität...');
              break;
            case 'processing':
              setProgress(70);
              setStatusMessage('KI analysiert dein Rasenbild...');
              break;
          }
        },
        (job) => {
          setCurrentJob(job);
          setProgress(100);
          setStatusMessage('Analyse abgeschlossen!');
          setIsProcessing(false);
          
          if (job.result && onAnalysisComplete) {
            onAnalysisComplete(job.result);
          }
          
          toast.success('KI-Analyse erfolgreich abgeschlossen!');
        },
        (error) => {
          setIsProcessing(false);
          setProgress(0);
          setStatusMessage('');
          toast.error('Fehler bei der Analyse: ' + error);
        }
      );

      // Cleanup polling when component unmounts or new analysis starts
      return () => cleanup();

    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
      console.error('Analysis error:', error);
      toast.error('Fehler beim Starten der Analyse: ' + (error instanceof Error ? error.message : 'Unbekannter Fehler'));
    }
  };

  const getStatusIcon = () => {
    if (!currentJob) return <Camera className="h-5 w-5" />;
    
    switch (currentJob.status) {
      case 'pending':
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Camera className="h-5 w-5" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <CardTitle>Asynchrone KI-Rasenanalyse</CardTitle>
        </div>
        <CardDescription>
          Lade ein Foto deines Rasens hoch für eine professionelle KI-Analyse ohne Wartezeit
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="bg-blue-50 border-blue-200">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">
            Verbesserte Analyse-Technologie
          </AlertTitle>
          <AlertDescription className="text-blue-700">
            Unsere neue asynchrone KI-Analyse verhindert Timeouts und liefert zuverlässige Ergebnisse. 
            Du kannst die Seite verlassen und später zurückkommen.
          </AlertDescription>
        </Alert>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          <label className="cursor-pointer block">
            <input 
              type="file" 
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
            {previewUrl ? (
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Vorschau" 
                  className="mx-auto max-h-64 rounded-md"
                />
                {!isProcessing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-md">
                    <p className="text-white text-sm font-medium">Klicken zum Ändern</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <Upload className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Klicke hier, um ein Foto deines Rasens hochzuladen</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG oder GIF, max. 50 MB</p>
              </div>
            )}
          </label>
        </div>

        {isProcessing && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{statusMessage}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
            <p className="text-xs text-gray-500 text-center">
              Die Analyse läuft im Hintergrund. Du kannst die Seite verlassen und später zurückkommen.
            </p>
          </div>
        )}

        <Button
          onClick={handleStartAnalysis}
          disabled={!selectedFile || isProcessing}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyse läuft...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              KI-Analyse starten
            </>
          )}
        </Button>

        {currentJob && currentJob.status === 'failed' && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertTitle className="text-red-800">Analyse fehlgeschlagen</AlertTitle>
            <AlertDescription className="text-red-700">
              {currentJob.error_message || 'Ein unbekannter Fehler ist aufgetreten. Bitte versuche es erneut.'}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AsyncLawnAnalyzer;
