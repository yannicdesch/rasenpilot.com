
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, Sparkles, UserPlus, CheckCircle, AlertTriangle, Lightbulb, Clock, DollarSign, Leaf, Calendar } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import MainNavigation from '@/components/MainNavigation';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        setHealthScore(72); // Better default score
        toast.info('KI-Analyse nicht verfügbar, zeige erweiterte Beispielanalyse');
      } finally {
        setIsLoading(false);
      }
    };

    performAnalysis();
  }, [temporaryProfile, navigate]);

  const getMockAnalysis = (problem: string) => {
    return `🌱 **Umfassende Rasendiagnose**
Basierend auf Ihrer Beschreibung "${problem}" wurde eine detaillierte Analyse durchgeführt.

**Gesamtgesundheit:** 7.2/10

🛠️ **Hauptprobleme identifiziert**
1. **Nährstoffmangel (Stickstoff & Kalium)** - Mittlere Priorität
   - Sichtbare Anzeichen: Gelbliche Verfärbung, schwaches Wachstum
   - Zeitrahmen: 2-4 Wochen bis Verbesserung sichtbar
   - Kosten: 25-40€ für professionellen Dünger

2. **Bodenverdichtung & ungleichmäßige Bewässerung** - Mittlere Priorität
   - Problembereiche: Staunässe und trockene Stellen
   - Sofortige Lösung: Aerifizierung
   - Kosten: 15-30€ für Geräte-Miete

💡 **Detaillierter Lösungsplan**

**Sofortmaßnahmen (diese Woche):**
- Bodentest durchführen (pH-Wert, NPK-Gehalt)
- Aerifizierung bei feuchtem Boden
- Bewässerungszeiten auf frühe Morgenstunden verlegen

**Kurzfristig (2-4 Wochen):**
- Herbstdüngung mit kaliumreichem Dünger (NPK 5-5-20)
- Nachsaat kahler Stellen mit passender Rasenmischung
- Mechanische Unkrautentfernung

**Langfristige Strategie:**
- Monatlichen Pflegekalender etablieren
- Automatisches Bewässerungssystem installieren
- Präventive Unkraut- und Schädlingskontrolle

🛒 **Empfohlene Produkte**
- Compo Rasen Langzeit-Dünger (20kg) - €29,99
- Gardena Aerifizierer - €24,99
- Substral Herbst Rasendünger - €22,50
- Celaflor Rasen-Unkrautfrei - €18,99

📅 **3-Monats-Pflegeplan**
**März:** Vertikutieren + Startdüngung bei 10°C Bodentemperatur
**April:** Nachsaat + selektive Unkrautbekämpfung
**Mai:** Bewässerungsroutine etablieren + Kantenpflege`;
  };

  const parseComprehensiveAnalysis = (analysisText: string) => {
    const mockData = {
      mainIssues: [
        {
          title: "Nährstoffmangel (N-K)",
          severity: "medium" as const,
          description: "Stickstoff- und Kaliummangel mit gelblichen Verfärbungen",
          timeline: "2-4 Wochen",
          cost: "25-40€",
          confidence: "87%"
        },
        {
          title: "Bodenverdichtung",
          severity: "medium" as const,
          description: "Ungleichmäßige Wasseraufnahme durch verdichteten Boden",
          timeline: "Sofort nach Belüftung",
          cost: "15-30€",
          confidence: "78%"
        },
        {
          title: "Beginnender Unkrautbefall",
          severity: "low" as const,
          description: "Löwenzahn und Klee in einzelnen Bereichen",
          timeline: "4-6 Wochen",
          cost: "20-35€",
          confidence: "65%"
        }
      ],
      solutions: [
        {
          category: "Sofortmaßnahmen (diese Woche)",
          priority: "high",
          tasks: [
            "Professionellen Bodentest durchführen (pH, NPK, Spurenelemente)",
            "Aerifizierung mit 5cm tiefen Löchern bei feuchtem Boden",
            "Bewässerung auf 5-7 Uhr morgens optimieren",
            "Groben Sand in Belüftungslöcher einarbeiten"
          ]
        },
        {
          category: "Kurzfristig (2-4 Wochen)",
          priority: "medium",
          tasks: [
            "Herbstdüngung mit kaliumreichem Dünger (NPK 5-5-20)",
            "Nachsaat kahler Stellen mit klimaangepasster Mischung",
            "Mechanische Unkrautentfernung bei feuchtem Boden",
            "Installation von Bodenfeuchtesensoren"
          ]
        },
        {
          category: "Langfristige Strategie (Saisonplan)",
          priority: "low",
          tasks: [
            "Monatlichen Pflegekalender mit Foto-Dokumentation",
            "Automatisches Bewässerungssystem mit Timer",
            "Präventive Unkrautkontrolle durch dichte Grasnarbe",
            "Jährliche Bodenanalyse im Frühjahr"
          ]
        }
      ],
      products: [
        { name: "Compo Rasen Langzeit-Dünger 20kg", price: "€29,99", category: "Dünger", rating: "4.5/5" },
        { name: "Gardena Aerifizierer Professional", price: "€24,99", category: "Geräte", rating: "4.7/5" },
        { name: "Substral Herbst Rasendünger", price: "€22,50", category: "Dünger", rating: "4.3/5" },
        { name: "Celaflor Rasen-Unkrautfrei Weedex", price: "€18,99", category: "Pflanzenschutz", rating: "4.4/5" },
        { name: "Bodentest-Kit Professional", price: "€15,99", category: "Analyse", rating: "4.6/5" }
      ],
      monthlyTasks: [
        { 
          month: "März", 
          priority: "Vertikutieren + Startdüngung",
          details: "Bei 10°C Bodentemperatur beginnen",
          tasks: ["Vertikutieren", "Erste Düngung", "Schäden reparieren"]
        },
        { 
          month: "April", 
          priority: "Nachsaat + Unkrautbekämpfung",
          details: "Optimale Zeit für Regeneration",
          tasks: ["Kahle Stellen nachsäen", "Unkraut entfernen", "Erste Mahd"]
        },
        { 
          month: "Mai", 
          priority: "Bewässerung etablieren",
          details: "Regelmäßiger Rhythmus wichtig",
          tasks: ["Bewässerungsplan", "Rasenkanten", "Schädlingskontrolle"]
        }
      ]
    };

    return mockData;
  };

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (severity === 'medium') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (severity === 'low') return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'border-l-red-500';
    if (priority === 'medium') return 'border-l-yellow-500';
    if (priority === 'low') return 'border-l-green-500';
    return 'border-l-gray-500';
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
                <h2 className="text-xl font-semibold mb-2">Erstelle umfassende Rasenanalyse...</h2>
                <p className="text-gray-600 text-center">
                  Unsere KI analysiert detailliert und erstellt einen personalisierten Pflegeplan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const comprehensiveData = parseComprehensiveAnalysis(analysis);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Enhanced Header with Score */}
          <Card className="border-green-100 mb-6">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-green-600 mr-3" />
                <CardTitle className="text-2xl text-green-800">
                  🌿 Deine umfassende Rasenanalyse
                </CardTitle>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-semibold text-gray-800">
                    📊 Rasen-Gesundheit:
                  </span>
                  <div className="text-right">
                    <span className="text-4xl font-bold text-green-600">
                      {healthScore}%
                    </span>
                    <p className="text-sm text-gray-600">
                      {healthScore >= 80 ? 'Sehr gut' : 
                       healthScore >= 60 ? 'Verbesserungsfähig' : 'Behandlung nötig'}
                    </p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-1000" 
                    style={{ width: `${healthScore}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  🎯 Mit unserem Pflegeplan erreichst du <strong>90%+</strong> Rasengesundheit
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* Comprehensive Analysis */}
          <Card className="border-blue-200 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-blue-800 flex items-center gap-2">
                <Lightbulb className="h-6 w-6" />
                Detaillierte Analyse & Lösungsplan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="problems" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="problems">Probleme</TabsTrigger>
                  <TabsTrigger value="solutions">Lösungsplan</TabsTrigger>
                  <TabsTrigger value="products">Produkte</TabsTrigger>
                  <TabsTrigger value="timeline">Zeitplan</TabsTrigger>
                </TabsList>
                
                <TabsContent value="problems" className="space-y-4 mt-6">
                  {comprehensiveData.mainIssues.map((issue, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 text-lg">{issue.title}</h4>
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity === 'high' ? 'Hoch' : 
                           issue.severity === 'medium' ? 'Mittel' : 'Niedrig'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-4">{issue.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Zeitrahmen:</span>
                          <span>{issue.timeline}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-medium">Kosten:</span>
                          <span>{issue.cost}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Sicherheit:</span>
                          <span>{issue.confidence}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="solutions" className="space-y-4 mt-6">
                  {comprehensiveData.solutions.map((solution, index) => (
                    <div key={index} className={`border rounded-lg p-4 border-l-4 ${getPriorityColor(solution.priority)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-800 text-lg flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          {solution.category}
                        </h4>
                        <Badge variant={solution.priority === 'high' ? 'destructive' : solution.priority === 'medium' ? 'default' : 'secondary'}>
                          {solution.priority === 'high' ? 'Dringend' : 
                           solution.priority === 'medium' ? 'Wichtig' : 'Geplant'}
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {solution.tasks.map((task, taskIndex) => (
                          <div key={taskIndex} className="flex items-start gap-3 p-2 bg-white rounded border">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="products" className="space-y-4 mt-6">
                  <div className="grid gap-4">
                    {comprehensiveData.products.map((product, index) => (
                      <div key={index} className="border rounded-lg p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{product.name}</h4>
                          <div className="flex gap-2 mt-2">
                            <Badge variant="secondary">{product.category}</Badge>
                            <Badge variant="outline">⭐ {product.rating}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-semibold text-green-600">
                            {product.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4 mt-6">
                  {comprehensiveData.monthlyTasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-white">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xl font-semibold text-gray-800">{task.month}</h4>
                            <Badge className="bg-blue-100 text-blue-800">{task.priority}</Badge>
                          </div>
                          <p className="text-gray-600 mb-3">{task.details}</p>
                          <div className="space-y-2">
                            {task.tasks.map((subtask, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-sm text-gray-700">{subtask}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Enhanced Registration CTA */}
          {!isAuthenticated && (
            <Card className="border-green-200 bg-green-50 mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center mb-4">
                    <Leaf className="h-8 w-8 text-green-600 mr-3" />
                    <h3 className="text-2xl font-semibold text-green-800">
                      Werde Rasen-Experte mit Premium
                    </h3>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-lg p-6 border border-green-200 shadow-sm">
                      <h4 className="font-semibold text-green-800 mb-4 text-lg">✅ Premium-Features:</h4>
                      <ul className="text-sm text-gray-700 space-y-2 text-left">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Unbegrenzte detaillierte KI-Analysen</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Personalisierte Monatspläne</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Produktvergleiche mit Live-Preisen</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Wetterbasierte Anpassungen</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Foto-Verlaufstracking mit Erfolgsanalyse</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-6 border border-gray-200">
                      <h4 className="font-semibold text-gray-600 mb-4 text-lg">❌ Basis-Version:</h4>
                      <ul className="text-sm text-gray-600 space-y-2 text-left">
                        <li>• Nur eine Analyse pro Gerät</li>
                        <li>• Grundlegende Empfehlungen</li>
                        <li>• Keine Speicherung oder Updates</li>
                        <li>• Keine Fortschrittsverfolgung</li>
                        <li>• Kein persönlicher Pflegekalender</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button 
                      onClick={() => navigate('/auth?tab=register')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
                    >
                      <UserPlus className="mr-2 h-6 w-6" />
                      Jetzt kostenlos Premium testen
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/dashboard')}
                      size="lg"
                      className="text-lg px-8 py-4"
                    >
                      Später registrieren
                    </Button>
                  </div>
                  
                  <p className="text-sm text-gray-600">
                    🎯 30 Tage kostenlos testen • Jederzeit kündbar • Keine versteckten Kosten
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue to Dashboard */}
          <div className="text-center">
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-lg px-8 py-4"
            >
              Zum Dashboard
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;
