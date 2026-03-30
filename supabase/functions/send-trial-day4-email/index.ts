import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

    // Find subscribers who started trial exactly 3-4 days ago (send on day 4)
    const now = new Date();
    const fourDaysAgo = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    const { data: trialUsers, error } = await supabase
      .from("subscribers")
      .select("email, trial_start, user_id")
      .eq("is_trial", true)
      .eq("subscribed", true)
      .gte("trial_start", fourDaysAgo.toISOString())
      .lte("trial_start", threeDaysAgo.toISOString());

    if (error) {
      console.error("[TRIAL-DAY4] Query error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`[TRIAL-DAY4] Found ${trialUsers?.length || 0} users for Day 4 email`);

    let sent = 0;
    for (const user of trialUsers || []) {
      // Get latest analysis for user if available
      let analysisInfo = "";
      if (user.user_id) {
        const { data: analysis } = await supabase
          .from("analyses")
          .select("score, summary_short")
          .eq("user_id", user.user_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (analysis) {
          analysisInfo = `
            <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin:16px 0;">
              <p style="font-weight:bold;color:#16a34a;margin:0 0 8px;">Dein letztes Analyse-Ergebnis:</p>
              <p style="font-size:24px;font-weight:bold;margin:0;">Score: ${analysis.score}/100</p>
              ${analysis.summary_short ? `<p style="color:#666;margin:8px 0 0;">${analysis.summary_short}</p>` : ""}
            </div>
          `;
        }
      }

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
            html: `
              <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
                <h2 style="color:#16a34a;">Dein Rasen-Fortschritt 📊</h2>
                <p>Du bist jetzt seit <strong>4 Tagen</strong> Premium-Mitglied bei Rasenpilot.</p>
                ${analysisInfo || `
                  <div style="background:#fffbeb;border-radius:12px;padding:16px;margin:16px 0;">
                    <p style="font-weight:bold;color:#d97706;margin:0 0 8px;">📸 Du hast noch keine Analyse gemacht!</p>
                    <p style="margin:0;">Lade jetzt ein Foto deines Rasens hoch und erhalte deinen personalisierten Pflegeplan.</p>
                  </div>
                `}
                <p><strong>Diese Premium-Features warten auf dich:</strong></p>
                <ul style="padding-left:20px;">
                  <li style="margin:6px 0;">🔍 Detaillierte Teilbewertungen (Dichte, Boden, Feuchtigkeit)</li>
                  <li style="margin:6px 0;">📅 Persönlicher Pflegekalender mit Wetter-Daten</li>
                  <li style="margin:6px 0;">📈 Fortschritts-Tracking über mehrere Analysen</li>
                  <li style="margin:6px 0;">💬 Unbegrenzte KI-Beratung für alle Rasenfragen</li>
                </ul>
                <p><a href="https://www.rasenpilot.com/lawn-analysis" style="background:#16a34a;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;font-weight:bold;">Neue Analyse starten →</a></p>
                <p style="color:#999;font-size:13px;margin-top:24px;">Deine Testphase endet in 3 Tagen. Danach wird dein Abo automatisch aktiviert.</p>
                <p style="color:#666;font-size:14px;">Viele Grüße,<br/>Dein Rasenpilot-Team 🌿</p>
              </div>
            `,
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
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
