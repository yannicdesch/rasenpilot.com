import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from './useSubscription';

const FREE_TIER_ANALYSIS_LIMIT = 1; // Free users get 1 free analysis

export const useFreeTierLimit = () => {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [analyzesUsed, setAnalyzesUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    checkAnalysisLimit();
  }, [user, isPremium]);

  const checkAnalysisLimit = async () => {
    if (!user) return;

    // Premium users have unlimited analyses
    if (isPremium) {
      setHasReachedLimit(false);
      setLoading(false);
      return;
    }

    try {
      // Count how many analyses this user has done
      const { count, error } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (error) throw error;

      const usedCount = count || 0;
      setAnalyzesUsed(usedCount);
      setHasReachedLimit(usedCount >= FREE_TIER_ANALYSIS_LIMIT);
    } catch (error) {
      console.error('Error checking analysis limit:', error);
    } finally {
      setLoading(false);
    }
  };

  const incrementAnalysisCount = async () => {
    if (!user || isPremium) return;

    try {
      // The counter will automatically update when new analysis is inserted
      await checkAnalysisLimit();
    } catch (error) {
      console.error('Error incrementing analysis count:', error);
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
    canAnalyze: isPremium || !hasReachedLimit
  };
};
