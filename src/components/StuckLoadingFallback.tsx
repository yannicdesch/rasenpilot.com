import { useEffect, useState } from 'react';
import ErrorScreen from './ErrorScreen';

interface Props {
  /** Show the error screen if loading exceeds this many ms. */
  timeoutMs?: number;
}

/**
 * Suspense fallback that escalates to a friendly error screen with a
 * correlation ID if the page never finishes loading.
 */
const StuckLoadingFallback = ({ timeoutMs = 20_000 }: Props) => {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setStuck(true), timeoutMs);
    return () => clearTimeout(id);
  }, [timeoutMs]);

  if (stuck) {
    return (
      <ErrorScreen
        title="Die Seite lädt ungewöhnlich lange"
        description="Die Anwendung antwortet nicht. Bitte lade die Seite neu oder versuche es in wenigen Minuten erneut."
        technicalMessage={`Suspense fallback exceeded ${timeoutMs}ms without resolving.`}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Laden...</p>
      </div>
    </div>
  );
};

export default StuckLoadingFallback;
