// Scheduled site-health monitor.
// Pings the live site, persists state, and sends an alert email via Resend
// when the site has been stuck/down for >= 60s. Has a 30-min cooldown to
// avoid spamming the admin.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TARGETS = ['https://www.rasenpilot.com', 'https://rasenpilot.com'];
const STUCK_MARKERS = ['>Laden...<', 'Loading...'];
const HEALTHY_MARKERS = ['rasenpilot', 'analyse'];

const ALERT_AFTER_MS = 60_000; // stuck for >= 60s before first alert
const ALERT_COOLDOWN_MS = 30 * 60_000; // 30 min between alerts
const ADMIN_EMAIL = 'yannic.desch@gmail.com';

type CheckResult = {
  url: string;
  ok: boolean;
  stuck: boolean;
  status: number | null;
  error?: string;
};

async function checkTarget(url: string): Promise<CheckResult> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': 'RasenpilotHealthMonitor/1.0' },
    });
    clearTimeout(t);
    const text = await res.text();
    const lower = text.toLowerCase();
    const hasContent = HEALTHY_MARKERS.some((m) => lower.includes(m));
    const stuck = STUCK_MARKERS.some((m) => text.includes(m)) && !hasContent;
    return { url, ok: res.ok && !stuck && hasContent, stuck, status: res.status };
  } catch (err) {
    return {
      url,
      ok: false,
      stuck: false,
      status: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

async function sendAlertEmail(opts: {
  status: 'stuck' | 'down';
  message: string;
  stuckSince: string;
  results: CheckResult[];
}) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  if (!RESEND_API_KEY) {
    console.warn('[site-health-monitor] RESEND_API_KEY missing, skipping email');
    return false;
  }

  const subject =
    opts.status === 'stuck'
      ? '🚨 Rasenpilot hängt im Ladescreen'
      : '🚨 Rasenpilot ist nicht erreichbar';

  const stuckMin = Math.round(
    (Date.now() - new Date(opts.stuckSince).getTime()) / 60000,
  );

  const html = `
    <div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="color: #b91c1c; margin: 0 0 12px;">${subject}</h2>
      <p style="font-size: 15px; color: #111;">${opts.message}</p>
      <p style="font-size: 14px; color: #444;">
        Status seit: <strong>${stuckMin} Minute(n)</strong> (${new Date(opts.stuckSince).toLocaleString('de-DE')})
      </p>
      <h3 style="font-size: 14px; margin-top: 24px;">Geprüfte URLs</h3>
      <ul style="font-size: 13px; color: #333;">
        ${opts.results
          .map(
            (r) =>
              `<li>${r.url} — HTTP ${r.status ?? 'n/a'}${r.stuck ? ' · <strong>stuck</strong>' : ''}${r.error ? ` · ${r.error}` : ''}</li>`,
          )
          .join('')}
      </ul>
      <div style="margin-top: 28px; padding: 16px; background: #fef3c7; border-radius: 8px; border: 1px solid #f59e0b;">
        <p style="margin: 0 0 8px; font-weight: 600; color: #92400e;">So behebst du es:</p>
        <ol style="margin: 0; padding-left: 20px; color: #78350f; font-size: 14px;">
          <li>Lovable-Editor öffnen</li>
          <li>Oben rechts auf <strong>Publish → Update</strong> klicken</li>
          <li>Nach ~1 Min sollte die Seite wieder laufen</li>
        </ol>
      </div>
      <p style="font-size: 12px; color: #888; margin-top: 24px;">
        Automatischer Alert vom site-health-monitor. Nächste Mail frühestens in 30 Min.
      </p>
    </div>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Rasenpilot Monitor <onboarding@resend.dev>',
        to: [ADMIN_EMAIL],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('[site-health-monitor] Resend failed', res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error('[site-health-monitor] email error', err);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const results = await Promise.all(TARGETS.map(checkTarget));
  const anyStuck = results.some((r) => r.stuck);
  const allOk = results.every((r) => r.ok);

  let status: 'healthy' | 'stuck' | 'down' = 'healthy';
  let message = 'Live-Seite läuft normal.';
  if (anyStuck) {
    status = 'stuck';
    message = 'Live-Seite hängt im Lade-Bildschirm (JS-Bundle nicht hydratisiert).';
  } else if (!allOk) {
    status = 'down';
    message = 'Live-Seite antwortet nicht oder liefert Fehler.';
  }

  // Load previous state
  const { data: prev } = await supabase
    .from('site_health_state')
    .select('*')
    .eq('id', 1)
    .maybeSingle();

  const now = new Date();
  let stuckSince: string | null = prev?.stuck_since ?? null;
  let consecutive = prev?.consecutive_stuck_count ?? 0;

  if (status === 'healthy') {
    stuckSince = null;
    consecutive = 0;
  } else {
    consecutive += 1;
    if (!stuckSince) stuckSince = now.toISOString();
  }

  // Decide whether to send an alert
  let alertSent = false;
  let alertReason = 'no_alert';
  if (status !== 'healthy' && stuckSince) {
    const stuckMs = now.getTime() - new Date(stuckSince).getTime();
    const lastAlert = prev?.last_alert_sent_at
      ? new Date(prev.last_alert_sent_at).getTime()
      : 0;
    const cooldownOk = now.getTime() - lastAlert >= ALERT_COOLDOWN_MS;

    if (stuckMs >= ALERT_AFTER_MS && cooldownOk) {
      alertSent = await sendAlertEmail({
        status: status as 'stuck' | 'down',
        message,
        stuckSince,
        results,
      });
      alertReason = alertSent ? 'sent' : 'send_failed';
    } else if (stuckMs < ALERT_AFTER_MS) {
      alertReason = 'too_soon';
    } else {
      alertReason = 'cooldown';
    }
  }

  // Persist state
  await supabase
    .from('site_health_state')
    .upsert({
      id: 1,
      last_status: status,
      last_message: message,
      stuck_since: stuckSince,
      last_alert_sent_at: alertSent ? now.toISOString() : prev?.last_alert_sent_at ?? null,
      last_checked_at: now.toISOString(),
      consecutive_stuck_count: consecutive,
    });

  return new Response(
    JSON.stringify({
      status,
      message,
      stuckSince,
      consecutiveStuckCount: consecutive,
      alertSent,
      alertReason,
      results,
      checkedAt: now.toISOString(),
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    },
  );
});
