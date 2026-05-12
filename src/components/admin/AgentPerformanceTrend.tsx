import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PerAgent {
  agent: string;
  proposed: number;
  approved: number;
  rejected: number;
  done: number;
  avg_impact: number | null;
  expected_met_rate: number | null;
}

interface WeeklyStats {
  id: string;
  week_start: string;
  total_proposed: number;
  total_approved: number;
  total_rejected: number;
  total_done: number;
  total_pending: number;
  avg_impact_score: number | null;
  avg_impact_score_approved: number | null;
  expected_met_count: number;
  expected_met_rate: number | null;
  per_agent: PerAgent[];
  computed_at: string;
}

const fmt = (n: number | null | undefined, suffix = "") =>
  n === null || n === undefined ? "—" : `${n}${suffix}`;

const TrendCell = ({ current, previous }: { current: number | null; previous: number | null }) => {
  if (current === null || previous === null) return <span className="text-muted-foreground">—</span>;
  const diff = current - previous;
  if (Math.abs(diff) < 0.01)
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Minus className="h-3 w-3" />0
      </span>
    );
  if (diff > 0)
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{Math.round(diff * 100) / 100}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-rose-600">
      <TrendingDown className="h-3 w-3" />
      {Math.round(diff * 100) / 100}
    </span>
  );
};

const AgentPerformanceTrend = () => {
  const [stats, setStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [recomputing, setRecomputing] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_weekly_stats")
      .select("*")
      .order("week_start", { ascending: false })
      .limit(12);
    if (error) toast.error(error.message);
    else setStats((data ?? []) as unknown as WeeklyStats[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const recompute = async () => {
    setRecomputing(true);
    const { error } = await supabase.functions.invoke("weekly-agent-performance", {
      body: { weeks: 12 },
    });
    setRecomputing(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Performance neu berechnet");
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const latest = stats[0];
  const previous = stats[1];

  // aggregate per-agent across all loaded weeks
  const agentTotals = new Map<string, PerAgent & { weeks: number }>();
  for (const w of stats) {
    for (const pa of w.per_agent ?? []) {
      const cur = agentTotals.get(pa.agent) ?? {
        agent: pa.agent,
        proposed: 0,
        approved: 0,
        rejected: 0,
        done: 0,
        avg_impact: 0,
        expected_met_rate: 0,
        weeks: 0,
      };
      cur.proposed += pa.proposed;
      cur.approved += pa.approved;
      cur.rejected += pa.rejected;
      cur.done += pa.done;
      if (pa.avg_impact !== null) {
        cur.avg_impact = ((cur.avg_impact ?? 0) * cur.weeks + pa.avg_impact) / (cur.weeks + 1);
      }
      if (pa.expected_met_rate !== null) {
        cur.expected_met_rate =
          ((cur.expected_met_rate ?? 0) * cur.weeks + pa.expected_met_rate) / (cur.weeks + 1);
      }
      cur.weeks += 1;
      agentTotals.set(pa.agent, cur);
    }
  }
  const agentRanking = [...agentTotals.values()].sort((a, b) => b.proposed - a.proposed);

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Agenten-Performance (wöchentlicher Vergleich)
          </h2>
          <p className="text-sm text-muted-foreground">
            Wöchentlich aktualisierte Kennzahlen aus <code>optimization_queue</code>. Letzte Berechnung:{" "}
            {latest ? new Date(latest.computed_at).toLocaleString("de-DE") : "—"}.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={recompute} disabled={recomputing}>
          {recomputing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Jetzt neu berechnen
        </Button>
      </div>

      {/* Summary cards: this week vs previous */}
      {latest ? (
        <div className="grid gap-3 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Vorschläge diese Woche</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{latest.total_proposed}</div>
              <div className="text-xs mt-1">
                <TrendCell current={latest.total_proposed} previous={previous?.total_proposed ?? null} />{" "}
                <span className="text-muted-foreground">vs. Vorwoche</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Ø Impact-Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(latest.avg_impact_score, "/10")}</div>
              <div className="text-xs mt-1">
                <TrendCell
                  current={latest.avg_impact_score}
                  previous={previous?.avg_impact_score ?? null}
                />{" "}
                <span className="text-muted-foreground">vs. Vorwoche</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Genehmigungsrate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {latest.total_proposed > 0
                  ? Math.round((latest.total_approved / latest.total_proposed) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {latest.total_approved} von {latest.total_proposed} genehmigt
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Erwartung erfüllt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(latest.expected_met_rate, "%")}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {latest.expected_met_count} von {latest.total_done} gemessen
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Noch keine Performance-Daten. Klicke auf „Jetzt neu berechnen".
          </CardContent>
        </Card>
      )}

      {/* Weekly trend table */}
      {stats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wöchentlicher Verlauf (letzte {stats.length} Wochen)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Woche</TableHead>
                  <TableHead className="text-right">Vorschläge</TableHead>
                  <TableHead className="text-right">Genehmigt</TableHead>
                  <TableHead className="text-right">Abgelehnt</TableHead>
                  <TableHead className="text-right">Done</TableHead>
                  <TableHead className="text-right">Ø Impact</TableHead>
                  <TableHead className="text-right">Erwartung erfüllt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs">{w.week_start}</TableCell>
                    <TableCell className="text-right">{w.total_proposed}</TableCell>
                    <TableCell className="text-right">{w.total_approved}</TableCell>
                    <TableCell className="text-right">{w.total_rejected}</TableCell>
                    <TableCell className="text-right">{w.total_done}</TableCell>
                    <TableCell className="text-right">{fmt(w.avg_impact_score)}</TableCell>
                    <TableCell className="text-right">{fmt(w.expected_met_rate, "%")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Per-agent ranking */}
      {agentRanking.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Agenten-Ranking (kumuliert über {stats.length} Wochen)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead className="text-right">Vorschläge</TableHead>
                  <TableHead className="text-right">Genehmigt</TableHead>
                  <TableHead className="text-right">Done</TableHead>
                  <TableHead className="text-right">Ø Impact</TableHead>
                  <TableHead className="text-right">Trefferquote</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentRanking.map((a) => {
                  const approvalRate = a.proposed > 0 ? Math.round((a.approved / a.proposed) * 100) : 0;
                  return (
                    <TableRow key={a.agent}>
                      <TableCell className="font-medium">{a.agent}</TableCell>
                      <TableCell className="text-right">{a.proposed}</TableCell>
                      <TableCell className="text-right">
                        {a.approved}{" "}
                        <Badge variant="outline" className="ml-1 text-[10px]">
                          {approvalRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{a.done}</TableCell>
                      <TableCell className="text-right">
                        {a.avg_impact === null ? "—" : (Math.round(a.avg_impact * 100) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {a.expected_met_rate === null
                          ? "—"
                          : `${(Math.round(a.expected_met_rate * 100) / 100).toFixed(1)}%`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </section>
  );
};

export default AgentPerformanceTrend;
