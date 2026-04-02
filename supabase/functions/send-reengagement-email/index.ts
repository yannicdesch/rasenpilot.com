import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { corsHeaders } from '../_shared/cors.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('[RE-ENGAGEMENT] Starting re-engagement email job');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name, first_name');

    if (profilesError || !profiles) {
      console.error('[RE-ENGAGEMENT] Error fetching profiles:', profilesError);
      return new Response(JSON.stringify({ error: 'Failed to fetch profiles' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

    let sentCount = 0;
    let skippedCount = 0;

    for (const profile of profiles) {
      try {
        // Check last analysis date
        const { data: lastAnalysis } = await supabase
          .from('analyses')
          .select('id, score, created_at, step_1')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Skip users who never did an analysis (they get trial emails instead)
        if (!lastAnalysis) {
          skippedCount++;
          continue;
        }

        // Skip users whose last analysis is within 30 days
        if (lastAnalysis.created_at > thirtyDaysAgoISO) {
          skippedCount++;
          continue;
        }

        // Skip users who are not subscribed (no point re-engaging free users)
        const { data: subscriber } = await supabase
          .from('subscribers')
          .select('subscribed')
          .eq('user_id', profile.id)
          .eq('subscribed', true)
          .limit(1)
          .single();

        if (!subscriber) {
          skippedCount++;
          continue;
        }

        // Check if we already sent a re-engagement email in the last 30 days
        const { data: recentReminder } = await supabase
          .from('reminder_logs')
          .select('id')
          .eq('user_id', profile.id)
          .eq('task_type', 'reengagement_30d')
          .gte('sent_at', thirtyDaysAgoISO)
          .limit(1)
          .single();

        if (recentReminder) {
          skippedCount++;
          continue;
        }

        // Calculate days since last analysis
        const lastAnalysisDate = new Date(lastAnalysis.created_at);
        const daysSince = Math.floor((now.getTime() - lastAnalysisDate.getTime()) / (1000 * 60 * 60 * 24));

        // Get user's lawn profile for zip code
        const { data: lawnProfile } = await supabase
          .from('lawn_profiles')
          .select('zip_code')
          .eq('user_id', profile.id)
          .limit(1)
          .single();

        // Get regional average score
        let regionalAvg = 65;
        if (lawnProfile?.zip_code) {
          const regionPrefix = lawnProfile.zip_code.substring(0, 2);
          const { data: regionScores } = await supabase
            .from('lawn_highscores')
            .select('lawn_score')
            .like('zip_code', `${regionPrefix}%`);

          if (regionScores && regionScores.length > 0) {
            regionalAvg = Math.round(
              regionScores.reduce((sum, s) => sum + s.lawn_score, 0) / regionScores.length
            );
          }
        }

        const name = profile.first_name || profile.full_name?.split(' ')[0] || 'Rasenfreund';
        const score = lastAnalysis.score;
        const scoreComparison = score >= regionalAvg
          ? `Dein letzter Score (${score}/100) lag über dem Durchschnitt in deiner Region (${regionalAvg}/100) — aber hat sich dein Rasen seitdem verändert?`
          : `Dein letzter Score war ${score}/100 — der Durchschnitt in deiner Region liegt bei ${regionalAvg}/100. Zeit, das zu verbessern!`;

        const lastAnalysisDateStr = lastAnalysisDate.toLocaleDateString('de-DE', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        });

        const html = generateReengagementHTML({
          name,
          daysSince,
          score,
          lastAnalysisDate: lastAnalysisDateStr,
          scoreComparison,
          step1: lastAnalysis.step_1 || 'Eine neue Analyse starten',
        });

        const subject = `🌱 ${name}, dein Rasen vermisst dich — ${daysSince} Tage seit deiner letzten Analyse`;

        // Send email
        if (RESEND_API_KEY) {
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

          const emailRes = await fetch(gatewayUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              from: 'Rasenpilot <noreply@rasenpilot.com>',
              to: [profile.email],
              subject,
              html,
            }),
          });

          if (!emailRes.ok) {
            const errText = await emailRes.text();
            console.error(`[RE-ENGAGEMENT] Email failed for ${profile.email}:`, errText);
            continue;
          }
        } else {
          console.log(`[RE-ENGAGEMENT] No RESEND_API_KEY, would send to ${profile.email}: ${subject}`);
        }

        // Log that we sent this reminder
        await supabase.from('reminder_logs').insert({
          user_id: profile.id,
          task_type: 'reengagement_30d',
          task_date: now.toISOString().split('T')[0],
          email_sent: true,
        });

        sentCount++;
        console.log(`[RE-ENGAGEMENT] Sent to ${profile.email} (${daysSince} days inactive)`);
      } catch (userErr) {
        console.error(`[RE-ENGAGEMENT] Error processing user ${profile.id}:`, userErr);
      }
    }

    console.log(`[RE-ENGAGEMENT] Done. Sent: ${sentCount}, Skipped: ${skippedCount}`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount, skipped: skippedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[RE-ENGAGEMENT] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateReengagementHTML(d: {
  name: string;
  daysSince: number;
  score: number;
  lastAnalysisDate: string;
  scoreComparison: string;
  step1: string;
}) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1e293b;">
<div style="max-width:560px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">

<!-- Header -->
<div style="background:linear-gradient(135deg,#166534,#22c55e);padding:28px;text-align:center;color:#fff;">
  <div style="font-size:40px;margin-bottom:8px;">🌱</div>
  <div style="font-size:22px;font-weight:700;">Dein Rasen wartet auf dich</div>
  <div style="margin-top:6px;opacity:0.9;font-size:15px;">${d.daysSince} Tage seit deiner letzten Analyse</div>
</div>

<div style="padding:28px;">

  <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">
    Hey ${d.name}! 👋
  </p>

  <p style="font-size:16px;line-height:1.6;margin:0 0 20px;">
    Deine letzte Rasen-Analyse war am <strong>${d.lastAnalysisDate}</strong> — das sind ${d.daysSince} Tage her.
  </p>

  <!-- Score Card -->
  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:20px;margin:0 0 20px;text-align:center;">
    <div style="font-size:14px;color:#166534;font-weight:600;margin-bottom:8px;">DEIN LETZTER SCORE</div>
    <div style="font-size:48px;font-weight:800;color:#166534;">${d.score}<span style="font-size:20px;color:#64748b;">/100</span></div>
    <div style="font-size:14px;color:#475569;margin-top:8px;">${d.scoreComparison}</div>
  </div>

  <p style="font-size:16px;line-height:1.6;margin:0 0 8px;">
    In ${d.daysSince} Tagen kann viel passieren:
  </p>

  <ul style="font-size:15px;line-height:1.8;color:#475569;margin:0 0 20px;padding-left:20px;">
    <li>Neues Moos oder Unkraut?</li>
    <li>Hat die Bewässerung gestimmt?</li>
    <li>Wie hat sich die Dichte verändert?</li>
  </ul>

  <!-- Last tip -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;margin:0 0 24px;">
    <div style="font-size:13px;color:#1d4ed8;font-weight:600;margin-bottom:4px;">💡 DEIN LETZTER TIPP</div>
    <div style="font-size:15px;color:#1e40af;">${d.step1}</div>
  </div>

  <p style="font-size:16px;line-height:1.6;margin:0 0 24px;">
    Mach jetzt ein neues Foto und schau, wie sich dein Score entwickelt hat — dauert nur 30 Sekunden:
  </p>

  <!-- CTA -->
  <div style="text-align:center;margin:0 0 24px;">
    <a href="https://www.rasenpilot.com/lawn-analysis" style="display:inline-block;background:linear-gradient(135deg,#166534,#22c55e);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:700;">
      📸 Jetzt Rasen neu analysieren →
    </a>
  </div>

  <p style="font-size:14px;color:#94a3b8;line-height:1.6;margin:0;">
    Tipp: Fotografiere bei Tageslicht von oben für das beste Ergebnis.
  </p>

</div>

<!-- Footer -->
<div style="background:#f8fafc;padding:20px;text-align:center;border-top:1px solid #e2e8f0;">
  <p style="font-size:14px;color:#64748b;margin:0 0 4px;">— Yannic von Rasenpilot</p>
  <p style="font-size:12px;color:#94a3b8;margin:0;">
    PS: Fragen? Einfach auf diese Email antworten.
  </p>
</div>

</div>
</body></html>`;
}
