import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const MODEL = "claude-sonnet-4-20250514";
const RECIPIENT = "info@rasenpilot.com";
const FROM = "Rasenpilot Growth <onboarding@resend.dev>";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

async function callClaude(system: string, user: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Claude ${res.status}: ${t}`);
  }
  const json = await res.json();
  return json.content?.[0]?.text ?? "";
}

async function sendEmail(subject: string, html: string) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({ from: FROM, to: [RECIPIENT], subject, html }),
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
}

async function gatherMetrics() {
  const now = new Date();
  const startOfDay = new Date(now); startOfDay.setUTCHours(0, 0, 0, 0);
  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const monthAgo = new Date(now.getTime() - 30 * 86400000);

  const [signupsToday, signupsWeek, expiredTrialsNotConverted, allSubs, activeSubs, eventsRaw, analysesUsers, utmRaw] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", startOfDay.toISOString()),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).lt("trial_end", now.toISOString()).eq("subscribed", false).eq("is_trial", true),
    supabase.from("subscribers").select("id, subscribed, is_trial, trial_end", { count: "exact" }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }).eq("subscribed", true),
    supabase.from("events").select("category, action, label").gte("timestamp", weekAgo.toISOString()).limit(5000),
    supabase.from("analyses").select("user_id").not("user_id", "is", null).limit(10000),
    supabase.from("page_views").select("utm_source, utm_medium").gte("timestamp", monthAgo.toISOString()).limit(10000),
  ]);

  // Top events
  const eventCounts: Record<string, number> = {};
  (eventsRaw.data ?? []).forEach((e: any) => {
    const k = `${e.category}:${e.action}${e.label ? `:${e.label}` : ""}`;
    eventCounts[k] = (eventCounts[k] ?? 0) + 1;
  });
  const topEvents = Object.entries(eventCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ event: k, count: v }));

  // Unique analysis users
  const uniqueAnalysisUsers = new Set((analysesUsers.data ?? []).map((a: any) => a.user_id)).size;

  // Conversion rate
  const trialEnded = (allSubs.data ?? []).filter((s: any) => s.trial_end && new Date(s.trial_end) < now).length;
  const trialConverted = (allSubs.data ?? []).filter((s: any) => s.trial_end && new Date(s.trial_end) < now && s.subscribed).length;
  const conversionRate = trialEnded > 0 ? +(trialConverted / trialEnded * 100).toFixed(1) : 0;

  // UTM aggregation
  const utmCounts: Record<string, number> = {};
  (utmRaw.data ?? []).forEach((p: any) => {
    const k = `${p.utm_source ?? "direct"} / ${p.utm_medium ?? "none"}`;
    utmCounts[k] = (utmCounts[k] ?? 0) + 1;
  });
  const topUtm = Object.entries(utmCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ source: k, count: v }));

  const activeSubsCount = activeSubs.count ?? 0;
  const mrrEstimate = +(activeSubsCount * 9.99).toFixed(2);

  // Feedback metrics (last 30d)
  const dayAgo = new Date(now.getTime() - 86400000);
  const feedbackRes = await supabase
    .from("user_feedback")
    .select("feedback_text, sentiment, topics, created_at, email_subject, user_name")
    .gte("created_at", monthAgo.toISOString())
    .limit(1000);
  const feedback = feedbackRes.data ?? [];

  const sentimentCounts: Record<string, number> = { positive: 0, neutral: 0, negative: 0 };
  const topicCounts: Record<string, number> = {};
  for (const f of feedback) {
    if (f.sentiment) sentimentCounts[f.sentiment] = (sentimentCounts[f.sentiment] ?? 0) + 1;
    for (const t of (f.topics ?? [])) topicCounts[t] = (topicCounts[t] ?? 0) + 1;
  }
  const topTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, v]) => ({ topic: k, count: v }));
  const topExamples = [...feedback]
    .sort((a, b) => (b.feedback_text?.length ?? 0) - (a.feedback_text?.length ?? 0))
    .slice(0, 5)
    .map((f) => ({
      sentiment: f.sentiment,
      topics: f.topics,
      subject: f.email_subject,
      text: (f.feedback_text ?? "").slice(0, 1500),
    }));
  const newFeedback24h = feedback.filter((f: any) => new Date(f.created_at) >= dayAgo).length;

  return {
    signups_today: signupsToday.count ?? 0,
    signups_this_week: signupsWeek.count ?? 0,
    expired_trials_not_converted: expiredTrialsNotConverted.count ?? 0,
    trial_to_paid_conversion_rate_pct: conversionRate,
    top_events_7d: topEvents,
    unique_users_with_analysis: uniqueAnalysisUsers,
    top_utm_sources_30d: topUtm,
    active_subscribers: activeSubsCount,
    mrr_estimate_eur: mrrEstimate,
    feedback_30d: {
      total: feedback.length,
      new_last_24h: newFeedback24h,
      sentiment_counts: sentimentCounts,
      top_topics: topTopics,
      examples: topExamples,
    },
    generated_at: now.toISOString(),
  };
}

const FEEDBACK_AGENT = {
  key: "feedback_analyst",
  name: "Feedback Analyst",
  system: "Du bist UX-Researcher und Customer-Insights-Experte. Du analysierst echtes Nutzer-Feedback und destillierst daraus klare Produktentscheidungen. Sei konkret, zitiere wenn möglich direkt aus dem Feedback.",
  buildUser: (m: any) => `Feedback-Daten (letzte 30 Tage):\n${JSON.stringify(m.feedback_30d, null, 2)}\n\nFrage: Was sagen unsere Nutzer wirklich? Welche 3 Insights aus dem Feedback sollen wir diese Woche umsetzen?`,
};

const AGENTS = [
  {
    key: "product_manager",
    name: "Product Manager",
    system: "Du bist erfahrener Product Manager für eine B2C SaaS App. Analysiere die Daten präzise und gib 3 konkrete, umsetzbare Empfehlungen. Keine Floskeln.",
    buildUser: (m: any) => `Daten:\n${JSON.stringify(m, null, 2)}\n\nFrage: Was sind die 3 wichtigsten Produktprobleme diese Woche und wie lösen wir sie?`,
  },
  {
    key: "marketing",
    name: "Marketing",
    system: "Du bist Growth-Marketing-Experte für Mobile/Web Apps. Fokus auf organisches Wachstum und günstige Kanäle für ein Early-Stage Startup.",
    buildUser: (m: any) => `Daten:\n${JSON.stringify({ utm: m.top_utm_sources_30d, signups_today: m.signups_today, signups_this_week: m.signups_this_week, unique_users_with_analysis: m.unique_users_with_analysis }, null, 2)}\n\nFrage: Welche 3 Marketing-Aktionen bringen diese Woche die meisten neuen Nutzer?`,
  },
  {
    key: "funnel",
    name: "Funnel Experte",
    system: "Du bist Conversion-Optimierungs-Experte. Analysiere wo Nutzer abspringen und gib konkrete Hypothesen zum Testen.",
    buildUser: (m: any) => `Daten:\n${JSON.stringify({ expired_trials_not_converted: m.expired_trials_not_converted, conversion_rate_pct: m.trial_to_paid_conversion_rate_pct, top_events: m.top_events_7d }, null, 2)}\n\nFrage: Wo verlieren wir gerade die meisten Nutzer im Funnel und was testen wir zuerst?`,
  },
  {
    key: "ads_creative",
    name: "Ads & Creative Specialist",
    system: "Du bist Creative Director und Ads-Spezialist für Direct-Response Social Media Ads. Du kennst Rasenpilot: eine KI-App die den Rasen analysiert und Pflegeempfehlungen gibt.",
    buildUser: (m: any) => `Daten:\n${JSON.stringify({ utm: m.top_utm_sources_30d, unique_users_with_analysis: m.unique_users_with_analysis, signups_this_week: m.signups_this_week, active_subscribers: m.active_subscribers }, null, 2)}\n\nFrage: Schreibe 3 konkrete Ad-Hook-Ideen für Instagram/Facebook die wir diese Woche testen sollen. Mit Zielgruppe, Hook-Text und CTA.`,
  },
  {
    key: "revenue",
    name: "Revenue",
    system: "Du bist SaaS Revenue-Experte. Fokus auf MRR-Wachstum, Churn-Reduktion und Upsell für ein Early-Stage Startup.",
    buildUser: (m: any) => `Daten:\n${JSON.stringify({ mrr_eur: m.mrr_estimate_eur, active_subscribers: m.active_subscribers, expired_trials_not_converted: m.expired_trials_not_converted, conversion_rate_pct: m.trial_to_paid_conversion_rate_pct }, null, 2)}\n\nFrage: Was sind die 3 wichtigsten Hebel um den MRR diese Woche zu steigern?`,
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY missing");

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode ?? "daily";

    const metrics = await gatherMetrics();

    // Run 5 agents in parallel
    const agentResults = await Promise.all(
      AGENTS.map(async (a) => {
        try {
          const text = await callClaude(a.system, a.buildUser(metrics));
          return { ...a, text, ok: true as const };
        } catch (e: any) {
          return { ...a, text: `Fehler: ${e.message}`, ok: false as const };
        }
      })
    );

    // Agent 6: Summary
    const summaryUser = `Hier sind 5 Expertenanalysen:\n\n${agentResults
      .map((r) => `### ${r.name}\n${r.text}`)
      .join("\n\n")}\n\nFasse zu EINER täglichen Prioritätenliste mit GENAU 3 Aktionen für heute zusammen. Knapp, konkret, umsetzbar.`;
    const summary = await callClaude(
      "Du bist Chief of Staff. Synthetisiere Expertenmeinungen zu einer klaren, priorisierten Tagesliste. Keine Wiederholungen, keine Floskeln.",
      summaryUser
    );

    // Save all 6 to agent_reports
    const reportType = mode === "weekly" ? "weekly" : "daily";
    const rows = [
      ...agentResults.map((r) => ({
        agent: r.name,
        report_type: reportType,
        content: r.text,
        metrics: metrics,
      })),
      {
        agent: "Daily Summary",
        report_type: reportType,
        content: summary,
        metrics: metrics,
      },
    ];
    await supabase.from("agent_reports").insert(rows);

    const dateStr = new Date().toLocaleDateString("de-DE");

    // Daily briefing email (summary)
    const summaryHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto;">
        <h1 style="color: #007B43;">Rasenpilot Daily Briefing</h1>
        <p style="color: #666;">${dateStr}</p>
        <h2>Top 3 Aktionen für heute</h2>
        <pre style="white-space: pre-wrap; font-family: inherit; background: #DFF0D8; padding: 16px; border-radius: 8px;">${escapeHtml(summary)}</pre>
        <h3>Kennzahlen</h3>
        <ul>
          <li>Signups heute: <b>${metrics.signups_today}</b></li>
          <li>Signups diese Woche: <b>${metrics.signups_this_week}</b></li>
          <li>Aktive Abos: <b>${metrics.active_subscribers}</b></li>
          <li>MRR-Schätzung: <b>${metrics.mrr_estimate_eur} €</b></li>
          <li>Trial→Paid: <b>${metrics.trial_to_paid_conversion_rate_pct}%</b></li>
          <li>Nutzer mit Analyse: <b>${metrics.unique_users_with_analysis}</b></li>
        </ul>
      </div>`;
    await sendEmail(`Rasenpilot Daily Briefing – ${dateStr}`, summaryHtml);

    // Weekly deep dives — only when mode=weekly
    if (mode === "weekly") {
      for (const r of agentResults) {
        const html = `
          <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto;">
            <h1 style="color: #007B43;">${r.name}</h1>
            <p style="color: #666;">${dateStr}</p>
            <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(r.text)}</pre>
          </div>`;
        await sendEmail(`Rasenpilot Weekly Deep Dive – ${r.name}`, html);
      }
    }

    return new Response(
      JSON.stringify({ success: true, mode, metrics, agents: agentResults.length, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("run-growth-agents error", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
