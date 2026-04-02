import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[DAILY-STATS] Starting daily stats email');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const recipient = 'yannic.desch@gmail.com';

    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayISO = yesterday.toISOString();
    const todayStr = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // --- NUTZER ---
    const { data: allProfiles } = await supabase.from('profiles').select('id, created_at');
    const totalUsers = allProfiles?.length || 0;
    const newUsersToday = allProfiles?.filter(p => p.created_at >= yesterdayISO).length || 0;

    // --- SUBSCRIPTIONS ---
    const { data: allSubs } = await supabase.from('subscribers').select('id, subscribed, subscription_tier, is_trial, trial_end, created_at');
    const activeTrials = allSubs?.filter(s => s.is_trial && s.trial_end && new Date(s.trial_end) > now).length || 0;
    const premiumCount = allSubs?.filter(s => s.subscribed && s.subscription_tier === 'premium').length || 0;
    const proCount = allSubs?.filter(s => s.subscribed && s.subscription_tier === 'pro').length || 0;
    const totalPaying = premiumCount + proCount;

    // --- MRR ---
    const mrr = ((premiumCount * 999 + proCount * 1999) / 100).toFixed(2);

    // --- ANALYSEN (letzte 24h) ---
    const { data: todayAnalyses } = await supabase
      .from('analyses')
      .select('id, score')
      .gte('created_at', yesterdayISO);
    const analysesToday = todayAnalyses?.length || 0;
    const avgScoreToday = todayAnalyses && todayAnalyses.length > 0
      ? Math.round(todayAnalyses.reduce((sum, a) => sum + a.score, 0) / todayAnalyses.length)
      : 0;

    // --- ANALYSEN gesamt ---
    const { count: totalAnalyses } = await supabase.from('analyses').select('id', { count: 'exact', head: true });

    // --- PAGE VIEWS (letzte 24h) ---
    const { count: pageViewsToday } = await supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('timestamp', yesterdayISO);

    // --- EVENTS (letzte 24h) ---
    const { count: eventsToday } = await supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .gte('timestamp', yesterdayISO);

    // --- NEW USERS LIST ---
    const { data: newUsersList } = await supabase
      .from('profiles')
      .select('email, full_name, created_at')
      .gte('created_at', yesterdayISO)
      .order('created_at', { ascending: false })
      .limit(10);

    // --- TOP PAGES (letzte 24h) ---
    const { data: recentPageViews } = await supabase
      .from('page_views')
      .select('path')
      .gte('timestamp', yesterdayISO)
      .limit(1000);

    const pageCounts: Record<string, number> = {};
    recentPageViews?.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const html = generateDailyStatsHTML({
      todayStr,
      totalUsers,
      newUsersToday,
      activeTrials,
      premiumCount,
      proCount,
      totalPaying,
      mrr,
      analysesToday,
      avgScoreToday,
      totalAnalyses: totalAnalyses || 0,
      pageViewsToday: pageViewsToday || 0,
      eventsToday: eventsToday || 0,
      newUsersList: newUsersList || [],
      topPages,
    });

    const subject = `📈 Rasenpilot Daily Stats — ${todayStr}`;

    await sendEmail({ to: recipient, subject, html });

    console.log('[DAILY-STATS] Email sent successfully');
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[DAILY-STATS] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateDailyStatsHTML(d: any) {
  const newUsersRows = d.newUsersList.length > 0
    ? d.newUsersList.map((u: any) => 
        `<tr><td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;">${u.full_name || '—'}</td><td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;">${u.email}</td><td style="padding:5px 8px;border-bottom:1px solid #e2e8f0;">${new Date(u.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</td></tr>`
      ).join('')
    : '<tr><td colspan="3" style="padding:8px;text-align:center;color:#94a3b8;">Keine neuen Nutzer heute</td></tr>';

  const topPagesRows = d.topPages.length > 0
    ? d.topPages.map(([path, count]: [string, number]) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:13px;">${path}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${count}</td></tr>`
      ).join('')
    : '<tr><td colspan="2" style="padding:8px;text-align:center;color:#94a3b8;">Keine Page Views</td></tr>';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
<div style="max-width:560px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<div style="background:linear-gradient(135deg,#166534,#22c55e);padding:24px;text-align:center;color:#fff;">
  <div style="font-size:24px;font-weight:800;">📈 DAILY STATS</div>
  <div style="margin-top:6px;font-size:14px;opacity:0.9;">${d.todayStr}</div>
</div>

<div style="padding:20px;">

<!-- Quick Numbers -->
<div style="display:flex;text-align:center;margin-bottom:20px;">
  <table style="width:100%;border-collapse:collapse;">
    <tr>
      <td style="padding:12px;background:#f0fdf4;border-radius:8px;width:33%;">
        <div style="font-size:28px;font-weight:800;color:#166534;">${d.totalUsers}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">Nutzer</div>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:12px;background:#eff6ff;border-radius:8px;width:33%;">
        <div style="font-size:28px;font-weight:800;color:#1d4ed8;">${d.mrr}€</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">MRR</div>
      </td>
      <td style="width:8px;"></td>
      <td style="padding:12px;background:#fefce8;border-radius:8px;width:33%;">
        <div style="font-size:28px;font-weight:800;color:#a16207;">${d.analysesToday}</div>
        <div style="font-size:12px;color:#64748b;margin-top:2px;">Analysen heute</div>
      </td>
    </tr>
  </table>
</div>

<!-- Details -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">👥 Nutzer & Abos</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:4px 0;color:#64748b;">Neue Nutzer (24h)</td><td style="padding:4px 0;text-align:right;font-weight:700;color:#16a34a;">+${d.newUsersToday}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Aktive Trials</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.activeTrials}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Premium</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.premiumCount}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Pro</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.proCount}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Zahlende gesamt</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.totalPaying}</td></tr>
  </table>
