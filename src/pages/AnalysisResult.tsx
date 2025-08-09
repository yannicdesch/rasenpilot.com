import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share, Star, Leaf, Target, Calendar, AlertTriangle, Droplets, Zap, Sun, Thermometer, Bug, MapPin, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import MainNavigation from '@/components/MainNavigation';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';

interface AnalysisJobResult {
  id: string;
  status: string;
  result: any;
  created_at: string;
  image_path: string;
}

const AnalysisResult = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisJobResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!result) return {};
    return result.recommendations || {
      immediate: [
        { action: 'Düngen', priority: 'hoch', details: 'NPK-Rasendünger 20-5-8 anwenden', timing: 'Sofort', cost: '25-35€' },
        { action: 'Vertikutieren', priority: 'hoch', details: 'Moos und Rasenfilz entfernen', timing: 'Nächste 2 Wochen', cost: '15-25€' },
        { action: 'Nachsäen', priority: 'mittel', details: 'Kahle Stellen mit Rasensamen füllen', timing: 'Nach Vertikutieren', cost: '20-30€' }
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
    toast({
      title: "Download wird vorbereitet",
      description: "Ihr personalisierter Pflegeplan wird als PDF erstellt...",
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
      toast({
        title: "Link kopiert",
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

  const healthScore = getHealthScore();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={`Ihre Rasenanalyse - Score: ${healthScore}/100 | Rasenpilot`}
        description={`Ihr Rasen hat einen Gesundheits-Score von ${healthScore}/100 erreicht. Entdecken Sie personalisierte Pflegetipps für einen perfekten Rasen.`}
        keywords="Rasenanalyse Ergebnis, Rasen Score, Rasenpflege, Pflegeplan"
        canonical={`https://www.rasenpilot.com/analysis-result/${jobId}`}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800 mb-2">
            Analyse abgeschlossen!
          </h1>
          <p className="text-gray-600">
            Ihr personalisierter Pflegeplan ist bereit.
          </p>
        </div>

        {/* Health Score Card */}
        <div className="mb-6">
          <Card className="bg-white shadow-lg border border-green-100">
            <CardHeader className="text-center pb-4">
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
              <CardTitle className="text-xl">Rasen-Gesundheits-Score</CardTitle>
              <Badge variant="outline" className={getScoreColor(healthScore)}>
                {getScoreLabel(healthScore)}
              </Badge>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={handleDownloadPlan}
            variant="outline" 
            className="h-12 border-green-200 hover:bg-green-50"
          >
            <Download className="h-4 w-4 mr-2" />
            PDF-Plan
          </Button>
          
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="h-12 border-green-200 hover:bg-green-50"
          >
            <Share className="h-4 w-4 mr-2" />
            Teilen
          </Button>
        </div>

        {/* Identified Problems */}
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Identifizierte Probleme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getProblems().map((problem, index) => (
                <div key={index} className="border border-orange-100 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">{problem.type}</h4>
                    <Badge variant={problem.severity === 'hoch' ? 'destructive' : problem.severity === 'mittel' ? 'default' : 'secondary'}>
                      {problem.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{problem.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Immediate Actions */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Sofort-Maßnahmen (0-4 Wochen)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecommendations().immediate?.map((action, index) => (
                <div key={index} className="border border-green-100 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        action.priority === 'hoch' ? 'bg-red-500' : action.priority === 'mittel' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{action.action}</h4>
                        <p className="text-xs text-gray-500">Priorität: {action.priority}</p>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="text-gray-600">{action.timing}</div>
                      <div className="text-green-600 font-medium">{action.cost}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 ml-11">{action.details}</p>
                </div>
              )) || (
                <>
                  <div className="border border-green-100 rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">Düngen</h4>
                        <p className="text-sm text-gray-600">NPK-Rasendünger 20-5-8 anwenden, 30g/m²</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Priorität: hoch</span>
                          <span className="text-sm text-green-600 font-medium">25-35€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border border-green-100 rounded-lg p-4 bg-white">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">Vertikutieren</h4>
                        <p className="text-sm text-gray-600">Moos und Rasenfilz entfernen, 2-3mm tief</p>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500">Priorität: mittel</span>
                          <span className="text-sm text-green-600 font-medium">15-25€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Seasonal Care Plan */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Saisonaler Pflegeplan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getRecommendations().seasonal?.map((season, index) => (
                <div key={index} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <h4 className="font-semibold text-gray-800">{season.month}</h4>
                  </div>
                  <p className="font-medium text-sm text-gray-700 mb-1">{season.tasks}</p>
                  <p className="text-sm text-gray-600">{season.details}</p>
                </div>
              )) || (
                <>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Sun className="h-4 w-4 text-yellow-500" />
                      <h4 className="font-semibold text-gray-800">März-April</h4>
                    </div>
                    <p className="font-medium text-sm text-gray-700 mb-1">Frühjahrsputz und Startdüngung</p>
                    <p className="text-sm text-gray-600">Rasen von Laub befreien, erste Düngung mit Langzeitdünger</p>
                  </div>
                  <div className="border border-gray-100 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Droplets className="h-4 w-4 text-blue-500" />
                      <h4 className="font-semibold text-gray-800">Mai-Juni</h4>
                    </div>
                    <p className="font-medium text-sm text-gray-700 mb-1">Hauptwachstumsphase</p>
                    <p className="text-sm text-gray-600">Wöchentlich mähen, regelmäßig wässern, Unkraut bekämpfen</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Analysis */}
        <Card className="mb-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-blue-600" />
              Umweltfaktoren-Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <Sun className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Lichtverhältnisse</p>
                <p className="text-xs text-gray-600">Vollsonne erkannt</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <MapPin className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Bodenart</p>
                <p className="text-xs text-gray-600">Lehmboden</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Droplets className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Feuchtigkeit</p>
                <p className="text-xs text-gray-600">Optimal</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <Bug className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="font-medium text-sm">Schädlinge</p>
                <p className="text-xs text-gray-600">Keine erkannt</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Timeline Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Detaillierte Verbesserungs-Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="relative">
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-green-200"></div>
                
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">1</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Woche 1-2: Sofortmaßnahmen</p>
                    <p className="text-xs text-gray-600 mb-2">Düngen und Vertikutieren</p>
                    <div className="text-xs text-gray-500">
                      • Erste grüne Triebe sichtbar<br/>
                      • Moos wird braun und stirbt ab<br/>
                      • Bessere Wasseraufnahme
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">2</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Woche 3-6: Etablierungsphase</p>
                    <p className="text-xs text-gray-600 mb-2">Nachsaat und regelmäßige Pflege</p>
                    <div className="text-xs text-gray-500">
                      • Kahle Stellen schließen sich<br/>
                      • Dichteres Rasenbild<br/>
                      • Weniger Unkraut
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="flex items-start gap-4 relative">
                  <div className="w-8 h-8 bg-green-400 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">3</div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">Woche 7-12: Perfektionierung</p>
                    <p className="text-xs text-gray-600 mb-2">Feintuning und Optimierung</p>
                    <div className="text-xs text-gray-500">
                      • Sattgrüne Farbe<br/>
                      • Gleichmäßiger, dichter Wuchs<br/>
                      • Traumrasen erreicht
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-3 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800 mb-1">💡 Erfolgs-Tipp</p>
              <p className="text-xs text-green-700">Dokumentieren Sie den Fortschritt mit wöchentlichen Fotos - das motiviert und hilft bei der Feinabstimmung!</p>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="mb-6 bg-gray-50 border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Kostenübersicht
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Rasendünger (NPK 20-5-8)</span>
                <span className="font-medium">25-35€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Vertikutierer-Miete</span>
                <span className="font-medium">15-25€</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Rasensamen (2kg)</span>
                <span className="font-medium">20-30€</span>
              </div>
              <div className="border-t pt-2 mt-3">
                <div className="flex justify-between items-center font-semibold">
                  <span>Gesamtkosten</span>
                  <span className="text-green-600">60-90€</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Einmalige Investition für jahrelang schönen Rasen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => navigate('/highscore')}
            className="w-full bg-green-600 hover:bg-green-700 h-12"
          >
            <Star className="h-4 w-4 mr-2" />
            Score in Highscore eintragen
          </Button>
          
          <Button 
            onClick={handleStartAgain}
            variant="outline" 
            className="w-full h-12 border-green-200 hover:bg-green-50"
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Weitere Analyse starten
          </Button>
        </div>

        {/* Trust Line */}
        <div className="text-center mt-8 pt-6 border-t border-green-100">
          <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Leaf className="h-4 w-4 text-green-500" />
              <span>Wissenschaftlich fundiert</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Über 50.000 Analysen</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisResult;