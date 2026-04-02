import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { emailLayout, paragraph, ctaButton } from '../_shared/email-template.ts';

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
      return new Response(JSON.stringify({ error: "no_resend_key" }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find users whose trial started 6 days ago
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    const dateStr = sixDaysAgo.toISOString().split("T")[0];

    const { data: trialUsers } = await supabase
      .from("subscribers")
      .select("email, user_id")
      .eq("is_trial", true)
      .gte("trial_start", `${dateStr}T00:00:00`)
      .lte("trial_start", `${dateStr}T23:59:59`);

    console.log(`[TRIAL-DAY6] Found ${trialUsers?.length || 0} users`);

    let sent = 0;
    for (const user of trialUsers || []) {
      let userName = 'Rasenfreund';
      let hasAnalysis = false;
      let score = 0;

      if (user.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, full_name")
          .eq("id", user.user_id)
          .maybeSingle();
        if (profile?.first_name) userName = profile.first_name;
        else if (profile?.full_name) userName = profile.full_name.split(' ')[0];

        const { data: analysis } = await supabase
          .from("analyses")
          .select("score")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysis) {
          hasAnalysis = true;
          score = analysis.score;
        }
      }

      const achievementLine = hasAnalysis
        ? `✅ Rasen analysiert — Score: ${score}/100`
        : '📸 Deine erste Analyse wartet noch auf dich';

      const content = `
        <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:16px;color:#1f2937;line-height:1.6;margin:0 0 16px;">
          Hey <strong>${userName}</strong>!
        </p>
        ${paragraph('<strong>Morgen endet deine kostenlose Testphase.</strong>')}
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#166534;margin:0 0 6px;">Was du bisher erreicht hast:</p>
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:15px;color:#1f2937;line-height:1.6;margin:0;">${achievementLine}</p>
        </div>
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#166534;margin:0 0 10px;">Was du mit Premium behältst:</p>
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#374151;line-height:1.8;margin:0;">
            ✅ Alle deine Analyse-Ergebnisse<br/>
            ✅ Persönlicher Pflegekalender<br/>
            ✅ Wetter-Tipps jeden Montag<br/>
            ✅ PLZ-Ranking mit deinen Nachbarn
          </p>
        </div>
        <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:20px;margin:20px 0;">
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:600;color:#991b1b;margin:0 0 10px;">Was du verlierst wenn du nicht upgradest:</p>
          <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#7f1d1d;line-height:1.8;margin:0;">
            ❌ Keine weiteren Analysen möglich<br/>
            ❌ Pflegekalender wird eingefroren
          </p>
        </div>
        ${ctaButton('Premium behalten — 9,99€/Monat →', 'https://www.rasenpilot.com/subscription')}
        ${paragraph('<span style="font-size:13px;color:#9ca3af;">Jederzeit kündbar. 30 Tage Geld-zurück.</span>')}
        <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:14px;color:#6b7280;margin:24px 0 0;line-height:1.6;">
          — Yannic
        </p>
        <p style="font-family:'Inter','Helvetica Neue',Arial,sans-serif;font-size:13px;color:#9ca3af;margin:12px 0 0;line-height:1.6;">
          PS: Fragen? Einfach auf diese Email antworten.
        </p>
      `;

      const subject = `⏰ Morgen endet dein kostenloser Test, ${userName}`;
      const preheader = hasAnalysis
        ? `Dein Score: ${score}/100 — behalte Premium für 9,99€/Monat`
        : 'Nutze deine letzte Chance für eine kostenlose Analyse';

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
        console.log(`[TRIAL-DAY6] Email to ${user.email} (${hasAnalysis ? 'with' : 'without'} analysis): ${res.status}`);
      } catch (e) {
        console.error(`[TRIAL-DAY6] Failed for ${user.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, found: trialUsers?.length || 0, sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[TRIAL-DAY6] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
