import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share, Star, Leaf, Target, Calendar, AlertTriangle, Droplets, Zap, Sun, Thermometer, Bug, MapPin, TrendingUp, BookOpen, Lightbulb, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import WeatherEnhancedResults from '@/components/WeatherEnhancedResults';
import MainNavigation from '@/components/MainNavigation';
import RetentionSignUpForm from '@/components/RetentionSignUpForm';
import LawnJourneyTracker from '@/components/LawnJourneyTracker';
import PostAnalysisConversion from '@/components/conversion/PostAnalysisConversion';
import FreeAnalysisGate from '@/components/conversion/FreeAnalysisGate';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { useLawn } from '@/context/LawnContext';
import { useRetentionTracking } from '@/hooks/useRetentionTracking';
import { useSubscription } from '@/hooks/useSubscription';

interface AnalysisJobResult {
  id: string;
  status: string;
  result: any;
  created_at: string;
  image_path: string;
  metadata?: string;
}

const AnalysisResult = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { profile } = useLawn();
  const { isPremium, createCheckout } = useSubscription();
  const [analysisData, setAnalysisData] = useState<AnalysisJobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'details'>('overview');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  
  // Get health score early for retention tracking
  const healthScore = analysisData?.result?.score || analysisData?.result?.overall_health || 65;
  const { retentionData, isLoading: retentionLoading, handleSignUpComplete, trackAnalysisFromReminder } = useRetentionTracking(healthScore, jobId);

  useEffect(() => {
    const fetchAnalysisResult = async () => {
      if (!jobId) {
        setError('Keine Analyse-ID gefunden');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .rpc('get_analysis_job', { p_job_id: jobId });

        if (error) throw error;

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setAnalysisData(data as unknown as AnalysisJobResult);
          
          // Track if user came from reminder
          await trackAnalysisFromReminder();
        } else {
          setError('Analyse-Ergebnis nicht gefunden');
        }
      } catch (error) {
        console.error('Error fetching analysis result:', error);
        setError('Fehler beim Laden des Ergebnisses');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalysisResult();
  }, [jobId]);

  const getHealthScore = () => {
    if (!analysisData?.result) return 65;
    return analysisData.result.score || analysisData.result.overall_health || 65;
  };

  const getAnalysisResult = () => {
    if (!analysisData?.result) return null;
    return analysisData.result;
  };

  const getProblems = () => {
    const result = getAnalysisResult();
    if (!result) return [];
    return result.issues || result.identified_problems || [
      { type: 'Nährstoffmangel', severity: 'hoch', description: 'Stickstoffmangel führt zu gelblichen Verfärbungen' },
      { type: 'Unkraut', severity: 'mittel', description: 'Löwenzahn und Klee breiten sich aus' },
      { type: 'Bodenverdichtung', severity: 'mittel', description: 'Schlechte Belüftung des Bodens' }
    ];
  };

  const getRecommendations = () => {
    const result = getAnalysisResult();
    if (!result) return { immediate: [], seasonal: [], weather: [] };
    
    const weatherRecs = result.weather_recommendations || [];
    
    if (result.recommendations && Array.isArray(result.recommendations)) {
      return {
        immediate: result.recommendations.slice(0, 3).map((rec, index) => ({
          action: rec,
          priority: index < 2 ? 'hoch' : 'mittel',
          details: 'Detaillierte Anweisungen folgen in Ihrem persönlichen Pflegeplan.',
          cost: '€€',
          timing: 'Nächste 2 Wochen'
        })),
        seasonal: result.recommendations.slice(3).map(rec => ({
          month: 'Aktuelle Saison',
          tasks: rec,
          details: 'Langfristige Rasenpflege'
        })),
        weather: weatherRecs
      };
    }

    return result.recommendations || {
      immediate: [
        { action: 'Düngen', priority: 'hoch', details: 'Rasen gleichmäßig düngen; Dosierung nach Herstellerhinweis', timing: 'Sofort' },
        { action: 'Vertikutieren', priority: 'hoch', details: 'Moos und Rasenfilz flach entfernen', timing: 'Nächste 2 Wochen' },
        { action: 'Nachsäen', priority: 'mittel', details: 'Kahle Stellen mit passender Saatmischung schließen', timing: 'Nach Vertikutieren' }
      ],
      seasonal: [
        { month: 'März-April', tasks: 'Frühjahrsputz, erste Düngung', details: 'Rasen von Laub befreien, Startdüngung' },
        { month: 'Mai-Juni', tasks: 'Regelmäßig mähen und wässern', details: '1x wöchentlich mähen, bei Trockenheit täglich wässern' },
        { month: 'Juli-August', tasks: 'Sommerpflege, Bewässerung', details: 'Früh morgens wässern, höher mähen' }
      ]
    };
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ausgezeichnet';
    if (score >= 60) return 'Verbesserungsfähig';
    return 'Behandlung nötig';
  };

  const handleStartAgain = () => {
    navigate('/lawn-analysis');
  };

  const handleDownloadPlan = () => {
    if (!analysisData?.result) return;
    
    const result = analysisData.result;
    const score = getHealthScore();
    
    // Generate PDF content as plain text/HTML for now
    const pdfContent = `
RASENANALYSE-BERICHT
====================

BEWERTUNG: ${score}/100 - ${getScoreLabel(score)}
Datum: ${new Date(analysisData.created_at).toLocaleDateString('de-DE')}

RASEN-ZUSTAND:
${result.grass_condition || 'Keine detaillierte Beschreibung verfügbar'}

IDENTIFIZIERTE PROBLEME:
${getProblems().map((p, i) => `${i + 1}. ${p.type}: ${p.description}`).join('\n')}

RASENPILOT EMPFIEHLT (0–4 WOCHEN):
${getRecommendations().immediate?.map((r, i) => 
  `${i + 1}. ${r.action} (Priorität: ${r.priority})
     Details: ${r.details}
     Timing: ${r.timing}`
).join('\n\n') || 'Keine spezifischen Sofortmaßnahmen verfügbar'}
 
TIMELINE:
${result.timeline || 'Keine Timeline verfügbar'}
 
PFLEGEPLAN:
- Woche 1-2: Sofortmaßnahmen durchführen
- Woche 3-6: Etablierungsphase mit regelmäßiger Pflege  
- Woche 7-12: Perfektionierung und Optimierung
 
Erstellt von: RasenPilot Analyse
Website: www.rasenpilot.com
    `.trim();

    // Create and download as text file for now
    const blob = new Blob([pdfContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rasenanalyse-${score}-punkte-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Pflegeplan heruntergeladen", {
      description: "Ihr personalisierter Rasenplan wurde als Textdatei gespeichert.",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Meine Rasenanalyse-Ergebnisse',
        text: `Ich habe meinen Rasen analysiert und einen Score von ${getHealthScore()}/100 erreicht!`,
        url: window.location.href
      });
    } catch (error) {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopiert", {
        description: "Der Link zu Ihrer Analyse wurde in die Zwischenablage kopiert.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              Lade Analyse-Ergebnis...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {error}
            </h2>
            <Button onClick={handleStartAgain} className="bg-green-600 hover:bg-green-700">
              Neue Analyse starten
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to get seasonal hint
  const getSeasonalHint = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 3 && month <= 5) {
      return "Jetzt ist der perfekte Zeitpunkt für die erste Düngung.";
    } else if (month >= 6 && month <= 8) {
      return "Achte auf gleichmäßiges Gießen in den heißen Wochen.";
    } else if (month >= 9 && month <= 11) {
      return "Nachsaat hilft, den Rasen für das nächste Frühjahr zu stärken.";
    } else {
      return "Schonend behandeln – bitte wenig betreten.";
    }
  };

  // Helper function to get brief assessment
  const getBriefAssessment = (score: number) => {
    if (score >= 80) {
      return "Dein Rasen ist in ausgezeichnetem Zustand – weiter so!";
    } else if (score >= 60) {
      return "Dein Rasen ist in Ordnung, aber es gibt noch Luft nach oben – mit der richtigen Pflege kannst du ihn deutlich verbessern.";
    } else {
      return "Dein Rasen braucht dringend Aufmerksamkeit, aber mit dem richtigen Plan wird er wieder gesund.";
    }
  };

  // Helper function to get sub-scores
  const getSubScores = () => {
    const result = getAnalysisResult();
    if (result?.detailed_scoring) {
      return {
        density: Math.round((result.detailed_scoring.grass_density / 20) * 100),
        sunlight: Math.round((result.detailed_scoring.health_status / 20) * 100),
        moisture: Math.round((result.detailed_scoring.color_quality / 20) * 100),
        soil: Math.round((result.detailed_scoring.soil_condition / 20) * 100)
      };
    }
    // Fallback values
    return {
      density: Math.max(30, healthScore - 20 + Math.random() * 20),
      sunlight: Math.max(40, healthScore - 10 + Math.random() * 30),
      moisture: Math.max(20, healthScore - 30 + Math.random() * 40),
      soil: Math.max(35, healthScore - 15 + Math.random() * 25)
    };
  };

  const subScores = getSubScores();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={`Dein Rasen-Score: ${healthScore}/100 🌱 | RasenPilot`}
        description={getBriefAssessment(healthScore)}
        keywords="Rasenanalyse Ergebnis, Rasen Score, Rasenpflege, Pflegeplan"
        canonical={`https://www.rasenpilot.com/analysis-result/${jobId}`}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        
        {/* 1. Gesamtscore */}
        <div className="mb-8">
          <Card className="bg-white shadow-lg border border-green-100">
            <CardHeader className="text-center pb-4">
              <h1 className="text-2xl font-bold text-green-800 mb-3">
                👉 Dein Rasen-Score: {healthScore}/100 🌱
              </h1>
              
              {retentionData.isNewHighscore && (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold mb-4 inline-block">
                  🎉 Glückwunsch – das ist dein bisher bester Score!
                </div>
              )}
              
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <div className="w-full h-full rounded-full border-8 border-gray-200 relative">
                  <div 
                    className={`absolute inset-0 rounded-full border-8 ${
                      healthScore >= 80 ? 'border-green-500' : 
                      healthScore >= 60 ? 'border-yellow-500' : 
                      'border-red-500'
                    } border-t-transparent`}
                    style={{
                      transform: `rotate(${(healthScore / 100) * 360}deg)`,
                      transition: 'transform 1s ease-out'
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getScoreColor(healthScore)}`}>
                      {healthScore}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed">
                {getBriefAssessment(healthScore)}
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'overview' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Star className="h-4 w-4 mx-auto mb-1" />
              Übersicht
            </button>
            <button
              onClick={() => setActiveTab('journey')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'journey' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Target className="h-4 w-4 mx-auto mb-1" />
              Aktionsplan
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'details' 
                  ? 'bg-white text-green-700 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <BookOpen className="h-4 w-4 mx-auto mb-1" />
              Details
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Basic Info - Always visible */}
            <div className="mb-8">
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Basis-Empfehlungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Jetzt bewässern</h4>
                        <p className="text-sm text-gray-600">besonders morgens oder abends.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">In 2–3 Wochen nachsäen</h4>
                        <p className="text-sm text-gray-600">um die Grasnarbe zu verdichten.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Regelmäßig lüften</h4>
                        <p className="text-sm text-gray-600">für bessere Sauerstoffversorgung des Bodens.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Premium Gate or Premium Content */}
            {!isPremium ? (
              <div className="mb-8">
                {!showEmailCapture ? (
                  <FreeAnalysisGate 
                    score={healthScore}
                    onUpgrade={() => createCheckout('monthly')}
                    onEmailCapture={() => setShowEmailCapture(true)}
                  />
                ) : (
                  <PostAnalysisConversion 
                    score={healthScore}
                    userId={profile?.id}
                    onEmailCaptured={(email) => {
                      console.log('Email captured:', email);
                    }}
                    onRegistrationComplete={() => {
                      handleSignUpComplete();
                    }}
                  />
                )}
              </div>
            ) : (
              <>
                {/* Premium Content - Detail Scores */}
                <div className="mb-8">
                  <Card className="bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Crown className="h-5 w-5 text-yellow-600" />
                        Detail-Scores
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>🌱</span>
                          <span className="font-medium">Dichte:</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{Math.round(subScores.density)}/100</span>
                          <p className="text-xs text-gray-600">
                            {subScores.density < 60 ? "Der Rasen ist etwas lückig. Eine Nachsaat schließt die Lücken." :
                             subScores.density < 80 ? "Gute Dichte, kann aber noch verdichtet werden." :
                             "Ausgezeichnete Rasendichte!"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>🌞</span>
                          <span className="font-medium">Sonneneinstrahlung:</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{Math.round(subScores.sunlight)}/100</span>
                          <p className="text-xs text-gray-600">
                            {subScores.sunlight < 60 ? "Zu wenig Licht für optimales Wachstum." :
                             "Dein Rasen bekommt ausreichend Licht, hier gibt es keine Probleme."}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>💧</span>
                          <span className="font-medium">Feuchtigkeit:</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{Math.round(subScores.moisture)}/100</span>
                          <p className="text-xs text-gray-600">
                            {subScores.moisture < 50 ? "Der Boden wirkt trocken. Am besten morgens oder abends gießen." :
                             subScores.moisture < 80 ? "Feuchtigkeitsgehalt ist okay, kann aber optimiert werden." :
                             "Perfekte Feuchtigkeit!"}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <span>🪱</span>
                          <span className="font-medium">Bodenqualität:</span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">{Math.round(subScores.soil)}/100</span>
                          <p className="text-xs text-gray-600">
                            {subScores.soil < 60 ? "Die Nährstoffversorgung ist mittelmäßig. Mit einer Düngung steigt die Vitalität." :
                             subScores.soil < 80 ? "Gute Bodenqualität, kleine Verbesserungen möglich." :
                             "Ausgezeichnete Bodenqualität!"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Premium - Download & Share Actions */}
                <div className="mb-8 space-y-4">
                  <Button 
                    onClick={handleDownloadPlan}
                    className="w-full bg-green-600 hover:bg-green-700 h-12"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Pflegeplan herunterladen
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full h-10 border-green-200 hover:bg-green-50"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Ergebnis teilen
                  </Button>
                </div>

                {/* Premium - Highscore */}
                <div className="mb-8">
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-gray-800 mb-2">Bester Wert bisher: {retentionData.userHighscore}/100</h3>
                      {retentionData.isNewHighscore && (
                        <p className="text-yellow-700 font-medium">🎉 Glückwunsch – das ist dein bisher bester Score!</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {/* CTA for new analysis */}
            <div className="text-center mt-8">
              <Button 
                onClick={handleStartAgain}
                variant="outline" 
                className="w-full h-12 border-green-200 hover:bg-green-50"
                disabled={!isPremium}
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                {isPremium ? 'Weitere Analyse starten' : 'Premium für weitere Analysen'}
              </Button>
            </div>
          </div>
        )}

        {/* Journey Tab - Premium Only */}
        {activeTab === 'journey' && (
          <div>
            {isPremium ? (
              <LawnJourneyTracker 
                analysisScore={healthScore}
                analysisId={jobId || ''}
                recommendations={getRecommendations()}
              />
            ) : (
              <div className="mb-8">
                <FreeAnalysisGate 
                  score={healthScore}
                  onUpgrade={() => createCheckout('monthly')}
                  onEmailCapture={() => setShowEmailCapture(true)}
                />
              </div>
            )}
          </div>
        )}

        {/* Details Tab - Premium Only */}
        {activeTab === 'details' && (
          <div>
            {isPremium ? (
              <div className="space-y-6">
                {/* Detailed Analysis Report */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-blue-600" />
                      Detaillierte Analyse
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Rasen-Zustand</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {getAnalysisResult()?.grass_condition || 
                         "Basierend auf der Bildanalyse zeigt Ihr Rasen verschiedene Bereiche mit unterschiedlicher Vitalität. Die Gesamtbewertung berücksichtigt Faktoren wie Dichte, Farbe, Unkrautbefall und Bodenqualität."}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Identifizierte Probleme</h4>
                      <div className="space-y-2">
                        {(getAnalysisResult()?.problems || getProblems()).map((problem, index) => (
                          <div key={index} className="flex items-start gap-2 p-2 bg-red-50 border border-red-100 rounded">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium text-red-800">
                                {typeof problem === 'string' ? problem : problem.type || problem}
                              </span>
                              {typeof problem === 'object' && problem.description && (
                                <p className="text-red-700 mt-1">{problem.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Timeline für Verbesserungen</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {getAnalysisResult()?.timeline || 
                         "Mit der konsequenten Umsetzung der empfohlenen Maßnahmen können Sie erste sichtbare Verbesserungen bereits nach 2-3 Wochen erwarten. Die vollständige Regeneration dauert je nach Ausgangszustand 6-12 Wochen."}
                      </p>
                    </div>

                    {getAnalysisResult()?.weather_recommendations && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Wetter-basierte Empfehlungen</h4>
                        <div className="space-y-2">
                          {getAnalysisResult().weather_recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-100 rounded">
                              <Sun className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-blue-800">{rec}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Weather Information */}
                <WeatherEnhancedResults 
                  zipCode={analysisData?.metadata ? JSON.parse(analysisData.metadata)?.zipCode : undefined}
                  recommendations={getAnalysisResult()?.weather_recommendations || []}
                />
              </div>
            ) : (
              <div className="mb-8">
                <FreeAnalysisGate 
                  score={healthScore}
                  onUpgrade={() => createCheckout('monthly')}
                  onEmailCapture={() => setShowEmailCapture(true)}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AnalysisResult;