
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Sparkles, ArrowRight, Leaf, CheckCircle, Star, Zap, Loader2, TestTube } from 'lucide-react';
import AsyncLawnAnalyzer from '@/components/AsyncLawnAnalyzer';
import { toast } from 'sonner';
import { AIAnalysisResult } from '@/services/aiAnalysisService';
import { supabase } from '@/integrations/supabase/client';

const LawnAnalysis = () => {
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

  const testOpenAI = async () => {
    setIsTesting(true);
    console.log('=== STARTING OPENAI TEST ===');
    
    try {
      console.log('Calling test-openai edge function...');
      
      const { data, error } = await supabase.functions.invoke('test-openai', {
        body: {}
      });
      
      console.log('=== TEST RESPONSE RECEIVED ===');
      console.log('Data:', data);
      console.log('Error:', error);
      
      if (error) {
        console.error('❌ Supabase function error:', error);
        toast.error(`Test failed: ${error.message}`);
        return;
      }
      
      if (data) {
        console.log('✅ Test completed successfully');
        console.log('Response data:', JSON.stringify(data, null, 2));
        
        if (data.success) {
          toast.success(`✅ ${data.message}`);
          console.log('✅ OpenAI API Key Test Results:');
          console.log('Key Present:', data.keyPresent);
          console.log('Key Valid:', data.keyValid);
          console.log('OpenAI Response:', data.response);
        } else {
          toast.error(`❌ ${data.error}`);
          console.error('❌ OpenAI API Key Test Results:');
          console.error('Key Present:', data.keyPresent);
          console.error('Key Valid:', data.keyValid || false);
          console.error('Error:', data.error);
        }
      } else {
        console.error('❌ No data received from test function');
        toast.error('No response from test function');
      }
      
    } catch (error) {
      console.error('❌ Test function call failed:', error);
      toast.error(`Test function call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleAnalysisComplete = (results: AIAnalysisResult) => {
    console.log('=== ANALYSIS COMPLETE ===');
    console.log('Results:', results);
    setAnalysisResult(results);
    toast.success('KI-Analyse erfolgreich abgeschlossen!');
  };

  const handleGetCarePlan = () => {
    navigate('/auth', { 
      state: { 
        analysisResult,
        redirectTo: '/care-plan'
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-green-800">Rasenpilot</span>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/highscore')}
            >
              Bestenliste
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/blog-overview')}
            >
              Ratgeber
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/auth')}
            >
              Anmelden
            </Button>
          </div>
        </nav>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              Neue Asynchrone KI-Rasenanalyse
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Ohne Timeouts! Lade ein Foto hoch und erhalte eine zuverlässige Analyse im Hintergrund
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <Zap className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium">Keine Timeouts</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <Star className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium">Zuverlässig</span>
              </div>
              <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium">Hintergrundverarbeitung</span>
              </div>
            </div>

            {/* Debug Test Button */}
            <div className="mt-8">
              <Button
                onClick={testOpenAI}
                disabled={isTesting}
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Test OpenAI API Key
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analysis Form */}
          <div className="mb-8">
            <AsyncLawnAnalyzer
              onAnalysisComplete={handleAnalysisComplete}
              grassType="unknown"
              lawnGoal={problem || 'Umfassende Rasenanalyse'}
            />
          </div>

          {/* Problem Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-6 w-6 text-green-600" />
                Zusätzliche Beschreibung (optional)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschreibe dein Rasenproblem im Detail
                </label>
                <Textarea
                  placeholder="z.B. Gelbe Flecken trotz regelmäßiger Bewässerung, Moos breitet sich aus, kahle Stellen..."
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysisResult && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-green-800">
                  Deine KI-Rasenanalyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {analysisResult.overallHealth}/10
                    </div>
                    <p className="text-gray-600">Gesundheitsscore</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {analysisResult.issues?.length || 0}
                    </div>
                    <p className="text-gray-600">Probleme erkannt</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      {analysisResult.generalRecommendations?.length || 0}
                    </div>
                    <p className="text-gray-600">Empfehlungen</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-red-600">
                      Erkannte Probleme:
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.issues?.map((issue, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-gray-700">{issue.issue}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">Keine spezifischen Probleme erkannt</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-green-600">
                      Unsere Empfehlungen:
                    </h3>
                    <ul className="space-y-2">
                      {analysisResult.generalRecommendations?.map((rec, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-gray-700">{rec}</span>
                        </li>
                      )) || (
                        <li className="text-gray-500">Keine spezifischen Empfehlungen verfügbar</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">
                    Möchten Sie einen detaillierten Pflegeplan?
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Registrieren Sie sich kostenlos und erhalten Sie einen personalisierten 
                    Schritt-für-Schritt Pflegeplan mit Zeitplan und Produktempfehlungen.
                  </p>
                  <Button
                    onClick={handleGetCarePlan}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Kostenlosen Pflegeplan erhalten
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Asynchrone KI-Analyse</h3>
              <p className="text-gray-600">Keine Timeouts mehr - die Analyse läuft zuverlässig im Hintergrund</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Zuverlässige Ergebnisse</h3>
              <p className="text-gray-600">Robuste Verarbeitung großer Bilder ohne Verbindungsabbrüche</p>
            </div>
            
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Fortschritts-Tracking</h3>
              <p className="text-gray-600">Verfolge den Status deiner Analyse in Echtzeit</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawnAnalysis;
