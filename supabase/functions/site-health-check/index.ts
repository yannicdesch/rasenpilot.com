// Site health-check: pings the published site and reports status.
// Public endpoint (verify_jwt = false) so the admin banner can call it without auth.

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TARGETS = [
  'https://www.rasenpilot.com',
  'https://rasenpilot.com',
];

// Markers that indicate the SPA shell rendered but the JS bundle never hydrated.
// The PageLoader fallback in src/App.tsx renders "Laden..." inside a centered div.
const STUCK_MARKERS = ['>Laden...<', 'Loading...'];
// Markers that indicate the app actually booted and rendered real content.
const HEALTHY_MARKERS = ['Rasenpilot', 'rasen', 'analyse'];

type TargetResult = {
  url: string;
  ok: boolean;
  status: number | null;
  durationMs: number;
  stuck: boolean;
  hasContent: boolean;
  error?: string;
};

async function checkTarget(url: string): Promise<TargetResult> {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'User-Agent': 'RasenpilotHealthCheck/1.0' },
    });
    clearTimeout(timeout);
    const text = await res.text();
    const lower = text.toLowerCase();
    const stuck =
      STUCK_MARKERS.some((m) => text.includes(m)) &&
      !HEALTHY_MARKERS.some((m) => lower.includes(m.toLowerCase()));
    const hasContent = HEALTHY_MARKERS.some((m) => lower.includes(m.toLowerCase()));
    return {
      url,
      ok: res.ok && !stuck && hasContent,
      status: res.status,
      durationMs: Date.now() - started,
      stuck,
      hasContent,
    };
  } catch (err) {
    return {
      url,
      ok: false,
      status: null,
      durationMs: Date.now() - started,
      stuck: false,
      hasContent: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const results = await Promise.all(TARGETS.map(checkTarget));
  const healthy = results.every((r) => r.ok);
  const anyStuck = results.some((r) => r.stuck);

  let status: 'healthy' | 'stuck' | 'down' = 'healthy';
  let message = 'Live-Seite läuft normal.';
  if (anyStuck) {
    status = 'stuck';
    message = 'Live-Seite hängt im Lade-Bildschirm. Bitte über "Publish → Update" neu veröffentlichen.';
  } else if (!healthy) {
    status = 'down';
    message = 'Live-Seite antwortet nicht oder liefert Fehler.';
  }

  return new Response(
    JSON.stringify({
      status,
      healthy,
      message,
      checkedAt: new Date().toISOString(),
      results,
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
});
