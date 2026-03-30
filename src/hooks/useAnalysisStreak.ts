import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAnalysisStreak = () => {
  const [streak, setStreak] = useState(0);
  const [streakAboutToBreak, setStreakAboutToBreak] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateStreak();
  }, []);

  const calculateStreak = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) { setLoading(false); return; }

      // Get all analyses ordered by date
      const { data: analyses } = await supabase
        .from('analyses')
        .select('created_at')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      const { data: jobs } = await supabase
        .from('analysis_jobs')
        .select('created_at')
        .eq('user_id', user.user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const allDates = [
        ...(analyses || []).map(a => a.created_at),
        ...(jobs || []).map(j => j.created_at),
      ].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

      if (allDates.length === 0) {
        setStreak(0);
        setLoading(false);
        return;
      }

      // Calculate weekly streak (consecutive weeks with at least one analysis)
      const now = new Date();
      let weekStreak = 0;
      
      // Get current week start (Monday)
      const getWeekStart = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        return d;
      };

      // Group dates by week
      const weekSet = new Set<string>();
      allDates.forEach(dateStr => {
        const ws = getWeekStart(new Date(dateStr));
        weekSet.add(ws.toISOString().split('T')[0]);
      });

      const currentWeekStart = getWeekStart(now);
      let checkWeek = new Date(currentWeekStart);
      
      // Check if current week has an analysis
      const currentWeekKey = checkWeek.toISOString().split('T')[0];
      const hasCurrentWeek = weekSet.has(currentWeekKey);
      
      if (!hasCurrentWeek) {
        // Check last week
        checkWeek.setDate(checkWeek.getDate() - 7);
        const lastWeekKey = checkWeek.toISOString().split('T')[0];
        if (!weekSet.has(lastWeekKey)) {
          setStreak(0);
          setLoading(false);
          return;
        }
      }

      // Count consecutive weeks backwards
      checkWeek = hasCurrentWeek ? new Date(currentWeekStart) : new Date(currentWeekStart);
      if (!hasCurrentWeek) checkWeek.setDate(checkWeek.getDate() - 7);
      
      while (weekSet.has(checkWeek.toISOString().split('T')[0])) {
        weekStreak++;
        checkWeek.setDate(checkWeek.getDate() - 7);
      }

      setStreak(weekStreak);

      // Check if streak is about to break (no analysis this week and last analysis was last week)
      if (!hasCurrentWeek && weekStreak > 0) {
        // Check how many days since last analysis
        const lastAnalysisDate = new Date(allDates[0]);
        const daysSince = Math.floor((now.getTime() - lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSince >= 6) {
          setStreakAboutToBreak(true);
        }
      }

    } catch (error) {
      console.error('Error calculating streak:', error);
    } finally {
      setLoading(false);
    }
  };

  return { streak, streakAboutToBreak, loading };
};
