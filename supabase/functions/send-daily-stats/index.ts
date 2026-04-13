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

    // Time ranges
    const days7ago = new Date(now);
    days7ago.setDate(days7ago.getDate() - 7);
    const days7agoISO = days7ago.toISOString();

    const days30ago = new Date(now);
    days30ago.setDate(days30ago.getDate() - 30);
    const days30agoISO = days30ago.toISOString();

    // --- NUTZER ---
    const { data: allProfiles } = await supabase.from('profiles').select('id, created_at');
    const totalUsers = allProfiles?.length || 0;
    const newUsersToday = allProfiles?.filter(p => p.created_at >= yesterdayISO).length || 0;
    const newUsers7d = allProfiles?.filter(p => p.created_at >= days7agoISO).length || 0;
    const newUsers30d = allProfiles?.filter(p => p.created_at >= days30agoISO).length || 0;

    // --- SUBSCRIPTIONS ---
    const { data: allSubs } = await supabase.from('subscribers').select('id, subscribed, subscription_tier, is_trial, trial_end, created_at');
    const activeTrials = allSubs?.filter(s => s.is_trial && s.trial_end && new Date(s.trial_end) > now).length || 0;

    const premiumTiers = ['monthly', 'premium_monthly', 'premium', 'yearly', 'premium_yearly'];
    const proTiers = ['pro_monthly', 'pro', 'pro_yearly'];
    const activeSubs = allSubs?.filter(s => s.subscribed) || [];
    const premiumCount = activeSubs.filter(s => premiumTiers.includes(s.subscription_tier)).length;
    const proCount = activeSubs.filter(s => proTiers.includes(s.subscription_tier)).length;
    const totalPaying = premiumCount + proCount;

    const newSubs24h = allSubs?.filter(s => s.created_at >= yesterdayISO).length || 0;
    const newSubs7d = allSubs?.filter(s => s.created_at >= days7agoISO).length || 0;
    const newSubs30d = allSubs?.filter(s => s.created_at >= days30agoISO).length || 0;

    // --- MRR ---
    let mrr = 0;
    activeSubs.forEach(s => {
      const tier = s.subscription_tier;
      if (tier === 'monthly' || tier === 'premium_monthly' || tier === 'premium') mrr += 999;
      else if (tier === 'yearly' || tier === 'premium_yearly') mrr += Math.round(7999 / 12);
      else if (tier === 'pro_monthly' || tier === 'pro') mrr += 1999;
      else if (tier === 'pro_yearly') mrr += Math.round(15999 / 12);
    });
    const mrrDisplay = (mrr / 100).toFixed(2);

    // --- ANALYSEN (from analysis_jobs to include anonymous users) ---
    const { data: todayJobs } = await supabase.from('analysis_jobs').select('id, result, created_at').eq('status', 'completed').gte('created_at', yesterdayISO);
    const analysesToday = todayJobs?.length || 0;
    const avgScoreToday = todayJobs && todayJobs.length > 0
      ? Math.round(todayJobs.reduce((sum, j) => {
          const score = j.result && typeof j.result === 'object' ? (j.result as any).score || 0 : 0;
          return sum + score;
        }, 0) / todayJobs.length) : 0;

    const { data: jobs7d } = await supabase.from('analysis_jobs').select('id').eq('status', 'completed').gte('created_at', days7agoISO);
    const analysesCount7d = jobs7d?.length || 0;

    const { data: jobs30d } = await supabase.from('analysis_jobs').select('id').eq('status', 'completed').gte('created_at', days30agoISO);
    const analysesCount30d = jobs30d?.length || 0;

    const { count: totalAnalyses } = await supabase.from('analysis_jobs').select('id', { count: 'exact', head: true }).eq('status', 'completed');

    // --- PAGE VIEWS ---
    const { count: pageViewsToday } = await supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', yesterdayISO);
    const { count: pageViews7d } = await supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', days7agoISO);
    const { count: pageViews30d } = await supabase.from('page_views').select('id', { count: 'exact', head: true }).gte('timestamp', days30agoISO);

    // --- EVENTS ---
    const { count: eventsToday } = await supabase.from('events').select('id', { count: 'exact', head: true }).gte('timestamp', yesterdayISO);

    // --- NEW USERS LIST ---
    const { data: newUsersList } = await supabase
      .from('profiles')
      .select('email, full_name, created_at')
      .gte('created_at', yesterdayISO)
      .order('created_at', { ascending: false })
      .limit(10);

    // --- PAGE VIEWS for funnel & referrers (24h) ---
    const { data: recentPageViews } = await supabase
      .from('page_views')
      .select('path, referrer, utm_source, utm_medium, utm_campaign')
      .gte('timestamp', yesterdayISO)
      .limit(2000);

    // --- PAGE VIEWS for funnel (7d) ---
    const { data: pageViews7dData } = await supabase
      .from('page_views')
      .select('path, utm_source, utm_medium, utm_campaign')
      .gte('timestamp', days7agoISO)
      .limit(5000);

    // --- PAGE VIEWS for funnel (30d) ---
    const { data: pageViews30dData } = await supabase
      .from('page_views')
      .select('path, utm_source, utm_medium, utm_campaign')
      .gte('timestamp', days30agoISO)
      .limit(10000);

    // Channel mapping
    const channelMap: Record<string, string> = {
      'facebook.com': '📘 Facebook', 'm.facebook.com': '📘 Facebook',
      'l.facebook.com': '📘 Facebook', 'lm.facebook.com': '📘 Facebook',
      'instagram.com': '📸 Instagram', 'l.instagram.com': '📸 Instagram',
      'google.com': '🔍 Google', 'google.de': '🔍 Google',
      'linkedin.com': '💼 LinkedIn', 'bing.com': '🔍 Bing',
      'ecosia.org': '🌿 Ecosia', 'twitter.com': '🐦 Twitter/X',
      'x.com': '🐦 Twitter/X', 't.co': '🐦 Twitter/X',
      'pinterest.com': '📌 Pinterest', 'pinterest.de': '📌 Pinterest',
      'youtube.com': '🎬 YouTube', 'tiktok.com': '🎵 TikTok',
      'reddit.com': '🟠 Reddit', 'teams.cdn.office.net': '💬 MS Teams',
      'statics.teams.cdn.office.net': '💬 MS Teams',
    };
    const internalDomains = ['rasenpilot', 'lovableproject.com', 'lovable.app', 'lovable.dev'];

    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};

    recentPageViews?.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
      if (pv.referrer) {
        try {
          const hostname = new URL(pv.referrer).hostname.replace(/^www\./, '');
          if (internalDomains.some(d => hostname.includes(d))) return;
          const channel = channelMap[hostname] || hostname;
          referrerCounts[channel] = (referrerCounts[channel] || 0) + 1;
        } catch { /* ignore */ }
      } else {
        referrerCounts['🔗 Direkt / Kein Referrer'] = (referrerCounts['🔗 Direkt / Kein Referrer'] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // --- UTM CHANNEL CONVERSIONS (7d) ---
    const buildUtmConversions = (pvData: any[] | null) => {
      if (!pvData || pvData.length === 0) return [];
      const channels: Record<string, { views: number; analyses: number; campaigns: Set<string> }> = {};
      pvData.forEach(pv => {
        const source = pv.utm_source;
        if (!source) return;
        const key = `${source}/${pv.utm_medium || 'none'}`;
        if (!channels[key]) channels[key] = { views: 0, analyses: 0, campaigns: new Set() };
        channels[key].views++;
        if (pv.path === '/lawn-analysis') channels[key].analyses++;
        if (pv.utm_campaign) channels[key].campaigns.add(pv.utm_campaign);
      });
      return Object.entries(channels)
        .map(([key, data]) => ({
          channel: key,
          views: data.views,
          analyses: data.analyses,
          convRate: data.views > 0 ? (data.analyses / data.views * 100).toFixed(1) : '0',
          campaigns: Array.from(data.campaigns).slice(0, 3).join(', '),
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);
    };

    const utmConversions7d = buildUtmConversions(pageViews7dData);
    const utmConversions24h = buildUtmConversions(recentPageViews);

    // --- FUNNEL DATA ---
    const buildFunnel = (pvData: any[] | null, pvCount: number, analysesCount: number, newUsers: number, newSubscriptions: number) => {
      const analysisViews = pvData?.filter(pv => pv.path === '/lawn-analysis').length || 0;
      const subViews = pvData?.filter(pv => pv.path === '/subscription').length || 0;
      return { visitors: pvCount, analysisViews, analysesCompleted: analysesCount, registered: newUsers, subViews, converted: newSubscriptions };
    };

    const funnel24h = buildFunnel(recentPageViews, pageViewsToday || 0, analysesToday, newUsersToday, newSubs24h);
    const funnel7d = buildFunnel(pageViews7dData, pageViews7d || 0, analysesCount7d, newUsers7d, newSubs7d);
    const funnel30d = buildFunnel(pageViews30dData, pageViews30d || 0, analysesCount30d, newUsers30d, newSubs30d);

    const html = generateDailyStatsHTML({
      todayStr, totalUsers, newUsersToday, activeTrials, premiumCount, proCount, totalPaying,
      mrr: mrrDisplay, analysesToday, avgScoreToday, totalAnalyses: totalAnalyses || 0,
      pageViewsToday: pageViewsToday || 0, eventsToday: eventsToday || 0,
      newUsersList: newUsersList || [], topPages, topReferrers,
      funnel24h, funnel7d, funnel30d,
      utmConversions24h, utmConversions7d,
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

function funnelRate(from: number, to: number): string {
  if (from === 0) return '0%';
  const rate = Math.min(to / from * 100, 100);
  return rate.toFixed(1) + '%';
}

function funnelBarWidth(value: number, max: number): number {
  if (max === 0) return 0;
  return Math.max(4, Math.round(value / max * 100));
}

function generateFunnelHTML(label: string, f: any): string {
  const steps = [
    { name: '👁 Besucher', value: f.visitors },
    { name: '🔬 Analyse-Seite', value: f.analysisViews },
    { name: '✅ Analyse fertig', value: f.analysesCompleted },
    { name: '📝 Registriert', value: f.registered },
    { name: '💳 Abo-Seite', value: f.subViews },
    { name: '🎯 Converted', value: f.converted },
  ];
  const max = steps[0].value || 1;
  const overallRate = funnelRate(f.visitors, f.converted);

  let rows = '';
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const w = funnelBarWidth(s.value, max);
    const convRate = i > 0 ? funnelRate(steps[i-1].value, s.value) : '';
    const isLow = i > 0 && steps[i-1].value > 0 && (s.value / steps[i-1].value) < 0.05;
    const rateColor = isLow ? '#dc2626' : '#64748b';
    const rateIcon = isLow ? ' ⚠️' : '';

    rows += `<tr>
      <td style="padding:3px 6px;font-size:12px;white-space:nowrap;color:#334155;">${s.name}</td>
      <td style="padding:3px 6px;width:100%;">
        <div style="background:#dcfce7;border-radius:4px;height:18px;width:${w}%;min-width:20px;display:flex;align-items:center;padding:0 6px;">
          <span style="font-size:11px;font-weight:700;color:#166534;">${s.value}</span>
        </div>
      </td>
      <td style="padding:3px 6px;font-size:11px;color:${rateColor};white-space:nowrap;text-align:right;">${convRate}${rateIcon}</td>
    </tr>`;
  }

  return `<div style="margin-bottom:16px;">
    <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:6px;">${label}  <span style="font-weight:400;color:#94a3b8;font-size:12px;">Visitor→Paid: ${overallRate}</span></div>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
  </div>`;
}

function generateDailyStatsHTML(d: any) {
  // UTM Conversions table
  const buildUtmRows = (utmData: any[], label: string) => {
    if (!utmData || utmData.length === 0) {
      return `<div style="margin-bottom:12px;">
        <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">${label}</div>
        <div style="padding:8px;text-align:center;color:#94a3b8;font-size:13px;">Keine UTM-Daten — nutze Links mit ?utm_source=...</div>
      </div>`;
    }
    const rows = utmData.map((u: any) => 
      `<tr>
        <td style="padding:4px 6px;border-bottom:1px solid #f1f5f9;font-size:12px;">${u.channel}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;">${u.views}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #f1f5f9;text-align:right;">${u.analyses}</td>
        <td style="padding:4px 6px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;color:${parseFloat(u.convRate) > 10 ? '#16a34a' : parseFloat(u.convRate) < 3 ? '#dc2626' : '#64748b'};">${u.convRate}%</td>
        <td style="padding:4px 6px;border-bottom:1px solid #f1f5f9;font-size:11px;color:#94a3b8;max-width:100px;overflow:hidden;text-overflow:ellipsis;">${u.campaigns || '—'}</td>
      </tr>`
    ).join('');
    return `<div style="margin-bottom:12px;">
      <div style="font-size:13px;font-weight:700;color:#475569;margin-bottom:4px;">${label}</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="background:#f8fafc;">
          <th style="padding:4px 6px;text-align:left;font-size:11px;color:#94a3b8;">Quelle/Medium</th>
          <th style="padding:4px 6px;text-align:right;font-size:11px;color:#94a3b8;">Views</th>
          <th style="padding:4px 6px;text-align:right;font-size:11px;color:#94a3b8;">Analysen</th>
          <th style="padding:4px 6px;text-align:right;font-size:11px;color:#94a3b8;">Conv%</th>
          <th style="padding:4px 6px;text-align:left;font-size:11px;color:#94a3b8;">Kampagne</th>
        </tr>
        ${rows}
      </table>
    </div>`;
  };

  const utmSection = buildUtmRows(d.utmConversions24h, '📊 Letzte 24h') + buildUtmRows(d.utmConversions7d, '📊 Letzte 7 Tage');

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

  const funnelSection = `
    ${generateFunnelHTML('📊 Letzte 24 Stunden', d.funnel24h)}
    ${generateFunnelHTML('📊 Letzte 7 Tage', d.funnel7d)}
    ${generateFunnelHTML('📊 Letzte 30 Tage', d.funnel30d)}
  `;

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

<!-- Conversion Funnel -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">🔄 Conversion Funnel</div>
  ${funnelSection}
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

<!-- UTM Conversions -->
<div style="margin-bottom:18px;">
  <div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">📊 Conversions pro UTM-Quelle</div>
  ${utmSection}
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
