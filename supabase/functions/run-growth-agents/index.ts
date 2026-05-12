import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type AgentResult = {
  agent: string;
  content: string;
  metrics?: Record<string, unknown>;
};

// ───────────────────────────────────────────────
// Agent stubs — TODO: hier die echte Logik einbauen
// ───────────────────────────────────────────────
async function agent1_traffic(supabase: any): Promise<AgentResult> {
  const { count } = await supabase
    .from("page_views")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", new Date(Date.now() - 7 * 86400000).toISOString());
  return {
    agent: "agent_1_traffic",
    content: `Traffic-Bericht (7 Tage): ${count ?? 0} Page Views.`,
    metrics: { page_views_7d: count ?? 0 },
  };
}

async function agent2_conversion(supabase: any): Promise<AgentResult> {
  const { count: analyses } = await supabase
    .from("analysis_jobs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());
  return {
    agent: "agent_2_conversion",
    content: `Conversion-Bericht: ${analyses ?? 0} Analysen in den letzten 7 Tagen.`,
    metrics: { analyses_7d: analyses ?? 0 },
  };
}

async function agent3_retention(supabase: any): Promise<AgentResult> {
  const { count: subs } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("subscribed", true);
  return {
    agent: "agent_3_retention",
    content: `Retention-Bericht: ${subs ?? 0} aktive Abonnenten.`,
    metrics: { active_subscribers: subs ?? 0 },
  };
}

async function agent4_content(supabase: any): Promise<AgentResult> {
  const { count: posts } = await supabase
    .from("blog_posts")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  return {
    agent: "agent_4_content",
    content: `Content-Bericht: ${posts ?? 0} veröffentlichte Blog-Posts.`,
    metrics: { published_posts: posts ?? 0 },
  };
}

async function agent5_revenue(supabase: any): Promise<AgentResult> {
  const { count: trials } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("is_trial", true);
  return {
    agent: "agent_5_revenue",
    content: `Revenue-Bericht: ${trials ?? 0} laufende Trials.`,
    metrics: { active_trials: trials ?? 0 },
  };
}

async function agent6_summary(individualReports: AgentResult[]): Promise<AgentResult> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  const fallback = individualReports.map((r) => `• ${r.content}`).join("\n");

  if (!lovableApiKey) {
    return {
      agent: "agent_6_summary",
      content: `Wöchentliche Zusammenfassung:\n${fallback}`,
      metrics: { agent_count: individualReports.length },
    };
  }

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "Du bist ein Growth-Analyst für Rasenpilot. Fasse die Einzelberichte in 4-6 Sätzen auf Deutsch (Du-Form) zusammen, hebe Trends und Handlungsempfehlungen hervor.",
          },
          { role: "user", content: fallback },
        ],
      }),
    });
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || fallback;
    return {
      agent: "agent_6_summary",
      content,
      metrics: { agent_count: individualReports.length },
    };
  } catch (e) {
    console.error("[AGENT-6] AI summary failed, using fallback:", e);
    return {
      agent: "agent_6_summary",
      content: `Zusammenfassung:\n${fallback}`,
      metrics: { agent_count: individualReports.length },
    };
  }
}

// ───────────────────────────────────────────────
// Email helper
// ───────────────────────────────────────────────
async function sendReportEmail(subject: string, html: string) {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    console.log("[EMAIL] No RESEND_API_KEY, skipping email");
    return;
  }
  const recipient = Deno.env.get("ADMIN_EMAIL") || "info@rasenpilot.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Growth Bot <noreply@rasenpilot.com>",
      to: recipient,
      subject,
      html,
    }),
  });
  console.log(`[EMAIL] ${subject} → ${res.status}`);
}

function reportToHtml(r: AgentResult): string {
  return `
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:12px 0;">
      <h3 style="margin:0 0 8px;color:#166534;font-family:sans-serif;">${r.agent}</h3>
      <p style="margin:0;white-space:pre-wrap;font-family:sans-serif;color:#1f2937;line-height:1.6;">${r.content}</p>
    </div>
  `;
}

// ───────────────────────────────────────────────
// Main handler
// ───────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const mode: "daily" | "weekly" = body?.mode === "weekly" ? "weekly" : "daily";
    const reportType = mode;

    console.log(`[GROWTH-AGENTS] Starting in mode: ${mode}`);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Always run agents 1-5 to feed the summary
    const individualReports: AgentResult[] = await Promise.all([
      agent1_traffic(supabase),
      agent2_conversion(supabase),
      agent3_retention(supabase),
      agent4_content(supabase),
      agent5_revenue(supabase),
    ]);

    const summary = await agent6_summary(individualReports);

    // Persist all reports
    const allReports = [...individualReports, summary].map((r) => ({
      agent: r.agent,
      report_type: reportType,
      content: r.content,
      metrics: r.metrics ?? null,
    }));
    const { error: insertErr } = await supabase.from("agent_reports").insert(allReports);
    if (insertErr) console.error("[GROWTH-AGENTS] Insert error:", insertErr);

    // Email logic
    if (mode === "daily") {
      // Daily → only summary
      await sendReportEmail(
        `📊 Daily Growth Summary — ${new Date().toLocaleDateString("de-DE")}`,
        reportToHtml(summary)
      );
    } else {
      // Weekly → all 5 individual + summary
      const html =
        `<h2 style="font-family:sans-serif;color:#166534;">Wöchentlicher Growth-Report</h2>` +
        reportToHtml(summary) +
        `<h3 style="font-family:sans-serif;color:#166534;margin-top:24px;">Einzelberichte</h3>` +
        individualReports.map(reportToHtml).join("");
      await sendReportEmail(
        `📈 Weekly Growth Report — KW ${getWeekNumber(new Date())}`,
        html
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        mode,
        reports_generated: allReports.length,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("[GROWTH-AGENTS] Error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}
