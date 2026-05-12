import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingAnalysisProps {
  /** Total estimated duration in ms (used to drive the progress bar). */
  estimatedMs?: number;
  /** Whether to block the user from leaving the page while loading. */
  blockNavigation?: boolean;
}

const STEPS = [
  { label: 'Daten werden geladen…', from: 0, to: 35 },
  { label: 'Analyse wird vorbereitet…', from: 35, to: 75 },
  { label: 'Fast fertig…', from: 75, to: 98 },
];

const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({
  estimatedMs = 4000,
  blockNavigation = true,
}) => {
  const [progress, setProgress] = useState(2);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const dt = t - start;
      setElapsed(dt);
      // Ease towards 98% over estimatedMs, never reach 100% (page mount completes it).
      const pct = Math.min(98, (dt / estimatedMs) * 100);
      setProgress(pct);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [estimatedMs]);

  useEffect(() => {
    if (!blockNavigation) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [blockNavigation]);

  const currentStep =
    STEPS.find((s) => progress >= s.from && progress < s.to) ?? STEPS[STEPS.length - 1];
  const remainingSec = Math.max(1, Math.ceil((estimatedMs - elapsed) / 1000));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Analyse wird gestartet"
      className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto bg-background/95 backdrop-blur-sm animate-fade-in"
    >
      <div className="w-full max-w-xl mx-auto px-4 pt-10 pb-16">
        {/* Progress card */}
        <div className="rounded-2xl border border-primary/20 bg-card shadow-xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="relative">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
              <Sparkles className="h-3 w-3 text-accent absolute -top-1 -right-1" />
            </div>
            <h2 className="text-lg md:text-xl font-semibold text-foreground">
              Deine Rasenanalyse wird vorbereitet
            </h2>
          </div>

          <p
            className="text-sm text-muted-foreground mb-3 transition-opacity"
            aria-live="polite"
            key={currentStep.label}
          >
            {currentStep.label}
          </p>

          <Progress value={progress} className="h-2" />

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>{Math.round(progress)}%</span>
            <span>Noch ca. {remainingSec} Sekunde{remainingSec === 1 ? '' : 'n'}</span>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Bitte schließe diese Seite nicht — wir laden gerade alle Komponenten für deine Analyse.
          </p>
        </div>

        {/* Skeleton preview of the upcoming page */}
        <div className="mt-6 rounded-2xl border border-border bg-card/60 p-5 md:p-6">
          <Skeleton className="h-6 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-5/6 mb-6" />

          <Skeleton className="h-48 w-full rounded-xl mb-6" />

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>

          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export default LoadingAnalysis;
