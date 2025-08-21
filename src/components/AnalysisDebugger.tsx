import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle, TestTube } from 'lucide-react';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: any;
}

const AnalysisDebugger = () => {
  const [isTestingOpenAI, setIsTestingOpenAI] = useState(false);
  const [isTestingAnalysis, setIsTestingAnalysis] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  const addTestResult = (result: TestResult) => {
    setTestResults(prev => [...prev, result]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const testOpenAIConnection = async () => {
    setIsTestingOpenAI(true);
    clearResults();

    try {
      addTestResult({ name: 'OpenAI Test', status: 'warning', message: 'Teste OpenAI API Verbindung...' });
      
      const { data, error } = await supabase.functions.invoke('test-openai', {
        body: {}
      });

      if (error) {
        addTestResult({
          name: 'OpenAI Test',
          status: 'error',
          message: `Edge Function Fehler: ${error.message}`,
          details: error
        });
        return;
      }

      if (data?.success) {
        addTestResult({
          name: 'OpenAI Test',
          status: 'success',
          message: `✅ OpenAI API funktioniert! Response: ${data.response}`,
          details: data
        });
      } else {
        addTestResult({
          name: 'OpenAI Test',
          status: 'error',
          message: data?.error || 'OpenAI API Test fehlgeschlagen',
          details: data
        });
      }

    } catch (error) {
      console.error('OpenAI test error:', error);
      addTestResult({
        name: 'OpenAI Test',
        status: 'error',
        message: `Test Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        details: error
      });
    } finally {
      setIsTestingOpenAI(false);
    }
  };

  const testAnalysisFlow = async () => {
    setIsTestingAnalysis(true);
    
    try {
      addTestResult({ name: 'Analysis Flow', status: 'warning', message: 'Teste Analysis Workflow...' });

      // Test 1: Create a test analysis job
      addTestResult({ name: 'Job Creation', status: 'warning', message: 'Erstelle Test-Job...' });
      
      const { data: jobId, error: jobError } = await supabase
        .rpc('create_analysis_job', {
          p_user_id: null,
          p_image_path: 'test/dummy.jpg',
          p_grass_type: 'test',
          p_lawn_goal: 'debug-test',
          p_metadata: JSON.stringify({ 
            debug_test: true,
            timestamp: new Date().toISOString()
          })
        });

      if (jobError) {
        addTestResult({
          name: 'Job Creation',
          status: 'error',
          message: `Job Erstellung fehlgeschlagen: ${jobError.message}`,
          details: jobError
        });
        return;
      }

      addTestResult({
        name: 'Job Creation',
        status: 'success',
        message: `✅ Test-Job erstellt: ${jobId}`,
        details: { jobId }
      });

      // Test 2: Try to start analysis
      addTestResult({ name: 'Analysis Start', status: 'warning', message: 'Starte Analysis...' });
      
      const { data: startData, error: startError } = await supabase.functions.invoke('start-analysis', {
        body: { jobId }
      });

      if (startError) {
        addTestResult({
          name: 'Analysis Start',
          status: 'error',
          message: `Analysis Start fehlgeschlagen: ${startError.message}`,
          details: startError
        });
        return;
      }

      addTestResult({
        name: 'Analysis Start',
        status: 'success',
        message: '✅ Analysis erfolgreich gestartet',
        details: startData
      });

      // Test 3: Check job status after a short delay
      setTimeout(async () => {
        try {
          addTestResult({ name: 'Job Status', status: 'warning', message: 'Prüfe Job Status...' });
          
          const { data: statusData, error: statusError } = await supabase
            .rpc('get_analysis_job', { p_job_id: jobId });

          if (statusError) {
            addTestResult({
              name: 'Job Status',
              status: 'error',
              message: `Status Check fehlgeschlagen: ${statusError.message}`,
              details: statusError
            });
            return;
          }

          const jobData = statusData as any;
          addTestResult({
            name: 'Job Status',
            status: 'success',
            message: `✅ Job Status: ${jobData?.status || 'unbekannt'}`,
            details: statusData
          });

        } catch (error) {
          addTestResult({
            name: 'Job Status',
            status: 'error',
            message: `Status Check Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
            details: error
          });
        }
      }, 3000);

    } catch (error) {
      console.error('Analysis test error:', error);
      addTestResult({
        name: 'Analysis Flow',
        status: 'error',
        message: `Test Fehler: ${error instanceof Error ? error.message : 'Unbekannter Fehler'}`,
        details: error
      });
    } finally {
      setIsTestingAnalysis(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <TestTube className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Analysis Debugger
        </CardTitle>
        <CardDescription>
          Teste die ChatGPT Analyse-Funktionalität um zu verstehen warum immer 85% angezeigt wird
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testOpenAIConnection}
            disabled={isTestingOpenAI}
            className="flex-1"
          >
            {isTestingOpenAI ? 'Teste...' : 'OpenAI API Testen'}
          </Button>
          
          <Button 
            onClick={testAnalysisFlow}
            disabled={isTestingAnalysis}
            className="flex-1"
            variant="outline"
          >
            {isTestingAnalysis ? 'Teste...' : 'Analysis Flow Testen'}
          </Button>
          
          <Button 
            onClick={clearResults}
            variant="ghost"
            size="sm"
          >
            Clear
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <h3 className="font-semibold text-sm">Test Ergebnisse:</h3>
            {testResults.map((result, index) => (
              <Alert key={index} className={`text-sm ${
                result.status === 'success' ? 'border-green-200 bg-green-50' :
                result.status === 'error' ? 'border-red-200 bg-red-50' :
                'border-yellow-200 bg-yellow-50'
              }`}>
                <div className="flex items-start gap-2">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="font-medium">{result.name}</div>
                    <AlertDescription className="mt-1">
                      {result.message}
                    </AlertDescription>
                    {result.details && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs text-gray-600">
                          Details anzeigen
                        </summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Mögliche Ursachen für 85% Score:</strong>
            <ul className="list-disc list-inside mt-1 text-sm">
              <li>OpenAI API Key fehlt oder ist ungültig</li>
              <li>Edge Function process-analysis läuft in einen Timeout</li>
              <li>Fallback zu Mock-Daten wird verwendet</li>
              <li>JSON Parsing der ChatGPT Response schlägt fehl</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AnalysisDebugger;