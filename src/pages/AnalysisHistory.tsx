import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, Eye, Loader2, Star, History, Crown, Lock, Camera } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisHistoryItem {
  id: string;
  score: number;
  created_at: string;
  status: string;
  result?: any;
  image_path?: string;
  image_url?: string;
}

const AnalysisHistory: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isClaimingPending, setIsClaimingPending] = useState(false);

  useEffect(() => {
    if (user) {
      checkAuthAndLoadData();
    } else if (!subLoading) {
      setIsLoading(false);
    }
  }, [user, subLoading]);

  const checkAuthAndLoadData = async () => {
    try {
      if (!user) {
        toast.error('Bitte melden Sie sich an, um Ihre Analyse-Historie zu sehen');
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);
      await claimPendingAnalyses(user.id);
      await loadAnalysisHistory(user.id);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  const claimPendingAnalyses = async (userId: string) => {
    const pendingClaim = localStorage.getItem('pending_analysis_claim');
    if (pendingClaim) {
      setIsClaimingPending(true);
      try {
        const claimData = JSON.parse(pendingClaim);
        const { error } = await supabase.rpc('claim_orphaned_analysis', {
          p_user_id: userId,
          p_email: claimData.email,
          p_analysis_id: claimData.analysisId
        });
        if (!error) {
          localStorage.removeItem('pending_analysis_claim');
          toast.success('Ihre vorherige Analyse wurde erfolgreich zu Ihrem Konto hinzugefügt!');
        }
      } catch (error) {
        console.error('Error parsing pending claim data:', error);
      } finally {
        setIsClaimingPending(false);
      }
    }
  };

  const loadAnalysisHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('analysis_jobs')
        .select('id, created_at, status, result, image_path')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historyItems: AnalysisHistoryItem[] = await Promise.all(
        data.map(async (item) => {
          let score = 0;
          if (item.result && typeof item.result === 'object') {
            const result = item.result as any;
            score = result.score || result.overall_health || 0;
          }
          
          let imageUrl = '';
          if (item.image_path) {
            try {
              const { data: signedUrlData } = await supabase.storage
                .from('lawn-images')
                .createSignedUrl(item.image_path, 3600);
              if (signedUrlData?.signedUrl) imageUrl = signedUrlData.signedUrl;
            } catch {}
          }
          
          return { id: item.id, score, created_at: item.created_at, status: item.status, result: item.result, image_path: item.image_path, image_url: imageUrl };
        })
      );

      setAnalyses(historyItems);
    } catch (error) {
      console.error('Error loading analysis history:', error);
      toast.error('Fehler beim Laden der Analyse-Historie');
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Chart data (chronological order)
  const chartData = [...analyses]
    .filter(a => a.status === 'completed' && a.score > 0)
    .reverse()
    .map(a => ({
      date: formatDate(a.created_at),
      score: a.score,
    }));

  const getSummary = (result: any) => {
    if (!result) return '';
    return result.summary_short || result.grass_condition || '';
  };

  if (isLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="p-4"><Skeleton className="h-6 w-full mb-2" /><Skeleton className="h-4 w-3/4 mb-3" /><Skeleton className="h-8 w-full" /></CardContent></Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Premium Gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <SEO title="Mein Rasen-Verlauf | Rasenpilot" description="Verfolge deinen Rasen-Fortschritt über die Zeit." canonical="/analysis-history" noindex />
        <MainNavigation />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Rasen-Verlauf freischalten</h2>
              <p className="text-gray-600 mb-6">
                Mit Premium siehst du deinen kompletten Analyse-Verlauf, Score-Entwicklung im Diagramm und Foto-Timeline.
              </p>
              <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
                <li className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-green-600" /> Score-Verlauf als Diagramm</li>
                <li className="flex items-center gap-2"><Camera className="h-4 w-4 text-green-600" /> Foto-Timeline mit Vorher/Nachher</li>
                <li className="flex items-center gap-2"><History className="h-4 w-4 text-green-600" /> Alle Analysen auf einen Blick</li>
              </ul>
              <Button onClick={() => navigate('/subscription?ref=analysis-history')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Crown className="h-4 w-4 mr-2" />
                7 Tage kostenlos testen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Mein Rasen-Verlauf | Rasenpilot"
        description="Verfolge deinen Rasen-Fortschritt mit detaillierter Analyse-Historie und Scores."
        keywords="Rasen Historie, Analyse Verlauf, Rasen Fortschritt"
        canonical="/analysis-history"
        noindex
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-1">Mein Rasen-Verlauf</h1>
            <p className="text-gray-600">Verfolge deinen Fortschritt über die Zeit</p>
          </div>
          <Button onClick={() => navigate('/lawn-analysis')} className="bg-green-600 hover:bg-green-700">
            <Camera className="h-4 w-4 mr-2" />
            Neue Analyse
          </Button>
        </div>

        {/* Stats */}
        {userProfile && (
          <Card className="mb-8 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <Star className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                  <span className="text-2xl font-bold block">{userProfile.highscore || 0}</span>
                  <span className="text-green-100 text-sm">Bester Score</span>
                </div>
                <div>
                  <History className="h-5 w-5 text-green-200 mx-auto mb-1" />
                  <span className="text-2xl font-bold block">{analyses.length}</span>
                  <span className="text-green-100 text-sm">Analysen</span>
                </div>
                <div>
                  <Calendar className="h-5 w-5 text-green-200 mx-auto mb-1" />
                  <span className="text-2xl font-bold block">
                    {analyses.length > 0 ? formatDate(analyses[0].created_at) : '-'}
                  </span>
                  <span className="text-green-100 text-sm">Letzte Analyse</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Chart */}
        {chartData.length >= 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Score-Entwicklung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    formatter={(value: number) => [`${value}/100`, 'Score']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#16a34a" 
                    strokeWidth={3} 
                    dot={{ fill: '#16a34a', r: 5 }} 
                    activeDot={{ r: 7 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {isClaimingPending && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <span className="text-blue-800">Verknüpfe vorherige Analyse…</span>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        {analyses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Noch keine Analysen</h3>
              <p className="text-gray-600 mb-6">Starte deine erste Rasenanalyse, um deinen Fortschritt zu verfolgen.</p>
              <Button onClick={() => navigate('/lawn-analysis')} className="bg-green-600 hover:bg-green-700">Erste Analyse starten</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {analyses.map((analysis, index) => (
              <div key={analysis.id} className="relative flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 z-10 ${
                    analysis.score >= 80 ? 'bg-green-500 border-green-600' :
                    analysis.score >= 60 ? 'bg-yellow-500 border-yellow-600' :
                    'bg-red-500 border-red-600'
                  }`} />
                  {index < analyses.length - 1 && (
                    <div className="w-0.5 flex-1 bg-gray-200 min-h-[2rem]" />
                  )}
                </div>

                {/* Content */}
                <Card className="flex-1 mb-4 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {analysis.image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          <img 
                            src={analysis.image_url} 
                            alt="Rasen" 
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-500">{formatDateTime(analysis.created_at)}</span>
                          <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'} className="text-xs">
                            {analysis.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 mb-2">
                          <span className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                            {analysis.score}/100
                          </span>
                          <span className="text-sm text-gray-600">{getScoreLabel(analysis.score)}</span>
                        </div>

                        {getSummary(analysis.result) && (
                          <p className="text-sm text-gray-700 line-clamp-2 mb-2">{getSummary(analysis.result)}</p>
                        )}

                        <Button 
                          onClick={() => navigate(`/analysis-result/${analysis.id}`)}
                          variant="ghost" 
                          size="sm"
                          disabled={analysis.status !== 'completed'}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-0 h-auto"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details ansehen
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;
