
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Sparkles, UserPlus } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';

const AnalysisResults = () => {
  const navigate = useNavigate();
  const { temporaryProfile, isAuthenticated } = useLawn();
  const [analysis, setAnalysis] = useState<string>('');
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
      } catch (error) {
        console.error('Analysis error:', error);
        console.log('Falling back to mock analysis');
        // Fallback to mock analysis
        setAnalysis(getMockAnalysis(temporaryProfile.rasenproblem));
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
                  Unsere KI erstellt gerade eine personalisierte Analyse basierend auf deiner Beschreibung.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-100 mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Sparkles className="h-6 w-6 text-green-600 mr-2" />
                <CardTitle className="text-2xl text-green-800">
                  Deine kostenlose Rasenanalyse
                </CardTitle>
              </div>
              <p className="text-gray-600">
                Basierend auf deiner Problembeschreibung haben wir eine personalisierte Analyse erstellt
              </p>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-green max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: analysis.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^🌱/gm, '<div class="mb-4">🌱')
                    .replace(/^🛠️/gm, '</div><div class="mb-4">🛠️')
                    .replace(/^💡/gm, '</div><div class="mb-4">💡')
                    .replace(/^🛒/gm, '</div><div class="mb-4">🛒')
                    .replace(/\n- /g, '<br>• ')
                    .replace(/\n/g, '<br>')
                    + '</div>'
                }}
              />
            </CardContent>
          </Card>

          {!isAuthenticated && (
            <Card className="border-green-200 bg-green-50 mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <UserPlus className="h-8 w-8 text-green-600 mr-2" />
                    <h3 className="text-xl font-semibold text-green-800">
                      Möchtest du weitere Analysen und Premium-Features?
                    </h3>
                  </div>
                  
                  <p className="text-gray-700 mb-6">
                    Registriere dich kostenlos für unbegrenzte KI-Analysen, personalisierte Pflegepläne 
                    und exklusive Rasenpflege-Tools.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-2">Mit Registrierung:</h4>
                      <ul className="text-sm text-gray-700 space-y-1 text-left">
                        <li>• Unbegrenzte KI-Rasenanalysen</li>
                        <li>• Personalisierte Pflegepläne</li>
                        <li>• Fortschritts-Tracking</li>
                        <li>• Wetterbasierte Empfehlungen</li>
                        <li>• Premium-Support</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-600 mb-2">Ohne Registrierung:</h4>
                      <ul className="text-sm text-gray-600 space-y-1 text-left">
                        <li>• Nur 1 kostenlose Analyse</li>
                        <li>• Begrenzte Funktionen</li>
                        <li>• Keine Fortschritts-Speicherung</li>
                        <li>• Basis-Empfehlungen</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button 
                      onClick={handleContinueToRegistration}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <UserPlus className="mr-2 h-5 w-5" />
                      Kostenlos registrieren
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleSkipRegistration}
                      size="lg"
                    >
                      Später registrieren
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              {isAuthenticated 
                ? 'Im Dashboard findest du weitere Tools und deinen personalisierten Pflegeplan.'
                : 'Entdecke weitere Funktionen in unserem Dashboard.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
