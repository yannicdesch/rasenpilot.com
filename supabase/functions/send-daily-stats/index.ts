import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';

// Helper: date ISO string N days ago
const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

// Helper: trend arrow + percentage
const trend = (current: number, previous: number): string => {
  if (previous === 0 && current === 0) return '<span style="color:#94a3b8;">—</span>';
  if (previous === 0) return '<span style="color:#16a34a;">🔥 neu</span>';
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct > 0) return `<span style="color:#16a34a;">▲ +${pct}%</span>`;
  if (pct < 0) return `<span style="color:#dc2626;">▼ ${pct}%</span>`;
  return '<span style="color:#94a3b8;">→ 0%</span>';
};

// Helper: MRR from subscriber list
const premiumTiers = ['monthly', 'premium_monthly', 'premium', 'yearly', 'premium_yearly'];
const proTiers = ['pro_monthly', 'pro', 'pro_yearly'];

const calcMrr = (subs: any[]) => {
  let mrr = 0;
  subs.filter(s => s.subscribed).forEach(s => {
    const t = s.subscription_tier;
    if (t === 'monthly' || t === 'premium_monthly' || t === 'premium') mrr += 999;
    else if (t === 'yearly' || t === 'premium_yearly') mrr += Math.round(7999 / 12);
    else if (t === 'pro_monthly' || t === 'pro') mrr += 1999;
    else if (t === 'pro_yearly') mrr += Math.round(15999 / 12);
  });
  return mrr;
};

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
    const todayStr = now.toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });

    // Time windows
    const t24h = daysAgo(1);
    const t48h = daysAgo(2);
    const t7d = daysAgo(7);
    const t14d = daysAgo(14);
    const t30d = daysAgo(30);
    const t60d = daysAgo(60);

    // ==================== FETCH ALL DATA ====================

    // Profiles
    const { data: allProfiles } = await supabase.from('profiles').select('id, created_at');
    const totalUsers = allProfiles?.length || 0;
    const newUsers24h = allProfiles?.filter(p => p.created_at >= t24h).length || 0;
    const newUsersPrev24h = allProfiles?.filter(p => p.created_at >= t48h && p.created_at < t24h).length || 0;
    const newUsers7d = allProfiles?.filter(p => p.created_at >= t7d).length || 0;
    const newUsersPrev7d = allProfiles?.filter(p => p.created_at >= t14d && p.created_at < t7d).length || 0;
    const newUsers30d = allProfiles?.filter(p => p.created_at >= t30d).length || 0;
    const newUsersPrev30d = allProfiles?.filter(p => p.created_at >= t60d && p.created_at < t30d).length || 0;

    // Subscribers
    const { data: allSubs } = await supabase.from('subscribers').select('id, email, subscribed, subscription_tier, is_trial, trial_end, created_at, updated_at');
    const activeSubs = allSubs?.filter(s => s.subscribed) || [];
    const activeTrials = allSubs?.filter(s => s.is_trial && s.trial_end && new Date(s.trial_end) > now).length || 0;
    const premiumCount = activeSubs.filter(s => premiumTiers.includes(s.subscription_tier)).length;
    const proCount = activeSubs.filter(s => proTiers.includes(s.subscription_tier)).length;
    const totalPaying = premiumCount + proCount;

    // MRR
    const currentMrr = calcMrr(allSubs || []);

    // Churns (subscribed=false but had a stripe_customer_id, updated in last 7d)
    const recentChurns = allSubs?.filter(s => !s.subscribed && s.subscription_tier && s.updated_at >= t7d).length || 0;

    // Expired trials (trial ended in last 7d, not converted)
    const expiredTrials = allSubs?.filter(s => s.is_trial && s.trial_end && new Date(s.trial_end) < now && s.trial_end >= t7d && !s.subscribed).length || 0;

    // Conversion rate: signups last 30d → became subscriber
    const signups30d = allProfiles?.filter(p => p.created_at >= t30d).length || 0;
    const subsFrom30d = allSubs?.filter(s => s.created_at >= t30d).length || 0;
    const convRate = signups30d > 0 ? Math.round((subsFrom30d / signups30d) * 100) : 0;

    // Trial → Paid conversion (all time)
    const totalTrialsEver = allSubs?.filter(s => s.trial_end).length || 0;
    const trialConverted = allSubs?.filter(s => s.trial_end && s.subscribed).length || 0;
    const trialConvRate = totalTrialsEver > 0 ? Math.round((trialConverted / totalTrialsEver) * 100) : 0;

    // Analyses — today, yesterday, 7d, prev 7d, 30d, prev 30d
    const { data: allAnalyses } = await supabase.from('analyses').select('id, score, created_at').order('created_at', { ascending: false }).limit(1000);
    const analysesToday = allAnalyses?.filter(a => a.created_at >= t24h).length || 0;
    const analysesYesterday = allAnalyses?.filter(a => a.created_at >= t48h && a.created_at < t24h).length || 0;
    const analyses7d = allAnalyses?.filter(a => a.created_at >= t7d).length || 0;
    const analysesPrev7d = allAnalyses?.filter(a => a.created_at >= t14d && a.created_at < t7d).length || 0;
    const analyses30d = allAnalyses?.filter(a => a.created_at >= t30d).length || 0;
    const analysesPrev30d = allAnalyses?.filter(a => a.created_at >= t60d && a.created_at < t30d).length || 0;
    const totalAnalyses = allAnalyses?.length || 0;

    const todayScores = allAnalyses?.filter(a => a.created_at >= t24h) || [];
    const avgScoreToday = todayScores.length > 0
      ? Math.round(todayScores.reduce((s, a) => s + a.score, 0) / todayScores.length)
      : 0;
    const allTimeAvg = allAnalyses && allAnalyses.length > 0
      ? Math.round(allAnalyses.reduce((s, a) => s + a.score, 0) / allAnalyses.length)
      : 0;

    // Analyses per user (engagement depth)
    const analysesPerUser = totalUsers > 0 ? (totalAnalyses / totalUsers).toFixed(1) : '0';

    // Page Views — today, yesterday, 7d, prev 7d
    const { data: recentPVs } = await supabase.from('page_views').select('id, path, referrer, timestamp').gte('timestamp', t14d).limit(1000);
    const pvToday = recentPVs?.filter(p => p.timestamp >= t24h).length || 0;
    const pvYesterday = recentPVs?.filter(p => p.timestamp >= t48h && p.timestamp < t24h).length || 0;
    const pv7d = recentPVs?.filter(p => p.timestamp >= t7d).length || 0;
    const pvPrev7d = recentPVs?.filter(p => p.timestamp >= t14d && p.timestamp < t7d).length || 0;

    // Top pages & referrers (24h)
    const todayPVs = recentPVs?.filter(p => p.timestamp >= t24h) || [];
    const pageCounts: Record<string, number> = {};
    const referrerCounts: Record<string, number> = {};
    todayPVs.forEach(pv => {
      pageCounts[pv.path] = (pageCounts[pv.path] || 0) + 1;
      if (pv.referrer) {
        try {
          const hostname = new URL(pv.referrer).hostname.replace(/^www\./, '');
          if (!hostname.includes('rasenpilot')) {
            referrerCounts[hostname] = (referrerCounts[hostname] || 0) + 1;
          }
        } catch { /* skip */ }
      } else {
        referrerCounts['(direkt)'] = (referrerCounts['(direkt)'] || 0) + 1;
      }
    });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topReferrers = Object.entries(referrerCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

    // Events (24h)
    const { count: eventsToday } = await supabase.from('events').select('id', { count: 'exact', head: true }).gte('timestamp', t24h);

    // New users list
    const { data: newUsersList } = await supabase.from('profiles').select('email, full_name, created_at').gte('created_at', t24h).order('created_at', { ascending: false }).limit(10);

    // ==================== BUILD HTML ====================
    const html = generateHTML({
      todayStr,
      // Hero KPIs
      totalUsers, currentMrr, totalPaying, analysesToday,
      // User trends
      newUsers24h, newUsersPrev24h, newUsers7d, newUsersPrev7d, newUsers30d, newUsersPrev30d,
      // Subscriptions
      activeTrials, premiumCount, proCount, recentChurns, expiredTrials,
      convRate, trialConvRate,
      // Analyses trends
      analysesYesterday, analyses7d, analysesPrev7d, analyses30d, analysesPrev30d,
      totalAnalyses, avgScoreToday, allTimeAvg, analysesPerUser,
      // Traffic trends
      pvToday, pvYesterday, pv7d, pvPrev7d, eventsToday: eventsToday || 0,
      // Tables
      topPages, topReferrers, newUsersList: newUsersList || [],
    });

    const subject = `📈 Daily Report — ${totalPaying} zahlende, ${(currentMrr / 100).toFixed(0)}€ MRR, +${newUsers24h} Nutzer — ${todayStr}`;

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

// ==================== HTML TEMPLATE ====================

function generateHTML(d: any) {
  const mrrEur = (d.currentMrr / 100).toFixed(2);

  const row = (label: string, value: string | number, trendHtml?: string) =>
    `<tr>
      <td style="padding:5px 0;color:#64748b;font-size:14px;">${label}</td>
      <td style="padding:5px 0;text-align:right;font-weight:700;font-size:14px;">${value}</td>
      ${trendHtml ? `<td style="padding:5px 0;text-align:right;font-size:12px;width:80px;">${trendHtml}</td>` : ''}
    </tr>`;

  const sectionHeader = (emoji: string, title: string) =>
    `<div style="font-size:15px;font-weight:700;color:#166534;margin-bottom:8px;padding-bottom:6px;border-bottom:2px solid #dcfce7;">${emoji} ${title}</div>`;

  const newUsersRows = d.newUsersList.length > 0
    ? d.newUsersList.map((u: any) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${u.full_name || '—'}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${u.email}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:12px;">${new Date(u.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</td></tr>`
      ).join('')
    : '<tr><td colspan="3" style="padding:8px;text-align:center;color:#94a3b8;font-size:13px;">Keine neuen Nutzer</td></tr>';

  const topPagesRows = d.topPages.length > 0
    ? d.topPages.map(([path, count]: [string, number]) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-family:monospace;font-size:12px;">${path}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:13px;">${count}</td></tr>`
      ).join('')
    : '<tr><td colspan="2" style="padding:8px;text-align:center;color:#94a3b8;">—</td></tr>';

  const topReferrerRows = d.topReferrers.length > 0
    ? d.topReferrers.map(([source, count]: [string, number]) =>
        `<tr><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${source}</td><td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;text-align:right;font-weight:700;font-size:13px;">${count}</td></tr>`
      ).join('')
    : '<tr><td colspan="2" style="padding:8px;text-align:center;color:#94a3b8;">—</td></tr>';

  // Alert banner for problems
  const alerts: string[] = [];
  if (d.recentChurns > 0) alerts.push(`⚠️ ${d.recentChurns} Churn(s) in den letzten 7 Tagen`);
  if (d.expiredTrials > 0) alerts.push(`⏰ ${d.expiredTrials} Trial(s) ohne Conversion abgelaufen`);
  if (d.analysesToday === 0 && d.analysesYesterday === 0) alerts.push(`🔴 Keine Analysen seit 48h`);
  if (d.pvToday < d.pvYesterday * 0.5 && d.pvYesterday > 10) alerts.push(`📉 Traffic-Einbruch: ${d.pvToday} vs ${d.pvYesterday} gestern`);

  const alertBanner = alerts.length > 0
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;margin-bottom:16px;">
        <div style="font-weight:700;color:#991b1b;font-size:14px;margin-bottom:4px;">🚨 Alerts</div>
        ${alerts.map(a => `<div style="color:#dc2626;font-size:13px;padding:2px 0;">${a}</div>`).join('')}
      </div>`
    : '';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
<div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<div style="background:linear-gradient(135deg,#0f4c2e,#16a34a);padding:24px;text-align:center;color:#fff;">
  <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;opacity:0.7;">Rasenpilot</div>
  <div style="font-size:22px;font-weight:800;margin-top:4px;">📈 DAILY GROWTH REPORT</div>
  <div style="margin-top:6px;font-size:13px;opacity:0.85;">${d.todayStr}</div>
</div>

<div style="padding:20px;">

<!-- Alert Banner -->
${alertBanner}

<!-- Hero KPIs -->
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
  <tr>
    <td style="padding:14px 8px;background:#f0fdf4;border-radius:8px;text-align:center;width:25%;">
      <div style="font-size:26px;font-weight:800;color:#166534;">${d.totalUsers}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Nutzer</div>
      <div style="font-size:11px;margin-top:4px;">${trend(d.newUsers24h, d.newUsersPrev24h)}</div>
    </td>
    <td style="width:6px;"></td>
    <td style="padding:14px 8px;background:#eff6ff;border-radius:8px;text-align:center;width:25%;">
      <div style="font-size:26px;font-weight:800;color:#1d4ed8;">${mrrEur}€</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">MRR</div>
      <div style="font-size:11px;margin-top:4px;">${d.totalPaying} zahlend</div>
    </td>
    <td style="width:6px;"></td>
    <td style="padding:14px 8px;background:#fefce8;border-radius:8px;text-align:center;width:25%;">
      <div style="font-size:26px;font-weight:800;color:#a16207;">${d.analysesToday}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Analysen</div>
      <div style="font-size:11px;margin-top:4px;">${trend(d.analysesToday, d.analysesYesterday)}</div>
    </td>
    <td style="width:6px;"></td>
    <td style="padding:14px 8px;background:#faf5ff;border-radius:8px;text-align:center;width:25%;">
      <div style="font-size:26px;font-weight:800;color:#7c3aed;">${d.pvToday}</div>
      <div style="font-size:11px;color:#64748b;margin-top:2px;">Views</div>
      <div style="font-size:11px;margin-top:4px;">${trend(d.pvToday, d.pvYesterday)}</div>
    </td>
  </tr>
</table>

<!-- GROWTH: Nutzer -->
<div style="margin-bottom:18px;">
  ${sectionHeader('📈', 'Nutzer-Wachstum')}
  <table style="width:100%;border-collapse:collapse;">
    <tr style="font-size:11px;color:#94a3b8;text-transform:uppercase;">
      <td style="padding:4px 0;">Zeitraum</td><td style="padding:4px 0;text-align:right;">Neu</td><td style="padding:4px 0;text-align:right;width:80px;">vs. Vorperiode</td>
    </tr>
    ${row('Heute (24h)', `+${d.newUsers24h}`, trend(d.newUsers24h, d.newUsersPrev24h))}
    ${row('Diese Woche (7d)', `+${d.newUsers7d}`, trend(d.newUsers7d, d.newUsersPrev7d))}
    ${row('Dieser Monat (30d)', `+${d.newUsers30d}`, trend(d.newUsers30d, d.newUsersPrev30d))}
    ${row('Gesamt', d.totalUsers)}
  </table>
</div>

<!-- REVENUE: Abos & MRR -->
<div style="margin-bottom:18px;">
  ${sectionHeader('💰', 'Revenue & Subscriptions')}
  <table style="width:100%;border-collapse:collapse;">
    ${row('MRR', `${mrrEur} €`)}
    ${row('Premium (monatl./jährl.)', d.premiumCount)}
    ${row('Pro (monatl./jährl.)', d.proCount)}
    ${row('Zahlende gesamt', d.totalPaying)}
    ${row('Aktive Trials', d.activeTrials)}
    ${row('Churns (7d)', d.recentChurns > 0 ? `<span style="color:#dc2626;font-weight:700;">${d.recentChurns}</span>` : '0')}
    ${row('Abgelaufene Trials (7d)', d.expiredTrials > 0 ? `<span style="color:#f59e0b;">${d.expiredTrials}</span>` : '0')}
  </table>
</div>

<!-- CONVERSION FUNNEL -->
<div style="margin-bottom:18px;">
  ${sectionHeader('🎯', 'Conversion Funnel')}
  <table style="width:100%;border-collapse:collapse;">
    ${row('Signup → Trial/Abo (30d)', `${d.convRate}%`)}
    ${row('Trial → Paid (gesamt)', `${d.trialConvRate}%`)}
  </table>
</div>

<!-- ANALYSEN -->
<div style="margin-bottom:18px;">
  ${sectionHeader('🔬', 'Analysen (Kern-Feature)')}
  <table style="width:100%;border-collapse:collapse;">
    <tr style="font-size:11px;color:#94a3b8;text-transform:uppercase;">
      <td style="padding:4px 0;">Zeitraum</td><td style="padding:4px 0;text-align:right;">Anzahl</td><td style="padding:4px 0;text-align:right;width:80px;">vs. Vorperiode</td>
    </tr>
    ${row('Heute', d.analysesToday, trend(d.analysesToday, d.analysesYesterday))}
    ${row('Diese Woche (7d)', d.analyses7d, trend(d.analyses7d, d.analysesPrev7d))}
    ${row('Dieser Monat (30d)', d.analyses30d, trend(d.analyses30d, d.analysesPrev30d))}
    ${row('Gesamt', d.totalAnalyses)}
    ${row('Ø Score heute', d.avgScoreToday > 0 ? `${d.avgScoreToday}/100` : '—')}
    ${row('Ø Score gesamt', `${d.allTimeAvg}/100`)}
    ${row('Analysen pro Nutzer', d.analysesPerUser)}
  </table>
</div>

<!-- TRAFFIC -->
<div style="margin-bottom:18px;">
  ${sectionHeader('🌐', 'Traffic & Engagement')}
  <table style="width:100%;border-collapse:collapse;">
    <tr style="font-size:11px;color:#94a3b8;text-transform:uppercase;">
      <td style="padding:4px 0;">Zeitraum</td><td style="padding:4px 0;text-align:right;">Views</td><td style="padding:4px 0;text-align:right;width:80px;">vs. Vorperiode</td>
    </tr>
    ${row('Heute', d.pvToday, trend(d.pvToday, d.pvYesterday))}
    ${row('Diese Woche (7d)', d.pv7d, trend(d.pv7d, d.pvPrev7d))}
    ${row('Events heute', d.eventsToday)}
  </table>
</div>

<!-- TOP PAGES -->
<div style="margin-bottom:18px;">
  ${sectionHeader('📄', 'Top Seiten (24h)')}
  <table style="width:100%;border-collapse:collapse;">
    ${topPagesRows}
  </table>
</div>

<!-- TRAFFIC SOURCES -->
<div style="margin-bottom:18px;">
  ${sectionHeader('🔗', 'Traffic-Quellen (24h)')}
  <table style="width:100%;border-collapse:collapse;">
    ${topReferrerRows}
  </table>
</div>

<!-- NEW USERS -->
<div style="margin-bottom:12px;">
  ${sectionHeader('🆕', 'Neue Nutzer heute')}
  <table style="width:100%;border-collapse:collapse;">
    <tr style="background:#f8fafc;font-size:12px;text-transform:uppercase;color:#94a3b8;">
      <th style="padding:6px 8px;text-align:left;">Name</th><th style="padding:6px 8px;text-align:left;">Email</th><th style="padding:6px 8px;text-align:left;">Uhrzeit</th>
    </tr>
    ${newUsersRows}
  </table>
</div>

</div>

<!-- Footer -->
<div style="background:#f8fafc;padding:12px;text-align:center;color:#94a3b8;font-size:11px;border-top:1px solid #e2e8f0;">
  Rasenpilot Daily Growth Report · ▲ = besser als Vorperiode · ▼ = schlechter<br>
  © ${new Date().getFullYear()} Rasenpilot
</div>

</div>
</body></html>`;
}

// ==================== EMAIL SENDER ====================

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
