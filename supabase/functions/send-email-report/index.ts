import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { recipient, isTest = false } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // Week number
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    const dateRange = `${weekAgo.toLocaleDateString('de-DE')} — ${now.toLocaleDateString('de-DE')}`;

    // --- NUTZER ---
    const { data: allProfiles } = await supabase.from('profiles').select('id, created_at');
    const totalUsers = allProfiles?.length || 0;
    const newUsers = allProfiles?.filter(p => p.created_at >= weekAgoISO).length || 0;

    const { data: allSubs } = await supabase.from('subscribers').select('id, subscribed, subscription_tier, is_trial, trial_end, subscription_end, created_at');
    
    const activeTrials = allSubs?.filter(s => s.is_trial && s.trial_end && new Date(s.trial_end) > now).length || 0;
    const premiumCount = allSubs?.filter(s => s.subscribed && s.subscription_tier === 'premium').length || 0;
    const proCount = allSubs?.filter(s => s.subscribed && s.subscription_tier === 'pro').length || 0;
    
    // Churns: subscriptions that ended this week
    const churns = allSubs?.filter(s => {
      if (!s.subscription_end) return false;
      const endDate = new Date(s.subscription_end);
      return endDate >= weekAgo && endDate <= now && !s.subscribed;
    }).length || 0;

    // --- UMSATZ ---
    const premiumPrice = 999; // 9.99€ in cents
    const proPrice = 1999; // 19.99€ in cents
    const mrr = ((premiumCount * premiumPrice + proCount * proPrice) / 100).toFixed(2);
    const newSubscriptions = allSubs?.filter(s => s.subscribed && s.created_at >= weekAgoISO).length || 0;
    const cancelledSubscriptions = churns;
    const mrrGrowth = (((newSubscriptions - cancelledSubscriptions) * premiumPrice) / 100).toFixed(2);

    // --- ANALYSEN ---
    const { data: weeklyAnalyses } = await supabase
      .from('analyses')
      .select('id, score')
      .gte('created_at', weekAgoISO);
    
    const weeklyAnalysesCount = weeklyAnalyses?.length || 0;
    const avgScore = weeklyAnalyses && weeklyAnalyses.length > 0
      ? Math.round(weeklyAnalyses.reduce((sum, a) => sum + a.score, 0) / weeklyAnalyses.length)
      : 0;

    const { data: allAnalyses } = await supabase.from('analyses').select('id');
    const totalAnalyses = allAnalyses?.length || 0;

    // --- EMAILS ---
    // Try to count reminder_logs as proxy for sent emails
    const { data: emailLogs } = await supabase
      .from('reminder_logs')
      .select('id')
      .gte('sent_at', weekAgoISO);
    const emailsSent = emailLogs?.length || 0;

    // --- ORPHANED ---
    const { data: orphaned } = await supabase
      .from('orphaned_subscriptions')
      .select('id')
      .eq('resolved', false);
    const orphanedCount = orphaned?.length || 0;

    // --- NEW USERS LIST ---
    const { data: newUsersList } = await supabase
      .from('profiles')
      .select('email, full_name, created_at')
      .gte('created_at', weekAgoISO)
      .order('created_at', { ascending: false })
      .limit(20);

    const emailHtml = generateWeeklyReportHTML({
      isTest,
      weekNumber,
      dateRange,
      totalUsers,
      newUsers,
      activeTrials,
      premiumCount,
      proCount,
      churns,
      mrr,
      newSubscriptions,
      cancelledSubscriptions,
      mrrGrowth,
      weeklyAnalyses: weeklyAnalysesCount,
      totalAnalyses,
      avgScore,
      emailsSent,
      orphanedCount,
      newUsersList: newUsersList || [],
    });

    const subject = isTest
      ? `[TEST] 📊 Rasenpilot Weekly Report — KW ${weekNumber}`
      : `📊 Rasenpilot Weekly Report — KW ${weekNumber} (${dateRange})`;

    await sendEmail({ to: recipient, subject, html: emailHtml });

    // Update lastSent
    if (!isTest) {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('id, email_reports')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();

        if (settings?.id) {
          await supabase
            .from('site_settings')
            .update({ email_reports: { ...settings.email_reports, lastSent: now.toISOString() } })
            .eq('id', settings.id);
        }
      } catch (err) {
        console.error('[WEEKLY-REPORT] Error updating lastSent:', err);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[WEEKLY-REPORT] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateWeeklyReportHTML(d: any) {
  const testBanner = d.isTest
    ? `<div style="background:#FEF3C7;padding:12px;margin-bottom:20px;border-left:4px solid #F59E0B;font-weight:bold;">⚠️ Dies ist eine Test-E-Mail.</div>`
    : '';

  const newUsersRows = d.newUsersList.length > 0
    ? d.newUsersList.map((u: any) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${u.full_name || '—'}</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${u.email}</td><td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${new Date(u.created_at).toLocaleDateString('de-DE')}</td></tr>`).join('')
    : '<tr><td colspan="3" style="padding:8px;text-align:center;color:#94a3b8;">Keine neuen Nutzer diese Woche</td></tr>';

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
<div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

${testBanner}

<!-- Header -->
<div style="background:linear-gradient(135deg,#166534,#22c55e);padding:30px;text-align:center;color:#fff;">
  <div style="font-size:28px;font-weight:800;">📊 RASENPILOT WEEKLY REPORT</div>
  <div style="margin-top:8px;font-size:16px;opacity:0.9;">Woche ${d.weekNumber} — ${d.dateRange}</div>
</div>

<div style="padding:24px;">

<!-- NUTZER -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">👥 NUTZER</div>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#64748b;">Gesamt</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.totalUsers}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Neu diese Woche</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#16a34a;">+${d.newUsers}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Aktive Trials</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.activeTrials}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Premium Abos</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.premiumCount}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Pro Abos</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.proCount}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Churns diese Woche</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#dc2626;">${d.churns}</td></tr>
  </table>
</div>

<!-- UMSATZ -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">💰 UMSATZ</div>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#64748b;">MRR</td><td style="padding:6px 0;text-align:right;font-weight:700;font-size:18px;">${d.mrr}€</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Neue Abos</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#16a34a;">+${d.newSubscriptions}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Verlorene Abos</td><td style="padding:6px 0;text-align:right;font-weight:700;color:#dc2626;">${d.cancelledSubscriptions}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Netto MRR Wachstum</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.mrrGrowth}€</td></tr>
  </table>
</div>

<!-- ANALYSEN -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">🔬 ANALYSEN</div>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#64748b;">Analysen diese Woche</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.weeklyAnalyses}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Analysen gesamt</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.totalAnalyses}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Durchschnittlicher Score</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.avgScore}/100</td></tr>
  </table>
</div>

<!-- SEO -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">🔍 SEO</div>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#64748b;">Organische Klicks (7 Tage)</td><td style="padding:6px 0;text-align:right;color:#94a3b8;font-style:italic;">[manual]</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Top Keyword</td><td style="padding:6px 0;text-align:right;color:#94a3b8;font-style:italic;">[manual]</td></tr>
  </table>
</div>

<!-- EMAILS -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">📧 EMAILS (letzte Woche)</div>
  <table style="width:100%;border-collapse:collapse;">
    <tr><td style="padding:6px 0;color:#64748b;">Versendete Emails</td><td style="padding:6px 0;text-align:right;font-weight:700;">${d.emailsSent}</td></tr>
    <tr><td style="padding:6px 0;color:#64748b;">Verwaiste Abos</td><td style="padding:6px 0;text-align:right;font-weight:700;${d.orphanedCount > 0 ? 'color:#dc2626;' : ''}">${d.orphanedCount}</td></tr>
  </table>
</div>

<!-- CRON JOBS -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">⚙️ CRON JOBS STATUS</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr><td style="padding:4px 0;">care-reminders</td><td style="padding:4px 0;text-align:right;">✅ läuft (05:30 UTC)</td></tr>
    <tr><td style="padding:4px 0;">weekly-weather-tips</td><td style="padding:4px 0;text-align:right;">✅ läuft (05:00 UTC Mo)</td></tr>
    <tr><td style="padding:4px 0;">trial-day4-email</td><td style="padding:4px 0;text-align:right;">✅ läuft (07:00 UTC)</td></tr>
    <tr><td style="padding:4px 0;">trial-day6-email</td><td style="padding:4px 0;text-align:right;">✅ läuft (08:00 UTC)</td></tr>
    <tr><td style="padding:4px 0;">check-score-overtaken</td><td style="padding:4px 0;text-align:right;">✅ läuft (*/30)</td></tr>
    <tr><td style="padding:4px 0;">weekly-report</td><td style="padding:4px 0;text-align:right;">✅ läuft (06:00 UTC Mo)</td></tr>
  </table>
</div>

<!-- NEUE NUTZER -->
<div style="margin-bottom:24px;">
  <div style="font-size:18px;font-weight:700;color:#166534;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #dcfce7;">🆕 Neue Nutzer diese Woche</div>
  <table style="width:100%;border-collapse:collapse;font-size:14px;">
    <tr style="background:#f8fafc;"><th style="padding:8px;text-align:left;">Name</th><th style="padding:8px;text-align:left;">Email</th><th style="padding:8px;text-align:left;">Datum</th></tr>
    ${newUsersRows}
  </table>
</div>

</div>

<!-- Footer -->
<div style="background:#f8fafc;padding:16px;text-align:center;color:#94a3b8;font-size:13px;border-top:1px solid #e2e8f0;">
  Rasenpilot Weekly Report — © ${new Date().getFullYear()} Rasenpilot
</div>

</div>
</body></html>`;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

  if (!RESEND_API_KEY) {
    console.log('[WEEKLY-REPORT] No RESEND_API_KEY, logging email only');
    console.log(`To: ${to}, Subject: ${subject}, HTML length: ${html.length}`);
    return true;
  }

  const gatewayUrl = LOVABLE_API_KEY
    ? 'https://connector-gateway.lovable.dev/resend/emails'
    : 'https://api.resend.com/emails';

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

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
    console.error('[WEEKLY-REPORT] Email send failed:', err);
    throw new Error(`Email send failed: ${err}`);
  }

  console.log('[WEEKLY-REPORT] Email sent successfully to', to);
  return true;
}
