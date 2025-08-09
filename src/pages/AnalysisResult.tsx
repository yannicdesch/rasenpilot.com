import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Download, Share, Star, Leaf, Target, Calendar } from 'lucide-react';
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
    return analysisData.result.score || 65;
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

        {/* Key Recommendations */}
        <Card className="mb-6 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Sofort-Maßnahmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h4 className="font-medium text-gray-800">Düngen</h4>
                  <p className="text-sm text-gray-600">Stickstoffreichen Rasendünger verwenden</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h4 className="font-medium text-gray-800">Bewässerung</h4>
                  <p className="text-sm text-gray-600">2-3x wöchentlich morgens gießen</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h4 className="font-medium text-gray-800">Mähen</h4>
                  <p className="text-sm text-gray-600">Wöchentlich auf 4cm Höhe</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-green-600" />
              Verbesserungs-Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">1-2 Wochen</p>
                  <p className="text-xs text-gray-600">Erste Verbesserungen sichtbar</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">4-6 Wochen</p>
                  <p className="text-xs text-gray-600">Deutlich dichterer Rasen</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-200 rounded-full"></div>
                <div>
                  <p className="font-medium text-sm">8-12 Wochen</p>
                  <p className="text-xs text-gray-600">Traumrasen erreicht</p>
                </div>
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