import { useEffect, useSyncExternalStore, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingAnalysis from '@/components/LoadingAnalysis';

// Tiny module-level store so any button can trigger the global overlay.
let visible = false;
const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const getSnapshot = () => visible;
const setVisible = (v: boolean) => {
  if (visible === v) return;
  visible = v;
  listeners.forEach((l) => l());
};

export const showAnalysisLoader = () => setVisible(true);
export const hideAnalysisLoader = () => setVisible(false);

/**
 * Hook for "Analyse starten" buttons. Shows a global loading overlay
 * immediately and then navigates to /lawn-analysis on the next tick so
 * the user gets instant feedback even while the route chunk loads.
 */
export const useStartAnalysis = () => {
  const navigate = useNavigate();
  return useCallback(() => {
    showAnalysisLoader();
    // Allow the overlay to paint before kicking off the lazy route.
    setTimeout(() => navigate('/lawn-analysis'), 0);
  }, [navigate]);
};

/** Mounted once globally; renders the overlay when triggered. */
export const AnalysisStartOverlay = () => {
  const isVisible = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const location = useLocation();

  // Auto-hide once the lawn-analysis page has actually mounted.
  useEffect(() => {
    if (!isVisible) return;
    if (location.pathname === '/lawn-analysis') {
      const t = setTimeout(() => hideAnalysisLoader(), 250);
      return () => clearTimeout(t);
    }
  }, [isVisible, location.pathname]);

  if (!isVisible) return null;
  return <LoadingAnalysis estimatedMs={4000} blockNavigation />;
};
