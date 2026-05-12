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

const LOVABLE_PROMPT_SUFFIX = `

Schreibe am Ende deiner Antwort einen fertigen Prompt unter der Überschrift '## Lovable Prompt'. Dieser Prompt soll direkt in Lovable eingefügt werden können um die empfohlene Änderung umzusetzen. Der Prompt soll:
- Konkret und technisch präzise sein
- Den bestehenden Tech-Stack erwähnen (Supabase, Resend, React, TypeScript)
- Die genaue Tabelle, Edge Function oder UI-Komponente nennen die geändert werden soll
- Mit 'In meiner Rasenpilot App:' beginnen`;

function splitReportAndPrompt(text: string): { content: string; lovable_prompt: string | null } {
  const marker = /^#{1,6}\s*Lovable Prompt\s*$/im;
  const match = text.match(marker);
  if (!match || match.index === undefined) return { content: text.trim(), lovable_prompt: null };
  const before = text.slice(0, match.index).trim();
  const after = text.slice(match.index + match[0].length).trim();
  return { content: before, lovable_prompt: after || null };
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

    // Lern-Schritt: lade umgesetzte Optimierungen der letzten 4 Wochen
    const fourWeeksAgo = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 10);
    const { data: pastOpts } = await supabase
      .from("optimization_queue")
      .select("week_start, agent, title, impact_score, expected_metric, result_metric, status, allow_repeat, repeat_justification")
      .in("status", ["approved", "done"])
      .gte("week_start", fourWeeksAgo)
      .order("week_start", { ascending: false });

    // Split into BLOCKED (no repeats allowed) and ALLOWED-REPEAT (admin justified)
    const blockedOpts = (pastOpts ?? []).filter((o: any) => !o.allow_repeat);
    const allowedRepeatOpts = (pastOpts ?? []).filter((o: any) => o.allow_repeat && o.repeat_justification);

    const formatOpt = (o: any) =>
      `- [${o.week_start}] (${o.agent}, Impact ${o.impact_score ?? "—"}/10) ${o.title}` +
      (o.expected_metric ? ` | erwartet: ${o.expected_metric}` : "") +
      (o.result_metric ? ` | tatsächlich: ${o.result_metric}` : " | Ergebnis noch offen");

    let learningContext = "";
    if (blockedOpts.length > 0) {
      learningContext += `\n\n🚫 GESPERRTE THEMEN (bereits umgesetzt – DU DARFST DIESE NICHT ERNEUT VORSCHLAGEN):\n${blockedOpts.map(formatOpt).join("\n")}\n\nHARTE REGEL: Schlage KEINE Optimierung vor, die thematisch, funktional oder vom Titel her einer dieser Einträge gleicht. Auch keine Varianten, Erweiterungen oder "verbesserten Versionen". Wenn dir nichts Neues einfällt, schlage explizit weniger als 3 Aktionen vor – aber NIEMALS Duplikate.`;
    }
    if (allowedRepeatOpts.length > 0) {
      learningContext += `\n\n✅ ERNEUT ERLAUBT (Admin hat Wiederholung freigegeben mit Begründung):\n${allowedRepeatOpts.map((o: any) => `${formatOpt(o)}\n  → Begründung: ${o.repeat_justification}`).join("\n")}\n\nDiese Themen darfst du erneut vorschlagen, MUSST aber in deinem Vorschlag explizit auf die Begründung des Admins eingehen und erklären, was dieses Mal anders ist.`;
    }
    if (pastOpts && pastOpts.length > 0) {
      learningContext += `\n\nBerücksichtige zusätzlich, was in den Ergebnissen funktioniert hat und was nicht.`;
    }

    // Build a normalized blocklist for server-side filtering of CPO output
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9äöüß ]+/g, " ").replace(/\s+/g, " ").trim();
    const blockedTitles = blockedOpts.map((o: any) => normalize(o.title));


    // Decide if Feedback Analyst runs:
    // - weekly: always
    // - daily: only when new feedback came in last 24h
    const includeFeedback = mode === "weekly" || (metrics.feedback_30d?.new_last_24h ?? 0) > 0;
    const agentsToRun = includeFeedback ? [...AGENTS, FEEDBACK_AGENT] : AGENTS;

    // Run agents in parallel
    const agentResults = await Promise.all(
      agentsToRun.map(async (a) => {
        try {
          const text = await callClaude(a.system, a.buildUser(metrics) + learningContext + LOVABLE_PROMPT_SUFFIX);
          const { content, lovable_prompt } = splitReportAndPrompt(text);
          return { ...a, text, content, lovable_prompt, ok: true as const };
        } catch (e: any) {
          return { ...a, text: `Fehler: ${e.message}`, content: `Fehler: ${e.message}`, lovable_prompt: null, ok: false as const };
        }
      })
    );

    // Agent 6 (Orchestrator): Summary — includes feedback agent if present
    const summaryUser = `Hier sind ${agentResults.length} Expertenanalysen:\n\n${agentResults
      .map((r) => `### ${r.name}\n${r.content}`)
      .join("\n\n")}\n\nFasse zu EINER täglichen Prioritätenliste mit GENAU 3 Aktionen für heute zusammen. Berücksichtige explizit die Nutzer-Feedback-Insights wenn vorhanden. Knapp, konkret, umsetzbar.` + LOVABLE_PROMPT_SUFFIX;
    const summaryRaw = await callClaude(
      "Du bist Chief of Staff. Synthetisiere Expertenmeinungen (inkl. echtem Nutzer-Feedback) zu einer klaren, priorisierten Tagesliste. Keine Wiederholungen, keine Floskeln.",
      summaryUser
    );
    const { content: summary, lovable_prompt: summaryPrompt } = splitReportAndPrompt(summaryRaw);

    // Save all to agent_reports
    const reportType = mode === "weekly" ? "weekly" : "daily";
    const rows = [
      ...agentResults.map((r) => ({
        agent: r.name,
        report_type: reportType,
        content: r.content,
        lovable_prompt: r.lovable_prompt,
        metrics: metrics,
      })),
      {
        agent: "Daily Summary",
        report_type: reportType,
        content: summary,
        lovable_prompt: summaryPrompt,
        metrics: metrics,
      },
    ];
    await supabase.from("agent_reports").insert(rows);

    // Final Orchestrator (CPO): pick Top 3 optimizations of the week → optimization_queue
    let top3: any[] = [];
    try {
      const reportsForCpo = agentResults.map((r) => ({
        agent: r.name,
        report: r.content,
        lovable_prompt: r.lovable_prompt,
      }));
      const cpoRaw = await callClaude(
        "Du bist Chief Product Officer. Du bekommst die Agenten-Reports und wählst die 3 Änderungen mit dem höchsten Impact für Rasenpilot diese Woche. HARTE REGEL: Du darfst KEINE Optimierung vorschlagen, die einem bereits umgesetzten Eintrag aus der Sperrliste entspricht – außer der Admin hat sie explizit zur Wiederholung freigegeben (mit Begründung). Lieber weniger als 3 Vorschläge als ein Duplikat.",
        `Hier sind die Reports als JSON:\n${JSON.stringify(reportsForCpo, null, 2)}\n${learningContext}\n\nAntworte AUSSCHLIESSLICH mit einem validen JSON-Array (keine Markdown-Codeblöcke, kein Text drumherum) mit MAXIMAL 3 Objekten:\n[{"title":"kurzer Titel","agent":"welcher Agent empfiehlt das","impact_score":1-10,"expected_metric":"was verbessert sich konkret","lovable_prompt":"fertiger Lovable-Prompt"}]`
      );
      const jsonMatch = cpoRaw.match(/\[[\s\S]*\]/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : cpoRaw);
      if (Array.isArray(parsed)) top3 = parsed.slice(0, 3);

      // Server-side guard: drop any proposal whose title overlaps a blocked title
      const isBlocked = (title: string) => {
        const t = normalize(title);
        if (!t) return false;
        return blockedTitles.some((b) => {
          if (!b) return false;
          if (t === b || t.includes(b) || b.includes(t)) return true;
          // token overlap >= 60%
          const ts = new Set(t.split(" ").filter((w) => w.length > 3));
          const bs = b.split(" ").filter((w) => w.length > 3);
          if (bs.length === 0 || ts.size === 0) return false;
          const overlap = bs.filter((w) => ts.has(w)).length;
          return overlap / Math.max(ts.size, bs.length) >= 0.6;
        });
      };
      const beforeCount = top3.length;
      top3 = top3.filter((o: any) => !isBlocked(String(o?.title ?? "")));
      if (beforeCount !== top3.length) {
        console.log(`CPO blocklist filter removed ${beforeCount - top3.length} duplicate(s)`);
      }

      // Monday of this week (UTC)
      const monday = new Date();
      const diff = (monday.getUTCDay() + 6) % 7;
      monday.setUTCDate(monday.getUTCDate() - diff);
      monday.setUTCHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().slice(0, 10);

      if (top3.length > 0) {
        const queueRows = top3.map((o: any) => ({
          week_start: weekStart,
          agent: String(o.agent ?? "Orchestrator").slice(0, 200),
          title: String(o.title ?? "Untitled").slice(0, 500),
          impact_score: Math.max(1, Math.min(10, parseInt(o.impact_score, 10) || 5)),
          expected_metric: o.expected_metric ? String(o.expected_metric) : null,
          lovable_prompt: String(o.lovable_prompt ?? ""),
          status: "pending",
        }));
        const { error: qErr } = await supabase.from("optimization_queue").insert(queueRows);
        if (qErr) console.error("optimization_queue insert error", qErr);
      }
    } catch (e) {
      console.error("CPO orchestrator failed", e);
    }

    const dateStr = new Date().toLocaleDateString("de-DE");

    // Build Lovable-prompt boxes for each agent (top 3 priority actions)
    const promptBoxes = agentResults
      .slice(0, 3)
      .map((r) => {
        if (!r.lovable_prompt) return "";
        return `
          <div style="margin: 12px 0 24px;">
            <div style="font-weight: 600; color: #007B43; margin-bottom: 6px;">${escapeHtml(r.name)} → Direkt in Lovable einfügen</div>
            <pre style="white-space: pre-wrap; font-family: ui-monospace, monospace; background: #F1F3F5; color: #212529; padding: 14px; border-radius: 8px; border: 1px solid #DEE2E6; font-size: 13px; line-height: 1.5;">${escapeHtml(r.lovable_prompt)}</pre>
          </div>`;
      })
      .join("");

    // Daily briefing email (summary)
    const summaryHtml = `
      <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto;">
        <h1 style="color: #007B43;">Rasenpilot Daily Briefing</h1>
        <p style="color: #666;">${dateStr}</p>
        <h2>Top 3 Aktionen für heute</h2>
        <pre style="white-space: pre-wrap; font-family: inherit; background: #DFF0D8; padding: 16px; border-radius: 8px;">${escapeHtml(summary)}</pre>
        <h2 style="margin-top: 32px;">Lovable-Prompts zu den Top-Aktionen</h2>
        ${promptBoxes || '<p style="color:#666;">Keine Prompts erzeugt.</p>'}
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
        const promptBox = r.lovable_prompt
          ? `<h2 style="margin-top:24px;">Lovable Prompt</h2>
             <pre style="white-space: pre-wrap; font-family: ui-monospace, monospace; background:#F1F3F5; color:#212529; padding:14px; border-radius:8px; border:1px solid #DEE2E6; font-size:13px;">${escapeHtml(r.lovable_prompt)}</pre>
             <p style="color:#007B43; font-weight:600;">→ Direkt in Lovable einfügen</p>`
          : "";
        const html = `
          <div style="font-family: -apple-system, sans-serif; max-width: 640px; margin: 0 auto;">
            <h1 style="color: #007B43;">${r.name}</h1>
            <p style="color: #666;">${dateStr}</p>
            <pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(r.content)}</pre>
            ${promptBox}
          </div>`;
        await sendEmail(`Rasenpilot Weekly Deep Dive – ${r.name}`, html);
      }
    }

    return new Response(
      JSON.stringify({ success: true, mode, metrics, agents: agentResults.length, summary, top3_queued: top3.length }),
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
