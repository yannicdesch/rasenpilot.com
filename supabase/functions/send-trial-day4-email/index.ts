import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { emailLayout, greeting, paragraph, heading, scoreDisplay, featureList, ctaButton, infoCard, signoff } from '../_shared/email-template.ts';

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

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find users who started trial 4 days ago
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
    const dateStr = fourDaysAgo.toISOString().split("T")[0];

    const { data: trialUsers } = await supabase
      .from("subscribers")
      .select("email, user_id")
      .eq("is_trial", true)
      .gte("trial_start", `${dateStr}T00:00:00`)
      .lte("trial_start", `${dateStr}T23:59:59`);

    console.log(`[TRIAL-DAY4] Found ${trialUsers?.length || 0} users for Day 4 email`);

    let sent = 0;
    for (const user of trialUsers || []) {
      let analysisContent = "";
      if (user.user_id) {
        const { data: analysis } = await supabase
          .from("analyses")
          .select("score, summary_short")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysis) {
          analysisContent = scoreDisplay(analysis.score, analysis.summary_short || undefined);
        }
      }

      if (!analysisContent) {
        analysisContent = infoCard(
          'Noch keine Analyse gemacht',
          'Lade jetzt ein Foto deines Rasens hoch und erhalte deinen personalisierten Pflegeplan – nur als Premium-Mitglied.',
          '📸',
          '#fffbeb',
          '#fde68a'
        );
      }

      const content = `
        ${greeting('Rasenfreund')}
        ${paragraph('Du bist jetzt seit <strong>4 Tagen</strong> Premium-Mitglied bei Rasenpilot. Hier ist dein Fortschritt:')}
        ${analysisContent}
        ${heading('Diese Premium-Features warten auf dich')}
        ${featureList([
          { icon: '🔍', text: '<strong>Detaillierte Teilbewertungen</strong> – Dichte, Boden, Feuchtigkeit & Sonnenlicht' },
          { icon: '📅', text: '<strong>Persönlicher Pflegekalender</strong> mit Wetter-Daten' },
          { icon: '📈', text: '<strong>Fortschritts-Tracking</strong> über mehrere Analysen' },
          { icon: '💬', text: '<strong>Unbegrenzte KI-Beratung</strong> für alle Rasenfragen' },
        ])}
        ${ctaButton('Neue Analyse starten →', 'https://www.rasenpilot.com/lawn-analysis')}
        ${paragraph('<span style="color:#9ca3af;font-size:13px;">Deine Testphase endet in 3 Tagen. Danach wird dein Abo automatisch aktiviert.</span>')}
        ${signoff()}
      `;

      const emailHtml = emailLayout(content, 'Dein Rasen-Fortschritt nach 4 Tagen Premium');

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Rasenpilot <noreply@rasenpilot.com>",
            to: user.email,
            subject: "🌱 Dein Rasen-Fortschritt – So geht's weiter",
            html: emailHtml,
          }),
        });
        if (res.ok) sent++;
        console.log(`[TRIAL-DAY4] Email to ${user.email}: ${res.status}`);
      } catch (e) {
        console.error(`[TRIAL-DAY4] Failed for ${user.email}:`, e);
      }
    }

    return new Response(
      JSON.stringify({ success: true, found: trialUsers?.length || 0, sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[TRIAL-DAY4] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
