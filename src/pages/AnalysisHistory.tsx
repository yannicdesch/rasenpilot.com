import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Calendar, Eye, Loader2, Star, History } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';

interface AnalysisHistoryItem {
  id: string;
  score: number;
  created_at: string;
  status: string;
  result?: any;
}

const AnalysisHistory: React.FC = () => {
  const navigate = useNavigate();
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isClaimingPending, setIsClaimingPending] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Bitte melden Sie sich an, um Ihre Analyse-Historie zu sehen');
        navigate('/');
        return;
      }

      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUserProfile(profile);

      // Check for pending analysis claims from localStorage
      await claimPendingAnalyses(user.id);

      // Load user's analysis history
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

        if (error) {
          console.error('Error claiming pending analysis:', error);
        } else {
          console.log('✅ Successfully claimed pending analysis');
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
        .select('id, created_at, status, result')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const historyItems: AnalysisHistoryItem[] = data.map(item => {
        let score = 0;
        if (item.result && typeof item.result === 'object') {
          const result = item.result as any;
          score = result.score || result.overall_health || 0;
        }
        
        return {
          id: item.id,
          score: score,
          created_at: item.created_at,
          status: item.status,
          result: item.result
        };
      });

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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewAnalysis = (analysisId: string) => {
    navigate(`/analysis-result/${analysisId}`);
  };

  const handleNewAnalysis = () => {
    navigate('/lawn-analysis');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-3" />
                    <Skeleton className="h-8 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title="Meine Rasen-Analysen | RasenPilot"
        description="Verfolgen Sie Ihren Rasen-Fortschritt mit detaillierter Analyse-Historie und Scores."
        keywords="Rasen Historie, Analyse Verlauf, Rasen Fortschritt, Pflegeplan"
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 mb-2">
                Meine Rasen-Analysen
              </h1>
              <p className="text-gray-600">
                Verfolgen Sie Ihren Fortschritt über die Zeit
              </p>
            </div>
            <Button 
              onClick={handleNewAnalysis}
              className="bg-green-600 hover:bg-green-700"
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Neue Analyse
            </Button>
          </div>
        </div>

        {/* User Stats Card */}
        {userProfile && (
          <Card className="mb-8 bg-gradient-to-r from-green-600 to-green-700 text-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="h-6 w-6 text-yellow-400 mr-2" />
                    <span className="text-2xl font-bold">{userProfile.highscore || 0}</span>
                  </div>
                  <p className="text-green-100">Bester Score</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <History className="h-6 w-6 text-green-200 mr-2" />
                    <span className="text-2xl font-bold">{analyses.length}</span>
                  </div>
                  <p className="text-green-100">Analysen</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Calendar className="h-6 w-6 text-green-200 mr-2" />
                    <span className="text-2xl font-bold">
                      {analyses.length > 0 ? formatDate(analyses[0].created_at).split(',')[0] : '-'}
                    </span>
                  </div>
                  <p className="text-green-100">Letzte Analyse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Claiming pending analyses indicator */}
        {isClaimingPending && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="text-blue-800">Verknüpfe vorherige Analyse mit Ihrem Konto...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis History */}
        {analyses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Noch keine Analysen
              </h3>
              <p className="text-gray-600 mb-6">
                Starten Sie Ihre erste Rasenanalyse, um Ihren Fortschritt zu verfolgen.
              </p>
              <Button onClick={handleNewAnalysis} className="bg-green-600 hover:bg-green-700">
                Erste Analyse starten
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <Card key={analysis.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Analyse #{analysis.id.slice(-8)}
                    </CardTitle>
                    <Badge variant={analysis.status === 'completed' ? 'default' : 'secondary'}>
                      {analysis.status === 'completed' ? 'Abgeschlossen' : 'In Bearbeitung'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDate(analysis.created_at)}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Score Display */}
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(analysis.score)}`}>
                        {analysis.score}/100
                      </div>
                      <p className="text-sm text-gray-600">
                        {getScoreLabel(analysis.score)}
                      </p>
                      <Progress 
                        value={analysis.score} 
                        className="mt-2"
                      />
                    </div>
                    
                    {/* Action Button */}
                    <Button 
                      onClick={() => handleViewAnalysis(analysis.id)}
                      variant="outline" 
                      className="w-full"
                      disabled={analysis.status !== 'completed'}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {analysis.status === 'completed' ? 'Details ansehen' : 'Wird analysiert...'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisHistory;