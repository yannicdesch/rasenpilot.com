// Aggregates optimization_queue performance per week and stores in agent_weekly_stats.
// Runs weekly via pg_cron, can also be triggered manually (admin button).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Heuristic: does the result_metric text indicate the expectation was met?
const POSITIVE_RX = /(\+\s*\d|verbesser|gestiegen|erfolg|erreicht|übertroffen|wachstum|zugenommen|hoch)/i;
const NEGATIVE_RX = /(kein effekt|nicht erreicht|gescheitert|verschlechter|gesunken|negativ|minus|verfehl)/i;
function isExpectationMet(result: string | null): boolean | null {
  if (!result) return null;
  const r = result.trim();
  if (!r) return null;
  if (NEGATIVE_RX.test(r)) return false;
  if (POSITIVE_RX.test(r)) return true;
  return null; // unklar
}

function avg(nums: number[]): number | null {
  const v = nums.filter((n) => Number.isFinite(n));
  if (v.length === 0) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100;
}

interface Row {
  week_start: string;
  agent: string;
  status: string | null;
  impact_score: number | null;
  expected_metric: string | null;
  result_metric: string | null;
}

function buildStats(rows: Row[]) {
  const total_proposed = rows.length;
  const approvedRows = rows.filter((r) => r.status === "approved" || r.status === "done");
  const doneRows = rows.filter((r) => r.status === "done");
  const total_approved = approvedRows.length;
  const total_rejected = rows.filter((r) => r.status === "rejected").length;
  const total_done = doneRows.length;
  const total_pending = rows.filter((r) => r.status === "pending").length;

  const avg_impact_score = avg(rows.map((r) => Number(r.impact_score ?? NaN)));
  const avg_impact_score_approved = avg(approvedRows.map((r) => Number(r.impact_score ?? NaN)));

  const measured = doneRows.filter((r) => r.result_metric && r.result_metric.trim().length > 0);
  const met = measured.filter((r) => isExpectationMet(r.result_metric) === true);
  const expected_met_count = met.length;
  const expected_met_rate = measured.length > 0
    ? Math.round((met.length / measured.length) * 10000) / 100
    : null;

  // per-agent breakdown
  const byAgent: Record<string, Row[]> = {};
  for (const r of rows) {
    const k = r.agent || "Unbekannt";
    (byAgent[k] ||= []).push(r);
  }
  const per_agent = Object.entries(byAgent).map(([agent, ar]) => {
    const ad = ar.filter((r) => r.status === "done");
    const am = ad.filter((r) => r.result_metric && r.result_metric.trim().length > 0);
    const amHit = am.filter((r) => isExpectationMet(r.result_metric) === true);
    return {
      agent,
      proposed: ar.length,
      approved: ar.filter((r) => r.status === "approved" || r.status === "done").length,
      rejected: ar.filter((r) => r.status === "rejected").length,
      done: ad.length,
      avg_impact: avg(ar.map((r) => Number(r.impact_score ?? NaN))),
      expected_met_rate: am.length > 0 ? Math.round((amHit.length / am.length) * 10000) / 100 : null,
    };
  }).sort((a, b) => b.proposed - a.proposed);

  return {
    total_proposed,
    total_approved,
    total_rejected,
    total_done,
    total_pending,
    avg_impact_score,
    avg_impact_score_approved,
    expected_met_count,
    expected_met_rate,
    per_agent,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const body = await req.json().catch(() => ({}));
    const weeksBack = Math.max(1, Math.min(52, Number(body?.weeks ?? 12)));

    // Compute window
    const fromDate = new Date();
    fromDate.setUTCDate(fromDate.getUTCDate() - weeksBack * 7);
    const fromISO = fromDate.toISOString().slice(0, 10);

    const { data: rows, error } = await supabase
      .from("optimization_queue")
      .select("week_start, agent, status, impact_score, expected_metric, result_metric")
      .gte("week_start", fromISO);

    if (error) throw error;

    // group by week_start
    const byWeek: Record<string, Row[]> = {};
    for (const r of (rows ?? []) as Row[]) {
      (byWeek[r.week_start] ||= []).push(r);
    }

    const upserts = Object.entries(byWeek).map(([week_start, wRows]) => ({
      week_start,
      ...buildStats(wRows),
      computed_at: new Date().toISOString(),
    }));

    if (upserts.length > 0) {
      const { error: upErr } = await supabase
        .from("agent_weekly_stats")
        .upsert(upserts, { onConflict: "week_start" });
      if (upErr) throw upErr;
    }

    return new Response(
      JSON.stringify({ ok: true, weeks_updated: upserts.length, weeks: upserts.map((u) => u.week_start) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: any) {
    console.error("weekly-agent-performance error", e);
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