</div>

<!-- Analysen -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">🔬 Analysen</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:4px 0;color:#64748b;">Heute</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.analysesToday}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Ø Score heute</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.avgScoreToday}/100</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Gesamt</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.totalAnalyses}</td></tr>
  </table>
</div>

<!-- Traffic -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">🌐 Traffic (24h)</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:4px 0;color:#64748b;">Page Views</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.pageViewsToday}</td></tr>
    <tr><td style="padding:4px 0;color:#64748b;">Events</td><td style="padding:4px 0;text-align:right;font-weight:700;">${d.eventsToday}</td></tr>
  </table>
</div>

<!-- Top Pages -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">📄 Top Seiten (24h)</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    ${topPagesRows}
  </table>
</div>

<!-- New Users -->
<div style="margin-bottom:12px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">🆕 Neue Nutzer heute</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    <tr style="background:#f8fafc;"><th style="padding:6px 8px;text-align:left;">Name</th><th style="padding:6px 8px;text-align:left;">Email</th><th style="padding:6px 8px;text-align:left;">Uhrzeit</th></tr>
    ${newUsersRows}
  </table>
</div>

</div>

<!-- Footer -->
<div style="background:#f8fafc;padding:12px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;">
  Rasenpilot Daily Stats — © ${new Date().getFullYear()} Rasenpilot
</div>

</div>
</body></html>`;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.log('[DAILY-STATS] No RESEND_API_KEY, logging email only');
    console.log(`To: ${to}, Subject: ${subject}`);
    return true;
  }

  const gatewayUrl = LOVABLE_API_KEY
    ? 'https://connector-gateway.lovable.dev/resend/emails'
    : 'https://api.resend.com/emails';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (LOVABLE_API_KEY) {
    headers['Authorization'] = `Bearer ${LOVABLE_API_KEY}`;
    headers['X-Connection-Api-Key'] = RESEND_API_KEY;
  } else {
    headers['Authorization'] = `Bearer ${RESEND_API_KEY}`;
  }

  const response = await fetch(gatewayUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      from: 'Rasenpilot <noreply@rasenpilot.com>',
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Email send failed: ${err}`);
  }

  console.log('[DAILY-STATS] Email sent to', to);
  return true;
}
