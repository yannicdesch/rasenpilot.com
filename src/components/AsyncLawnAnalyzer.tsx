import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, Loader2, Sparkles, Camera, CheckCircle, AlertCircle, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { startImageAnalysis, pollJobStatus, AnalysisJob } from '@/services/asyncAnalysisService';
import { AIAnalysisResult } from '@/services/aiAnalysisService';
import { runStorageTest } from '@/components/admin/database/tests/StorageTest';

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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isTestingStorage, setIsTestingStorage] = useState(false);
  const [currentCleanup, setCurrentCleanup] = useState<(() => void) | null>(null);

  const addDebugLog = (message: string) => {
    console.log(message);
    setDebugLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      if (currentCleanup) {
        currentCleanup();
      }
    };
  }, [currentCleanup]);

  const testStorageConnection = async () => {
    setIsTestingStorage(true);
    addDebugLog('Testing storage connection...');
    
    try {
      const results = await runStorageTest();
      results.forEach(result => {
        addDebugLog(`${result.name}: ${result.status} - ${result.message}`);
        if (result.details) {
          addDebugLog(`Details: ${result.details}`);
        }
      });
      
      const hasErrors = results.some(r => r.status === 'error');
      if (hasErrors) {
        toast.error('Storage test failed - check debug logs');
      } else {
        toast.success('Storage connection test passed');
      }
    } catch (error) {
      addDebugLog(`Storage test error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error('Storage test failed');
    } finally {
      setIsTestingStorage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      addDebugLog(`Selected file: ${file.name}, Size: ${file.size} bytes, Type: ${file.type}`);
      
      // Check file size (max 50MB for original)
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Das Bild ist zu groß", {
          description: "Bitte wähle ein Bild unter 50MB."
        });
        addDebugLog('File rejected: too large');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast.error("Ungültiger Dateityp", {
          description: "Bitte wähle ein Bild (JPG, PNG, etc.)."
        });
        addDebugLog('File rejected: invalid type');
        return;
      }

      setSelectedFile(file);
      const newPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(newPreviewUrl);
      addDebugLog('File accepted and preview created');
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      toast.error('Bitte wähle zuerst ein Foto aus');
      return;
    }

    // Clean up any existing polling
    if (currentCleanup) {
      currentCleanup();
      setCurrentCleanup(null);
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusMessage('Wird vorbereitet...');
    setDebugLogs([]);
    
    addDebugLog('=== STARTING ASYNC ANALYSIS ===');
    addDebugLog(`File: ${selectedFile.name} (${selectedFile.size} bytes)`);
    addDebugLog(`Grass type: ${grassType || 'unknown'}`);
    addDebugLog(`Lawn goal: ${lawnGoal || 'default'}`);

    try {
      setProgress(10);
      setStatusMessage('Bild wird komprimiert...');
      
      addDebugLog('Calling startImageAnalysis...');
      const result = await startImageAnalysis(selectedFile, grassType, lawnGoal);
      
      addDebugLog(`Start analysis result: ${JSON.stringify(result)}`);
      
      if (!result.success) {
        // Handle specific storage errors with user-friendly messages
        if (result.error?.includes('bucket')) {
          setStatusMessage('Storage-Problem erkannt');
          toast.error('Speicher-Setup erforderlich', {
            description: 'Das Bild-Speichersystem muss konfiguriert werden. Bitte kontaktiere den Support.'
          });
        } else if (result.error?.includes('permission')) {
          setStatusMessage('Berechtigung verweigert');
          toast.error('Zugriff verweigert', {
            description: 'Du hast keine Berechtigung zum Hochladen von Bildern.'
          });
        } else {
          setStatusMessage('Fehler beim Starten');
          toast.error('Analyse konnte nicht gestartet werden', {
            description: result.error || 'Unbekannter Fehler'
          });
        }
        
        setIsProcessing(false);
        setProgress(0);
        addDebugLog(`Analysis failed to start: ${result.error}`);
        return;
      }

      if (!result.jobId) {
        throw new Error('No job ID returned from analysis start');
      }

      setProgress(30);
      setStatusMessage('Analyse wird gestartet...');
      addDebugLog(`Job created successfully: ${result.jobId}`);
      toast.success('Analyse gestartet! Dies kann einige Minuten dauern.');

      // Start polling for results
      addDebugLog('Starting job polling...');
      const cleanup = pollJobStatus(
        result.jobId,
        (job) => {
          setCurrentJob(job);
          addDebugLog(`Job update: ${job.status} at ${new Date().toISOString()}`);
          
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
          setCurrentCleanup(null);
          addDebugLog('Analysis completed successfully');
          
          if (job.result && onAnalysisComplete) {
            onAnalysisComplete(job.result);
          }
          
          toast.success('KI-Analyse erfolgreich abgeschlossen!');
        },
        (error) => {
          setIsProcessing(false);
          setProgress(0);
          setStatusMessage('');
          setCurrentCleanup(null);
          addDebugLog(`Analysis failed: ${error}`);
          toast.error('Fehler bei der Analyse: ' + error);
        }
      );

      // Store cleanup function
      setCurrentCleanup(() => cleanup);

    } catch (error) {
      setIsProcessing(false);
      setProgress(0);
      setStatusMessage('');
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      addDebugLog(`Analysis error: ${errorMessage}`);
      console.error('Analysis error:', error);
      
      // Show specific error message based on error type
      if (errorMessage.includes('bucket')) {
        toast.error('Speicher-Setup erforderlich', {
          description: 'Das Bild-Speichersystem muss konfiguriert werden.'
        });
      } else if (errorMessage.includes('timeout')) {
        toast.error('Verbindungs-Timeout', {
          description: 'Die Verbindung war zu langsam. Bitte versuche es erneut.'
        });
      } else {
        toast.error('Fehler beim Starten der Analyse: ' + errorMessage);
      }
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

        {/* Debug Panel */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={testStorageConnection}
              disabled={isTestingStorage || isProcessing}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {isTestingStorage ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="mr-1 h-3 w-3" />
                  Test Storage
                </>
              )}
            </Button>
          </div>
          
          {debugLogs.length > 0 && (
            <div className="bg-gray-50 p-3 rounded text-xs font-mono max-h-32 overflow-y-auto">
              <div className="font-semibold mb-1">Debug Logs:</div>
              {debugLogs.map((log, index) => (
                <div key={index} className="text-gray-700">{log}</div>
              ))}
            </div>
          )}
        </div>

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
