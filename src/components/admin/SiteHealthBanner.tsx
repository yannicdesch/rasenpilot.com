import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type HealthStatus = 'healthy' | 'stuck' | 'down';

interface HealthResult {
  status: HealthStatus;
  message: string;
  checkedAt: string;
  results: Array<{
    url: string;
    ok: boolean;
    status: number | null;
    stuck: boolean;
    durationMs: number;
  }>;
}

const POLL_INTERVAL_MS = 60_000;

const SiteHealthBanner = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [data, setData] = useState<HealthResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const runCheck = async () => {
    setChecking(true);
    try {
      const { data: result, error } = await supabase.functions.invoke('site-health-check');
      if (error) throw error;
      setData(result as HealthResult);
      setDismissed(false);
    } catch (err) {
      console.warn('[SiteHealthBanner] check failed', err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    runCheck();
    const id = setInterval(runCheck, POLL_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  if (adminLoading || !isAdmin || !data) return null;
  if (data.status === 'healthy') return null;
  if (dismissed) return null;

  const isStuck = data.status === 'stuck';
  const Icon = isStuck ? AlertTriangle : XCircle;

  return (
    <div
      className={cn(
        'fixed top-0 inset-x-0 z-[60] border-b shadow-md',
        isStuck
          ? 'bg-amber-500/95 text-amber-950 border-amber-700'
          : 'bg-destructive/95 text-destructive-foreground border-destructive',
      )}
      role="alert"
    >
      <div className="container mx-auto px-4 py-2 flex items-center gap-3 text-sm">
        <Icon className="h-5 w-5 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold leading-tight">
            {isStuck ? 'Live-Seite hängt im Ladescreen' : 'Live-Seite nicht erreichbar'}
          </p>
          <p className="text-xs opacity-90 truncate">
            {data.message} · geprüft {new Date(data.checkedAt).toLocaleTimeString('de-DE')}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={runCheck}
          disabled={checking}
          className="bg-background/90 text-foreground hover:bg-background"
        >
          {checking ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Erneut prüfen
            </>
          )}
        </Button>
        {isStuck && (
          <a
            href="https://docs.lovable.dev/features/deploy"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs underline underline-offset-2 font-medium"
          >
            Republish-Anleitung
          </a>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-xs opacity-70 hover:opacity-100 px-2"
          aria-label="Banner schließen"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export const SiteHealthBannerLazy = SiteHealthBanner;
export default SiteHealthBanner;
