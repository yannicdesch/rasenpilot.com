import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LatestAnalysis {
  id: string;
  score: number;
  summary_short: string;
  image_url: string;
  created_at: string;
  density_note?: string;
  sunlight_note?: string;
  moisture_note?: string;
  soil_note?: string;
  density_score?: number;
  sunlight_score?: number;
  moisture_score?: number;
  soil_score?: number;
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

      // Load latest analysis - check both tables
      let analysisData = null;
      
      // First try the analyses table
      const { data: directAnalysis } = await supabase
        .from('analyses')
        .select('id, score, summary_short, image_url, created_at, density_note, sunlight_note, moisture_note, soil_note')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (directAnalysis) {
        analysisData = directAnalysis;
      } else {
        // If no direct analysis, check analysis_jobs
        const { data: jobAnalysis } = await supabase
          .from('analysis_jobs')
          .select('id, result, image_path, created_at')
          .eq('user_id', user.user.id)
          .eq('status', 'completed')
          .not('result', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (jobAnalysis) {
          const result = jobAnalysis.result as any;
          const detailedScoring = result.detailed_scoring || {};
          
          analysisData = {
            id: jobAnalysis.id,
            score: parseInt(result.score) || parseInt(result.overall_health) || 0,
            summary_short: result.grass_condition || 'Analyse abgeschlossen',
            image_url: `https://ugaxwcslhoppflrbuwxv.supabase.co/storage/v1/object/public/lawn-images/${jobAnalysis.image_path}`,
            created_at: jobAnalysis.created_at,
            density_note: result.density_condition,
            sunlight_note: result.sunlight_condition,
            moisture_note: result.moisture_condition,
            soil_note: result.soil_condition,
            // Extract scores from detailed_scoring object
            density_score: detailedScoring.grass_density || 0,
            sunlight_score: detailedScoring.color_quality || 0,
            moisture_score: detailedScoring.health_status || 0,
            soil_score: detailedScoring.soil_condition || 0
          };
        }
      }

      if (analysisData) {
        setLatestAnalysis(analysisData);
      }

      // Load lawn profile
      const { data: profileData } = await supabase
        .from('lawn_profiles')
        .select('grass_type, lawn_size, zip_code')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (profileData) {
        setLawnProfile({
          grass_type: profileData.grass_type,
          lawn_size: profileData.lawn_size,
          location: profileData.zip_code
        });
      }

      // Calculate dashboard stats from both sources
      let allScores = [];
      
      // Get scores from analyses table
      const { data: allAnalyses } = await supabase
        .from('analyses')
        .select('score, created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (allAnalyses && allAnalyses.length > 0) {
        allScores = allAnalyses.map(a => ({ score: a.score, created_at: a.created_at }));
      }

      // Get scores from analysis_jobs table
      const { data: jobAnalyses } = await supabase
        .from('analysis_jobs')
        .select('result, created_at')
        .eq('user_id', user.user.id)
        .eq('status', 'completed')
        .not('result', 'is', null)
        .order('created_at', { ascending: false });

      if (jobAnalyses && jobAnalyses.length > 0) {
        const jobScores = jobAnalyses.map(job => ({
          score: parseInt((job.result as any)?.score) || 0,
          created_at: job.created_at
        }));
        allScores = [...allScores, ...jobScores];
      }

      // Sort all scores by date
      allScores.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      if (allScores.length > 0) {
        const scores = allScores.map(s => s.score);
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