import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share, Star, Leaf, Target, Calendar, AlertTriangle, Droplets, Zap, Sun, Thermometer, Bug, MapPin, TrendingUp, BookOpen, Lightbulb, Crown, Bell, ChevronRight } from 'lucide-react';
import DiseaseDetection from '@/components/DiseaseDetection';
import ProductRecommendations from '@/components/ProductRecommendations';
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
import PremiumPreview from '@/components/conversion/PremiumPreview';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import { useLawn } from '@/context/LawnContext';
import { useRetentionTracking } from '@/hooks/useRetentionTracking';
import { useSubscription } from '@/hooks/useSubscription';
import LawnScoreShareCard from '@/components/LawnScoreShareCard';

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
  const { isPremium, planTier, createCheckout } = useSubscription();
  const [analysisData, setAnalysisData] = useState<AnalysisJobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'journey' | 'details'>('overview');
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [showWelcomeBar, setShowWelcomeBar] = useState(false);
  const [previousScore, setPreviousScore] = useState<number | null>(null);
  const [scoreHistory, setScoreHistory] = useState<{month: string; score: number | null}[]>([]);
  
  const healthScore = analysisData?.result?.score || analysisData?.result?.overall_health || 65;
  const { retentionData, isLoading: retentionLoading, handleSignUpComplete, trackAnalysisFromReminder } = useRetentionTracking(healthScore, jobId);

  // Show premium welcome bar on first visit
  useEffect(() => {
    if (isPremium) {
      const key = `rasenpilot_premium_welcome_${jobId}`;
      if (!sessionStorage.getItem(key)) {
        setShowWelcomeBar(true);
        sessionStorage.setItem(key, '1');
        setTimeout(() => setShowWelcomeBar(false), 3000);
      }
    }
  }, [isPremium, jobId]);

  // Fetch previous score for comparison
  useEffect(() => {
    if (!isPremium || !analysisData) return;
    const fetchPreviousScore = async () => {
      try {
        const { data } = await supabase
          .from('analyses')
          .select('score, created_at')
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (data && data.length > 0) {
          // Build score history for the tracker
          const months = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
          const historyMap: Record<string, number> = {};
          data.forEach(a => {
            const d = new Date(a.created_at);
            const key = months[d.getMonth()];
            if (!historyMap[key] || a.score > historyMap[key]) {
              historyMap[key] = a.score;
            }
          });
          
          const now = new Date();
          const currentMonthIdx = now.getMonth();
          const history: {month: string; score: number | null}[] = [];
          for (let i = 5; i >= 0; i--) {
            const idx = (currentMonthIdx - i + 12) % 12;
            const m = months[idx];
            history.push({ month: m, score: historyMap[m] || null });
          }
          setScoreHistory(history);

          // Find previous score (not from current analysis)
          const currentDate = analysisData.created_at;
          const prev = data.find(a => a.created_at < currentDate);
          if (prev) {
            setPreviousScore(prev.score);
          }
        }
      } catch (e) {
        console.error('Error fetching previous score:', e);
      }
    };
    fetchPreviousScore();
  }, [isPremium, analysisData]);

  useEffect(() => {
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

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
          const jobData = data as unknown as AnalysisJobResult;
          
          // If still processing, poll every 2 seconds
          if (jobData.status === 'processing' || jobData.status === 'pending') {
            if (!cancelled) {
              pollTimer = setTimeout(fetchAnalysisResult, 2000);
            }
            return;
          }
          
          if (jobData.status === 'failed') {
            setError('Die Analyse ist fehlgeschlagen. Bitte versuche es erneut.');
            setIsLoading(false);
            return;
          }

          setAnalysisData(jobData);
          await trackAnalysisFromReminder();
        } else {
          setError('Analyse-Ergebnis nicht gefunden');
        }
      } catch (error) {
        console.error('Error fetching analysis result:', error);
        setError('Fehler beim Laden des Ergebnisses');
      } finally {
        if (!cancelled && !pollTimer) {
          setIsLoading(false);
        }
      }
    };

    fetchAnalysisResult();
    
    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
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
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopiert", {
        description: "Der Link zu Ihrer Analyse wurde in die Zwischenablage kopiert.",
      });
    }
  };

  // Helper: get next month name
  const getNextAnalysisDate = () => {
    const next = new Date();
    next.setMonth(next.getMonth() + 1);
    next.setDate(1);
    return next.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  // Helper: get current month care plan
  const getCurrentMonthCarePlan = () => {
    const month = new Date().getMonth();
    const monthName = new Date().toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
    
    const result = getAnalysisResult();
    const recs = result?.recommendations;
    
    // Try to build from analysis recommendations
    if (recs && Array.isArray(recs) && recs.length >= 3) {
      return {
        title: monthName,
        weeks: [
          { week: 'Woche 1', task: recs[0] || 'Vertikutieren + Kalken' },
          { week: 'Woche 2', task: recs[1] || 'Düngen (Langzeitdünger)' },
          { week: 'Woche 3', task: recs[2] || 'Nachsäen kahle Stellen' },
          { week: 'Woche 4', task: 'Bewässerung optimieren' },
        ]
      };
    }

    // Seasonal defaults
    const plans: Record<number, string[]> = {
      0: ['Rasen schonen', 'Bei Frost nicht betreten', 'Laub entfernen', 'Geräte warten'],
      1: ['Rasen schonen', 'Bei Frost nicht betreten', 'Mäher-Check', 'Dünger bestellen'],
      2: ['Vertikutieren', 'Erste Düngung', 'Nachsäen', 'Bewässerung starten'],
      3: ['Vertikutieren + Kalken', 'Düngen (Langzeitdünger)', 'Nachsäen kahle Stellen', 'Bewässerung optimieren'],
      4: ['Regelmäßig mähen', 'Unkraut entfernen', 'Bewässerung anpassen', 'Rasenkanten schneiden'],
      5: ['Wöchentlich mähen', 'Sommerdüngung', 'Morgens wässern', 'Mähhöhe erhöhen'],
      6: ['Höher mähen (5cm)', 'Morgens wässern', 'Weniger düngen', 'Mulchen'],
      7: ['Höher mähen', 'Regelmäßig wässern', 'Nachsaat vorbereiten', 'Herbstdünger kaufen'],
      8: ['Herbstdüngung', 'Nachsäen', 'Vertikutieren', 'Laub entfernen'],
      9: ['Laub entfernen', 'Letzte Mahd', 'Herbstdünger', 'Bewässerung reduzieren'],
      10: ['Laub entfernen', 'Nicht mehr düngen', 'Rasen schonen', 'Mäher einwintern'],
      11: ['Rasen ruhen lassen', 'Bei Frost nicht betreten', 'Geräte warten', 'Frühling planen'],
    };

    const tasks = plans[month] || plans[3];
    return {
      title: monthName,
      weeks: tasks.map((task, i) => ({ week: `Woche ${i + 1}`, task }))
    };
  };

  const getSeasonalHint = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 3 && month <= 5) return "Jetzt ist der perfekte Zeitpunkt für die erste Düngung.";
    if (month >= 6 && month <= 8) return "Achte auf gleichmäßiges Gießen in den heißen Wochen.";
    if (month >= 9 && month <= 11) return "Nachsaat hilft, den Rasen für das nächste Frühjahr zu stärken.";
    return "Schonend behandeln – bitte wenig betreten.";
  };

  const getBriefAssessment = (score: number) => {
    if (score >= 80) return "Dein Rasen ist in ausgezeichnetem Zustand – weiter so!";
    if (score >= 60) return "Dein Rasen ist in Ordnung, aber es gibt noch Luft nach oben – mit der richtigen Pflege kannst du ihn deutlich verbessern.";
    return "Dein Rasen braucht dringend Aufmerksamkeit, aber mit dem richtigen Plan wird er wieder gesund.";
  };

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
    return {
      density: Math.max(30, healthScore - 20 + Math.random() * 20),
      sunlight: Math.max(40, healthScore - 10 + Math.random() * 30),
      moisture: Math.max(20, healthScore - 30 + Math.random() * 40),
      soil: Math.max(35, healthScore - 15 + Math.random() * 25)
    };
  };

  const subScores = getSubScores();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-12 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-green-600 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Lade Analyse-Ergebnis...</h2>
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
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{error}</h2>
            <Button onClick={handleStartAgain} className="bg-green-600 hover:bg-green-700">
              Neue Analyse starten
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // PREMIUM USER LAYOUT — linear, no tabs
  // ============================================
  if (isPremium) {
    const carePlan = getCurrentMonthCarePlan();
    const scoreDiff = previousScore !== null ? healthScore - previousScore : null;
    const isPro = planTier === 'pro';

    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <SEO 
          title={`Dein Rasen-Score: ${healthScore}/100 🌱 | RasenPilot`}
          description={getBriefAssessment(healthScore)}
          keywords="Rasenanalyse Ergebnis, Rasen Score, Rasenpflege, Pflegeplan"
          canonical={`https://www.rasenpilot.com/analysis-result/${jobId}`}
        />
        <MainNavigation />

        {/* 1. Premium Welcome Bar */}
        {showWelcomeBar && (
          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white text-center py-2.5 px-4 text-sm font-medium animate-in slide-in-from-top duration-300">
            👑 Premium Analyse — alle Details freigeschaltet
          </div>
        )}

        <div className="container mx-auto px-4 py-6 max-w-md">

          {/* 2. Score Card with comparison */}
          <div className="mb-6">
            <Card className="bg-white shadow-lg border border-green-100">
              <CardHeader className="text-center pb-4">
                <h1 className="text-2xl font-bold text-green-800 mb-3">
                  👉 Dein Rasen-Score: {healthScore}/100 🌱
                </h1>
                
                {retentionData.isNewHighscore && (
                  <div className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold mb-3 inline-block text-sm">
                    🎉 Neuer Highscore!
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

                {/* Score comparison */}
                {scoreDiff !== null && (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold mb-2 ${
                    scoreDiff > 0 ? 'bg-green-100 text-green-700' : 
                    scoreDiff < 0 ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <TrendingUp className="h-4 w-4" />
                    {scoreDiff > 0 ? `+${scoreDiff} Punkte seit letzter Analyse` :
                     scoreDiff < 0 ? `${scoreDiff} Punkte seit letzter Analyse` :
                     'Gleicher Score wie letzte Analyse'}
                  </div>
                )}
                
                <p className="text-gray-700 text-sm leading-relaxed">
                  {getBriefAssessment(healthScore)}
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* 3. Share Card — emotional peak */}
          <div className="mb-6">
            <LawnScoreShareCard 
              score={healthScore} 
              analysisDate={analysisData?.created_at}
              jobId={jobId}
            />
          </div>

          {/* 4. Aktionsplan — Monthly Care Calendar */}
          <div className="mb-6">
            <Card className="bg-white shadow-lg border border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                  📅 Dein Pflegeplan für {carePlan.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {carePlan.weeks.map((w, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-green-700 uppercase">{w.week}</span>
                        <p className="text-sm font-medium text-gray-800">{w.task}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4 border-green-200 text-green-700 hover:bg-green-50"
                  onClick={() => navigate('/care-calendar')}
                >
                  Vollständigen Kalender öffnen <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 5. Krankheiten & Schädlinge */}
          <div className="mb-6">
            <DiseaseDetection analysisResult={getAnalysisResult()} />
          </div>

          {/* 6. Detail-Scores */}
          <div className="mb-6">
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
                       "Dein Rasen bekommt ausreichend Licht."}
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
                      {subScores.moisture < 50 ? "Der Boden wirkt trocken. Morgens oder abends gießen." :
                       subScores.moisture < 80 ? "Feuchtigkeitsgehalt ist okay, kann optimiert werden." :
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
                      {subScores.soil < 60 ? "Die Nährstoffversorgung ist mittelmäßig. Düngung steigert die Vitalität." :
                       subScores.soil < 80 ? "Gute Bodenqualität, kleine Verbesserungen möglich." :
                       "Ausgezeichnete Bodenqualität!"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 7. Empfohlene Produkte */}
          <div className="mb-6">
            <ProductRecommendations analysisResult={getAnalysisResult()} />
          </div>

          {/* 8. Fortschritts-Tracker */}
          <div className="mb-6">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  📊 Dein Rasen-Verlauf
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between gap-1 mb-4 h-20">
                  {scoreHistory.map((item, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      {item.score !== null ? (
                        <div 
                          className="w-full bg-green-500 rounded-t-sm min-h-[4px] transition-all"
                          style={{ height: `${(item.score / 100) * 64}px` }}
                        />
                      ) : (
                        <div className="w-full bg-gray-100 rounded-t-sm h-4" />
                      )}
                      <span className="text-[10px] text-gray-500 mt-1">{item.month}</span>
                      <span className="text-[10px] font-semibold text-gray-700">
                        {item.score !== null ? item.score : '--'}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nächste Analyse empfohlen:</p>
                    <p className="text-sm font-semibold text-gray-800">{getNextAnalysisDate()}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-200 text-green-700 hover:bg-green-50"
                    onClick={() => toast.success('Erinnerung gesetzt! Wir melden uns.')}
                  >
                    <Bell className="h-4 w-4 mr-1" /> Erinnerung
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 9. Pflegeplan Download */}
          <div className="mb-6">
            <Button 
              onClick={handleDownloadPlan}
              className="w-full bg-green-600 hover:bg-green-700 h-12"
            >
              <Download className="h-5 w-5 mr-2" />
              Pflegeplan herunterladen
            </Button>
          </div>

          {/* 10. Pro Upsell — only for Premium users (not Pro) */}
          {!isPro && (
            <div className="mb-6">
              <Card className="bg-gradient-to-br from-amber-50 to-white border-2 border-amber-300">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">⭐</span>
                    <h3 className="font-bold text-gray-900">Noch mehr mit Rasenpilot Pro</h3>
                  </div>
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      3 Rasenflächen verwalten
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      Monatlicher Experten-Check
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                      Prioritäts-Support
                    </li>
                  </ul>
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold"
                    onClick={() => navigate('/subscription?ref=analysis-pro-upsell')}
                  >
                    Pro 7 Tage testen → <span className="text-xs font-normal ml-1 opacity-90">19,99€/Monat</span>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Next Analysis CTA */}
          <div className="text-center mb-8">
            <Button 
              onClick={handleStartAgain}
              variant="outline" 
              className="w-full h-12 border-green-200 hover:bg-green-50"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Nächste Analyse: {getNextAnalysisDate()} →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // FREE USER LAYOUT — tabs, upsell
  // ============================================
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

        {/* Share Card */}
        <div className="mb-8">
          <LawnScoreShareCard 
            score={healthScore} 
            analysisDate={analysisData?.created_at}
            jobId={jobId}
          />
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
            {/* Basic Info */}
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

            {/* Premium Preview */}
            <div className="mb-8">
              {!showEmailCapture ? (
                <PremiumPreview 
                  score={healthScore}
                  sampleProblems={getProblems().slice(0, 2).map(p => typeof p === 'string' ? p : p.type || p.description || 'Rasen-Problem erkannt')}
                  onUpgrade={() => navigate('/subscription?ref=analysis-result')}
                />
              ) : (
                <PostAnalysisConversion 
                  score={healthScore}
                  userId={profile?.id}
                  onEmailCaptured={(email) => console.log('Email captured:', email)}
                  onRegistrationComplete={() => handleSignUpComplete()}
                />
              )}
            </div>

            {/* CTA */}
            <div className="text-center mt-8">
              <Button 
                onClick={() => navigate('/subscription?ref=analysis-result')}
                variant="outline" 
                className="w-full h-12 border-green-200 hover:bg-green-50"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Premium für weitere Analysen
              </Button>
            </div>
          </div>
        )}

        {/* Journey Tab */}
        {activeTab === 'journey' && (
          <div className="mb-8">
            <PremiumPreview 
              score={healthScore}
              sampleProblems={getProblems().slice(0, 2).map(p => typeof p === 'string' ? p : p.type || p.description || 'Rasen-Problem erkannt')}
              onUpgrade={() => navigate('/subscription?ref=analysis-journey')}
            />
          </div>
        )}

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div className="mb-8">
            <PremiumPreview 
              score={healthScore}
              sampleProblems={getProblems().slice(0, 2).map(p => typeof p === 'string' ? p : p.type || p.description || 'Rasen-Problem erkannt')}
              onUpgrade={() => navigate('/subscription?ref=analysis-details')}
            />
          </div>
        )}
      </div>

      {/* Sticky Upsell Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-green-700 to-green-600 text-white shadow-2xl border-t-2 border-green-400/30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xl flex-shrink-0">🌿</span>
            <p className="text-sm md:text-base font-medium truncate">
              <span className="hidden sm:inline">Premium: Pflegekalender, Krankheitserkennung & Verlauf</span>
              <span className="sm:hidden">Premium: Pflegekalender & mehr</span>
            </p>
          </div>
          <Button
            onClick={() => navigate('/subscription?ref=analysis-upsell-banner')}
            size="sm"
            className="flex-shrink-0 bg-white text-green-700 hover:bg-green-50 font-bold shadow-lg"
          >
            Jetzt upgraden →
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;
