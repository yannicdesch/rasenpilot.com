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

    // Map all tier variants to pricing
    const premiumTiers = ['monthly', 'premium_monthly', 'premium', 'yearly', 'premium_yearly'];
    const proTiers = ['pro_monthly', 'pro', 'pro_yearly'];
    const activeSubs = allSubs?.filter(s => s.subscribed) || [];
    const premiumCount = activeSubs.filter(s => premiumTiers.includes(s.subscription_tier)).length;
    const proCount = activeSubs.filter(s => proTiers.includes(s.subscription_tier)).length;
    const totalPaying = premiumCount + proCount;

    // --- MRR (monthly recurring revenue) ---
    let mrr = 0;
    activeSubs.forEach(s => {
      const tier = s.subscription_tier;
      if (tier === 'monthly' || tier === 'premium_monthly' || tier === 'premium') mrr += 999;
      else if (tier === 'yearly' || tier === 'premium_yearly') mrr += Math.round(7999 / 12);
      else if (tier === 'pro_monthly' || tier === 'pro') mrr += 1999;
      else if (tier === 'pro_yearly') mrr += Math.round(15999 / 12);
    });
    const mrrDisplay = (mrr / 100).toFixed(2);

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
      .select('path, referrer')
      .gte('timestamp', yesterdayISO)
      .limit(1000);

    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};

    // Map hostnames to friendly channel names
    const channelMap: Record<string, string> = {
      'facebook.com': '📘 Facebook',
      'm.facebook.com': '📘 Facebook',
      'l.facebook.com': '📘 Facebook',
      'lm.facebook.com': '📘 Facebook',
      'instagram.com': '📸 Instagram',
      'l.instagram.com': '📸 Instagram',
      'google.com': '🔍 Google',
      'google.de': '🔍 Google',
      'linkedin.com': '💼 LinkedIn',
      'bing.com': '🔍 Bing',
      'ecosia.org': '🌿 Ecosia',
      'twitter.com': '🐦 Twitter/X',
      'x.com': '🐦 Twitter/X',
      't.co': '🐦 Twitter/X',
      'pinterest.com': '📌 Pinterest',
      'pinterest.de': '📌 Pinterest',
      'youtube.com': '🎬 YouTube',
      'tiktok.com': '🎵 TikTok',
      'reddit.com': '🟠 Reddit',
      'teams.cdn.office.net': '💬 MS Teams',
      'statics.teams.cdn.office.net': '💬 MS Teams',
    };

    const internalDomains = ['rasenpilot', 'lovableproject.com', 'lovable.app', 'lovable.dev'];

    recentPageViews?.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
      if (pv.referrer) {
        try {
          const hostname = new URL(pv.referrer).hostname.replace(/^www\./, '');
          // Skip internal traffic
          if (internalDomains.some(d => hostname.includes(d))) return;
          // Map to friendly name or use hostname
          const channel = channelMap[hostname] || hostname;
          referrerCounts[channel] = (referrerCounts[channel] || 0) + 1;
        } catch { /* ignore invalid URLs */ }
      } else {
        referrerCounts['🔗 Direkt / Kein Referrer'] = (referrerCounts['🔗 Direkt / Kein Referrer'] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    // --- CONVERSION FUNNEL (letzte 24h) ---
    const funnelVisitors = pageViewsToday || 0;
    const funnelAnalysisViews = recentPageViews?.filter(pv => pv.path === '/lawn-analysis').length || 0;
    const funnelAnalysisComplete = analysesToday;
    const funnelRegistered = newUsersToday;
    const funnelSubViews = recentPageViews?.filter(pv => pv.path === '/subscription').length || 0;
    const funnelTrialStarted = allSubs?.filter(s => s.created_at >= yesterdayISO).length || 0;
    const funnelPaid = allSubs?.filter(s => s.subscribed && s.created_at >= yesterdayISO).length || 0;

    // --- CONVERSION FUNNEL (letzte 7 Tage für Vergleich) ---
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();
    
    const { count: weekPageViews } = await supabase
      .from('page_views')
      .select('id', { count: 'exact', head: true })
      .gte('timestamp', weekAgoISO);
    
    const { data: weekPageViewPaths } = await supabase
      .from('page_views')
      .select('path')
      .gte('timestamp', weekAgoISO)
      .in('path', ['/lawn-analysis', '/subscription'])
      .limit(5000);
    
    const weekAnalysisViews = weekPageViewPaths?.filter(pv => pv.path === '/lawn-analysis').length || 0;
    const weekSubViews = weekPageViewPaths?.filter(pv => pv.path === '/subscription').length || 0;
    
    const { count: weekAnalyses } = await supabase
      .from('analyses')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgoISO);
    
    const weekNewUsers = allProfiles?.filter(p => p.created_at >= weekAgoISO).length || 0;
    const weekTrials = allSubs?.filter(s => s.created_at >= weekAgoISO).length || 0;
    const weekPaid = allSubs?.filter(s => s.subscribed && s.created_at >= weekAgoISO).length || 0;

    const html = generateDailyStatsHTML({
      todayStr,
      totalUsers,
      newUsersToday,
      activeTrials,
      premiumCount,
      proCount,
      totalPaying,
      mrr: mrrDisplay,
      analysesToday,
      avgScoreToday,
      totalAnalyses: totalAnalyses || 0,
      pageViewsToday: pageViewsToday || 0,
      eventsToday: eventsToday || 0,
      newUsersList: newUsersList || [],
      topPages,
      topReferrers,
      funnel: {
        visitors: funnelVisitors,
        analysisViews: funnelAnalysisViews,
        analysisComplete: funnelAnalysisComplete,
        registered: funnelRegistered,
        subViews: funnelSubViews,
        trialStarted: funnelTrialStarted,
        paid: funnelPaid,
      },
      funnelWeek: {
        visitors: weekPageViews || 0,
        analysisViews: weekAnalysisViews,
        analysisComplete: weekAnalyses || 0,
        registered: weekNewUsers,
        subViews: weekSubViews,
        trialStarted: weekTrials,
        paid: weekPaid,
      },
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

  const topReferrerRows = d.topReferrers.length > 0
    ? d.topReferrers.map(([source, count]: [string, number]) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${source}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${count}</td></tr>`
      ).join('')
    : '<tr><td colspan="2" style="padding:8px;text-align:center;color:#94a3b8;">Keine Referrer-Daten</td></tr>';

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

<!-- Traffic Sources -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">🔗 Traffic-Quellen (24h)</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;">
    ${topReferrerRows}
  </table>
</div>

<!-- Conversion Funnel -->
${generateFunnelHTML(d.funnel, d.funnelWeek)}

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
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.log('[DAILY-STATS] No RESEND_API_KEY, logging email only');
    console.log(`To: ${to}, Subject: ${subject}`);
    return true;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
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
