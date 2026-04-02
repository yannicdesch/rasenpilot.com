import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { emailLayout, paragraph, ctaButton, infoCard } from '../_shared/email-template.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendKey = Deno.env.get("RESEND_API_KEY");

    if (!resendKey) {
      console.error("[TRIAL-DAY4] RESEND_API_KEY not set");
      return new Response(JSON.stringify({ error: "no_resend_key" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const isDay6 = body?.day === 6;
    const daysAgo = isDay6 ? 6 : 4;
    const daysRemaining = isDay6 ? 1 : 3;
    const label = isDay6 ? "DAY6" : "DAY4";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysAgo);
    const dateStr = targetDate.toISOString().split("T")[0];

    const { data: trialUsers } = await supabase
      .from("subscribers")
      .select("email, user_id")
      .eq("is_trial", true)
      .gte("trial_start", `${dateStr}T00:00:00`)
      .lte("trial_start", `${dateStr}T23:59:59`);

    console.log(`[TRIAL-${label}] Found ${trialUsers?.length || 0} users`);

    let sent = 0;
    for (const user of trialUsers || []) {
      // Get user name
      let userName = 'Rasenfreund';
      if (user.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, full_name")
          .eq("id", user.user_id)
          .maybeSingle();
        if (profile?.first_name) userName = profile.first_name;
        else if (profile?.full_name) userName = profile.full_name.split(' ')[0];
      }

      // Check if user has done an analysis
      let hasAnalysis = false;
      let score = 0;
      let step1 = '';
      if (user.user_id) {
        const { data: analysis } = await supabase
          .from("analyses")
          .select("score, step_1")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysis) {
          hasAnalysis = true;
          score = analysis.score;
          step1 = analysis.step_1 || 'Regelmäßig bewässern';
        }
      }

      let subject: string;
      let content: string;
      const avgScore = 65;
      const comparison = score >= avgScore ? 'besser als' : 'schlechter als';

      if (hasAnalysis) {
        subject = `${userName}, dein Rasen-Score nach ${daysAgo} Tagen 🌱`;
        content = `
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
            Hey <strong>${userName}</strong>!
          </p>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:20px 0;text-align:center;">
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;">Dein aktueller Rasen-Score</p>
            <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:42px;font-weight:700;color:#16a34a;margin:0;line-height:1;">${score}<span style="font-size:18px;color:#9ca3af;">/100</span></p>
          </div>
          ${paragraph(`Das ist <strong>${comparison}</strong> der Durchschnitt in deiner Region (${avgScore}/100).`)}
          ${infoCard('Dein nächster Schritt laut Pflegeplan', `→ ${step1}`, '📋', '#f0fdf4', '#bbf7d0')}
          ${paragraph('Hast du das schon umgesetzt? In 2-3 Wochen siehst du erste Ergebnisse.')}
          ${ctaButton('Fortschritt jetzt analysieren →', 'https://www.rasenpilot.com/lawn-analysis')}
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;margin:16px 0 0;line-height:1.6;">
            Deine Testphase endet in ${daysRemaining} ${daysRemaining === 1 ? 'Tag' : 'Tagen'}.
          </p>
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
            — Yannic
          </p>
        `;
      } else {
        subject = `${userName}, deine Analyse wartet noch 👀`;
        content = `
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
            Hey <strong>${userName}</strong>!
          </p>
          ${paragraph(`Du hast dich vor ${daysAgo} Tagen angemeldet aber noch keine Analyse gemacht.`)}
          ${paragraph('Das dauert wirklich nur 30 Sekunden:<br/>📸 Foto hochladen → Score erhalten')}
          ${ctaButton('Jetzt Rasen analysieren →', 'https://www.rasenpilot.com/lawn-analysis')}
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;margin:16px 0 0;line-height:1.6;">
            Deine kostenlose Testphase endet in ${daysRemaining} ${daysRemaining === 1 ? 'Tag' : 'Tagen'} — nutze sie!
          </p>
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
            — Yannic
          </p>
        `;
      }

      const preheader = hasAnalysis
        ? `Dein Score: ${score}/100 – ${comparison} der Durchschnitt`
        : 'Nur 30 Sekunden für deine erste Rasenanalyse';

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Yannic von Rasenpilot <noreply@rasenpilot.com>",
            reply_to: "info@rasenpilot.com",
            to: user.email,
            subject,
            html: emailLayout(content, preheader),
          }),
        });
        if (res.ok) sent++;
        console.log(`[TRIAL-${label}] Email to ${user.email} (${hasAnalysis ? 'with' : 'without'} analysis): ${res.status}`);
      } catch (e) {
        console.error(`[TRIAL-${label}] Failed for ${user.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, day: daysAgo, found: trialUsers?.length || 0, sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[TRIAL] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
