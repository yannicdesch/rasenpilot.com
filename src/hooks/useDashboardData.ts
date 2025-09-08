import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LatestAnalysis {
  id: string;
  score: number;
  summary_short: string;
  image_url: string;
  created_at: string;
}

interface LawnProfile {
  grass_type: string;
  lawn_size: string;
  location?: string;
}

interface DashboardStats {
  totalAnalyses: number;
  averageScore: number;
  bestScore: number;
  improvementTrend: number;
  rankInRegion?: number;
  totalUsersInRegion?: number;
}

export const useDashboardData = () => {
  const [latestAnalysis, setLatestAnalysis] = useState<LatestAnalysis | null>(null);
  const [lawnProfile, setLawnProfile] = useState<LawnProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) return;

      // Load latest analysis
      const { data: analysisData } = await supabase
        .from('analyses')
        .select('id, score, summary_short, image_url, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (analysisData) {
        setLatestAnalysis(analysisData);
      }

      // Load lawn profile
      const { data: profileData } = await supabase
        .from('lawn_profiles')
        .select('grass_type, lawn_size, zip_code')
        .eq('user_id', user.user.id)
        .limit(1)
        .single();

      if (profileData) {
        setLawnProfile({
          grass_type: profileData.grass_type,
          lawn_size: profileData.lawn_size,
          location: profileData.zip_code
        });
      }

      // Calculate dashboard stats
      const { data: allAnalyses } = await supabase
        .from('analyses')
        .select('score, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (allAnalyses && allAnalyses.length > 0) {
        const scores = allAnalyses.map(a => a.score);
        const totalAnalyses = scores.length;
        const averageScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / totalAnalyses);
        const bestScore = Math.max(...scores);
        
        // Calculate improvement trend (comparing last 2 scores)
        const improvementTrend = totalAnalyses >= 2 
          ? scores[0] - scores[1]
          : 0;

        // Get regional ranking if location is available
        let rankInRegion;
        let totalUsersInRegion;
        
        if (profileData?.zip_code) {
          const zipPrefix = profileData.zip_code.substring(0, 2);
          const { data: regionalHighscores } = await supabase
            .from('lawn_highscores')
            .select('lawn_score, location')
            .like('location', `${zipPrefix}%`)
            .order('lawn_score', { ascending: false });

          if (regionalHighscores) {
            totalUsersInRegion = regionalHighscores.length;
            const userRank = regionalHighscores.findIndex(h => h.lawn_score <= bestScore);
            rankInRegion = userRank === -1 ? totalUsersInRegion + 1 : userRank + 1;
          }
        }

        setDashboardStats({
          totalAnalyses,
          averageScore,
          bestScore,
          improvementTrend,
          rankInRegion,
          totalUsersInRegion
        });
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    latestAnalysis,
    lawnProfile,
    dashboardStats,
    loading,
    refreshData: loadDashboardData
  };
};