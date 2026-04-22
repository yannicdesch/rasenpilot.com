import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Copy, RefreshCw, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdmin } from '@/hooks/useAdmin';

export interface ErrorScreenProps {
  /** Correlation ID for support / log lookup. Auto-generated if omitted. */
  correlationId?: string;
  /** Short technical message (shown to admins, hidden from regular users). */
  technicalMessage?: string;
  /** Optional friendly headline override. */
  title?: string;
  /** Optional friendly description override. */
  description?: string;
  /** Called when the user clicks "Erneut versuchen". Defaults to full reload. */
  onRetry?: () => void;
}

const SUPABASE_PROJECT_REF = 'ugaxwcslhoppflrbuwxv';
const SUPABASE_DASHBOARD = `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_REF}`;

const generateCorrelationId = () => {
  const time = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `RP-${time}-${rand}`.toUpperCase();
};

const ErrorScreen = ({
  correlationId,
  technicalMessage,
  title = 'Da ist etwas schiefgelaufen',
  description = 'Die Seite konnte nicht vollständig geladen werden. Versuche es bitte erneut – wir wurden bereits informiert.',
  onRetry,
}: ErrorScreenProps) => {
  const { isAdmin } = useAdmin();
  const cid = useMemo(() => correlationId || generateCorrelationId(), [correlationId]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Surface to console for client-side debugging / Sentry hooks.
    console.error('[ErrorScreen]', { correlationId: cid, technicalMessage });
  }, [cid, technicalMessage]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* noop */
    }
  };

  const handleRetry = () => {
    if (onRetry) onRetry();
    else window.location.reload();
  };

  return (
    <main
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex items-center justify-center bg-background px-4 py-12"
    >
      <div className="w-full max-w-lg rounded-2xl border bg-card text-card-foreground shadow-lg p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-3 shrink-0">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mt-6 rounded-lg bg-muted/60 border border-border px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            Vorgangs-ID
          </p>
          <div className="mt-1 flex items-center gap-2">
            <code className="font-mono text-sm break-all flex-1 select-all">{cid}</code>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-8 px-2"
              aria-label="Vorgangs-ID kopieren"
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Bitte gib diese ID an, wenn du den Support kontaktierst.
          </p>
        </div>

        {isAdmin && technicalMessage && (
          <details className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-xs">
            <summary className="cursor-pointer font-medium text-foreground">
              Technische Details (nur Admin)
            </summary>
            <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-[11px] text-muted-foreground">
              {technicalMessage}
            </pre>
          </details>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-2">
          <Button onClick={handleRetry} className="flex-1">
            <RefreshCw className="h-4 w-4 mr-2" />
            Erneut versuchen
          </Button>
          <Button asChild variant="outline" className="flex-1">
            <a href="/">Zur Startseite</a>
          </Button>
        </div>

        {isAdmin && (
          <div className="mt-6 border-t pt-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
              Admin-Diagnose
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`${SUPABASE_DASHBOARD}/functions/site-health-monitor/logs`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Edge Function Logs
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`${SUPABASE_DASHBOARD}/logs/edge-logs`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Edge Logs
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a
                  href={`${SUPABASE_DASHBOARD}/logs/postgres-logs`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Postgres Logs
                </a>
              </Button>
              <Button asChild size="sm" variant="secondary">
                <a
                  href="https://lovable.dev/projects/0340263e-70dd-410e-b25b-2a5f0772e1a5"
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" />
                  Lovable Deploy
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ErrorScreen;
