import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RetentionData {
  isSignedUp: boolean;
  userHighscore: number;
  isNewHighscore: boolean;
  hasConsent: boolean;
}

export const useRetentionTracking = (analysisScore: number, jobId?: string) => {
  const [retentionData, setRetentionData] = useState<RetentionData>({
    isSignedUp: false,
    userHighscore: 0,
    isNewHighscore: false,
    hasConsent: false
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // User is logged in - check their profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('highscore, consent_marketing, first_name')
            .eq('id', user.id)
            .single();

          if (profile) {
            setRetentionData({
              isSignedUp: !!profile.first_name,
              userHighscore: profile.highscore || 0,
              isNewHighscore: analysisScore > (profile.highscore || 0),
              hasConsent: profile.consent_marketing || false
            });

            // Update highscore if this analysis is better
            if (analysisScore > (profile.highscore || 0)) {
              await updateHighscore(user.id, analysisScore);
            }

            // Create score history entry
            await createScoreHistory(user.id, analysisScore);
          }
        } else {
          // Anonymous user
          setRetentionData({
            isSignedUp: false,
            userHighscore: 0,
            isNewHighscore: false,
            hasConsent: false
          });
        }
      } catch (error) {
        console.error('Error checking user status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [analysisScore]);

  const updateHighscore = async (userId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          highscore: score,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating highscore:', error);
    }
  };

  const createScoreHistory = async (userId: string, score: number) => {
    try {
      const { error } = await supabase
        .from('score_history')
        .insert({
          user_id: userId,
          score: score,
          source: 'analysis'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating score history:', error);
    }
  };

  const handleSignUpComplete = () => {
    setRetentionData(prev => ({
      ...prev,
      isSignedUp: true,
      hasConsent: true
    }));
  };

  const trackAnalysisFromReminder = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      const kind = urlParams.get('kind');
      const rid = urlParams.get('rid');

      if (ref === 'reminder' && kind) {
        // Track that user came from reminder
        await supabase
          .from('events')
          .insert({
            category: 'retention',
            action: 'analysis_from_reminder',
            label: kind,
            value: parseInt(rid || '0') || null
          });
      }
    } catch (error) {
      console.error('Error tracking reminder click:', error);
    }
  };

  return {
    retentionData,
    isLoading,
    handleSignUpComplete,
    trackAnalysisFromReminder
  };
};