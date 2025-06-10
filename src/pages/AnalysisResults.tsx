import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Sparkles, UserPlus, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';

const AnalysisResults = () => {
  const navigate = useNavigate();
  const { temporaryProfile, isAuthenticated } = useLawn();
  const [analysis, setAnalysis] = useState<string>('');
  const [healthScore, setHealthScore] = useState<number>(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('AnalysisResults mounted');
    console.log('temporaryProfile:', temporaryProfile);
    console.log('isAuthenticated:', isAuthenticated);
    
    const performAnalysis = async () => {
      if (!temporaryProfile?.rasenproblem) {
        console.error('No problem description found in temporaryProfile');
        toast.error('Keine Problembeschreibung gefunden');
        navigate('/onboarding');
        return;
      }

      console.log('Starting analysis for problem:', temporaryProfile.rasenproblem);
      console.log('Has image:', !!temporaryProfile.rasenbild);

      try {
        console.log('Calling analyze-lawn-problem edge function...');
        const { data, error } = await supabase.functions.invoke('analyze-lawn-problem', {
          body: {
            problem: temporaryProfile.rasenproblem,
            hasImage: !!temporaryProfile.rasenbild
          }
        });

        if (error) {
          console.error('Edge function error:', error);
          throw error;
        }

        console.log('Analysis response:', data);
        setAnalysis(data.analysis);
        
        // Extract health score from analysis
        if (data.analysis) {
          const healthMatch = data.analysis.match(/(\d+)\/10/);
          if (healthMatch) {
            setHealthScore(parseInt(healthMatch[1]) * 10);
          } else {
            // Look for percentage in the text
            const percentMatch = data.analysis.match(/(\d+)\s*%/);
            if (percentMatch) {
              setHealthScore(parseInt(percentMatch[1]));
            }
          }
        }
      } catch (error) {
        console.error('Analysis error:', error);
        console.log('Falling back to mock analysis');
        // Fallback to mock analysis
        setAnalysis(getMockAnalysis(temporaryProfile.rasenproblem));
        setHealthScore(65); // Better default score
        toast.info('KI-Analyse nicht verfügbar, zeige Beispielanalyse');
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [temporaryProfile, navigate]);

  const getMockAnalysis = (problem: string) => {
    return `🌱 **Vermutete Diagnose**
Basierend auf Ihrer Beschreibung "${problem}" liegt wahrscheinlich ein Nährstoffmangel oder ein Problem mit der Wasserversorgung vor. Dies sind häufige Ursachen für die beschriebenen Symptome.

**Gesamtgesundheit:** 6.5/10

🛠️ **Empfohlene Behandlung**
- Führen Sie einen Bodentest durch, um den pH-Wert und Nährstoffgehalt zu bestimmen
- Bewässern Sie den Rasen tief aber weniger häufig (2-3 mal pro Woche)
- Düngen Sie mit einem ausgewogenen Rasendünger (NPK 3-1-2)
- Entfernen Sie Unkraut und lockern Sie verdichtete Bereiche auf

💡 **Vorbeugung**
- Regelmäßige Bewässerung in den frühen Morgenstunden
- Vierteljährliche Düngung während der Wachstumsperiode
- Jährliche Bodenbelüftung im Herbst
- Vermeidung von Überdüngung

🛒 **Mögliche Produkte**
- Langzeitrasendünger mit Eisenanteil
- Bodenverbesserungsmittel oder Kompost
- Rasenbelüfter oder Vertikutierer
- pH-Teststreifen für regelmäßige Kontrollen`;
  };

  const parseAnalysisForStructure = (analysisText: string) => {
    const lines = analysisText.split('\n').filter(line => line.trim().length > 0);
    
    // Extract problem
    const problemLine = lines.find(line => 
      line.includes('Diagnose') || line.includes('Problem') || line.includes('Zustand')
    );
    const problem = problemLine ? problemLine.replace(/[🌱🔍]/g, '').replace(/\*\*/g, '').trim() : 
      'Nährstoffmangel oder Wasserproblem erkannt';

    // Extract cause
    const causeLine = lines.find(line => line.includes('Ursache') || line.includes('wahrscheinlich'));
    const cause = causeLine ? causeLine.replace(/[🧠]/g, '').replace(/\*\*/g, '').trim() : 
      'Basierend auf KI-Analyse';

    // Extract solutions
    const solutionLines = lines.filter(line => 
      line.includes('Empfehlung') || line.includes('Behandlung') || line.includes('- ')
    ).slice(0, 4);
    
    const solutions = solutionLines.length > 0 ? 
      solutionLines.map(line => line.replace(/[🛠️💡-]/g, '').replace(/\*\*/g, '').trim()) :
      [
        'Bodentest durchführen (pH-Wert und Nährstoffe)',
        'Regelmäßig aber tief bewässern',
        'Ausgewogenen Rasendünger verwenden',
        'Verdichtete Bereiche lockern'
      ];

    return { problem, cause, solutions };
  };

  const handleContinueToRegistration = () => {
    console.log('Redirecting to registration');
    navigate('/auth?tab=register');
  };

  const handleSkipRegistration = () => {
    console.log('Skipping registration, going to dashboard');
    // Mark free analysis as used
    localStorage.setItem('freeAnalysisUsed', 'true');
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-100">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
                <h2 className="text-xl font-semibold mb-2">Analysiere dein Rasenproblem...</h2>
                <p className="text-gray-600 text-center">
                  Unsere KI erstellt gerade eine personalisierte Analyse.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const structuredAnalysis = parseAnalysisForStructure(analysis);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header with Score */}
          <Card className="border-green-100 mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-green-600 mr-3" />
                <CardTitle className="text-2xl text-green-800">
                  🌿 Deine Rasenanalyse ist da!
                </CardTitle>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-gray-800">
                    📊 Dein Rasen-Score:
                  </span>
                  <span className="text-4xl font-bold text-green-600">
                    {healthScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-1000" 
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  🔒 Du kannst ihn auf <strong>90%</strong> verbessern – wir zeigen dir wie!
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Problem Identification */}
          <Card className="border-orange-200 bg-orange-50 mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-xl text-orange-800">Erkanntes Problem</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="font-semibold text-gray-800 mb-1">🟢 Zustand:</p>
                  <p className="text-gray-700">{structuredAnalysis.problem}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">🧠 Wahrscheinliche Ursache:</p>
                  <p className="text-gray-700">{structuredAnalysis.cause}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Solutions */}
          <Card className="border-blue-200 bg-blue-50 mb-6">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-xl text-blue-800">Lösungsempfehlungen</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {structuredAnalysis.solutions.map((solution, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{solution}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Registration CTA - Only for non-authenticated users */}
          {!isAuthenticated && (
            <Card className="border-green-200 bg-green-50 mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <UserPlus className="h-8 w-8 text-green-600 mr-2" />
                    <h3 className="text-xl font-semibold text-green-800">
                      Jetzt kostenlos registrieren für:
                    </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">✅ Mit Registrierung:</h4>
                      <ul className="text-sm text-gray-700 space-y-1 text-left">
                        <li>• Unbegrenzte KI-Analysen</li>
                        <li>• Personalisierte Pflegepläne</li>
                        <li>• Fortschritts-Tracking</li>
                        <li>• Wetterbasierte Empfehlungen</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-600 mb-2">❌ Ohne Registrierung:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 text-left">
                        <li>• Nur 1 kostenlose Analyse</li>
                        <li>• Begrenzte Funktionen</li>
                        <li>• Keine Speicherung</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={() => navigate('/auth?tab=register')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Kostenlos registrieren
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      size="lg"
                    >
                      Später registrieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue to Dashboard */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
