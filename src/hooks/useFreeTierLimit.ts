import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';

const FREE_TIER_ANALYSIS_LIMIT = 1; // Free users get 1 free analysis
const ANONYMOUS_ANALYSIS_KEY = 'rasenpilot_anonymous_analysis_used';

export const useFreeTierLimit = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [analyzesUsed, setAnalyzesUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    checkAnalysisLimit();
  }, [user, isPremium]);

  const checkAnalysisLimit = async () => {
    // Premium users have unlimited analyses
    if (isPremium) {
      setHasReachedLimit(false);
      setLoading(false);
      return;
    }

    // For logged-in users, check database
    if (user) {
      try {
        // Count completed analysis jobs for this user
        const { count, error } = await supabase
          .from('analysis_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed');

        if (error) throw error;

        const usedCount = count || 0;
        setAnalyzesUsed(usedCount);
        setHasReachedLimit(usedCount >= FREE_TIER_ANALYSIS_LIMIT);
      } catch (error) {
        console.error('Error checking analysis limit:', error);
      } finally {
        setLoading(false);
      }
    } else {
      // For anonymous users, check localStorage
      const anonymousUsed = localStorage.getItem(ANONYMOUS_ANALYSIS_KEY) === 'true';
      setAnalyzesUsed(anonymousUsed ? 1 : 0);
      setHasReachedLimit(anonymousUsed);
      setLoading(false);
    }
  };

  const markAnonymousAnalysisUsed = () => {
    localStorage.setItem(ANONYMOUS_ANALYSIS_KEY, 'true');
    setAnalyzesUsed(1);
    setHasReachedLimit(true);
  };

  const incrementAnalysisCount = async () => {
    if (isPremium) return;

    if (!user) {
      // Mark anonymous analysis as used
      markAnonymousAnalysisUsed();
    } else {
      // Refresh count from database
      await checkAnalysisLimit();
    }
  };

  const remainingAnalyses = Math.max(0, FREE_TIER_ANALYSIS_LIMIT - analyzesUsed);

  return {
    analyzesUsed,
    hasReachedLimit,
    remainingAnalyses,
    freeLimit: FREE_TIER_ANALYSIS_LIMIT,
    loading,
    checkAnalysisLimit,
    incrementAnalysisCount,
    markAnonymousAnalysisUsed,
    canAnalyze: isPremium || !hasReachedLimit
  };
};
