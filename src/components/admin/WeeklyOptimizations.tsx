import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, Copy, Check, ThumbsUp, ThumbsDown, RefreshCw, Save, GraduationCap } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface QueueRow {
  id: string;
  week_start: string;
  agent: string;
  title: string;
  impact_score: number | null;
  expected_metric: string | null;
  lovable_prompt: string;
  status: string | null;
  result_metric: string | null;
  created_at: string;
  allow_repeat?: boolean | null;
  repeat_justification?: string | null;
}

const fourWeeksAgoISO = () => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 28);
  return d.toISOString().slice(0, 10);
};

const WeeklyOptimizations = () => {
  const [pending, setPending] = useState<QueueRow[]>([]);
  const [approved, setApproved] = useState<QueueRow[]>([]);
  const [learning, setLearning] = useState<QueueRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [repeatEdits, setRepeatEdits] = useState<Record<string, string>>({});
  const [repeatSavingId, setRepeatSavingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [pRes, aRes, lRes] = await Promise.all([
      supabase
        .from("optimization_queue")
        .select("*")
        .eq("status", "pending")
        .order("impact_score", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("optimization_queue")
        .select("*")
        .eq("status", "approved")
        .gte("week_start", fourWeeksAgoISO())
        .order("week_start", { ascending: false }),
      supabase
        .from("optimization_queue")
        .select("*")
        .in("status", ["approved", "done"])
        .gte("week_start", fourWeeksAgoISO())
        .order("week_start", { ascending: false })
        .order("impact_score", { ascending: false }),
    ]);
    if (pRes.error) toast.error(pRes.error.message);
    else setPending((pRes.data ?? []) as QueueRow[]);
    if (aRes.error) toast.error(aRes.error.message);
    else {
      const rows = (aRes.data ?? []) as QueueRow[];
      setApproved(rows);
      const initial: Record<string, string> = {};
      const initialRepeat: Record<string, string> = {};
      rows.forEach((r) => {
        initial[r.id] = r.result_metric ?? "";
        initialRepeat[r.id] = r.repeat_justification ?? "";
      });
      setEdits(initial);
      setRepeatEdits(initialRepeat);
    }
    if (lRes.error) toast.error(lRes.error.message);
    else setLearning((lRes.data ?? []) as QueueRow[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const copyPrompt = async (row: QueueRow) => {
    await navigator.clipboard.writeText(row.lovable_prompt);
    setCopiedId(row.id);
    toast.success("Prompt kopiert");
    setTimeout(() => setCopiedId((c) => (c === row.id ? null : c)), 2000);
  };

  const setStatus = async (id: string, status: "approved" | "rejected") => {
    const patch: any = { status };
    if (status === "approved") patch.approved_at = new Date().toISOString();
    if (status === "rejected") patch.rejected_at = new Date().toISOString();
    const { error } = await supabase.from("optimization_queue").update(patch).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(status === "approved" ? "Genehmigt" : "Abgelehnt");
    await load();
  };

  const saveResult = async (id: string) => {
    setSavingId(id);
    const { error } = await supabase
      .from("optimization_queue")
      .update({ result_metric: edits[id] || null })
      .eq("id", id);
    setSavingId(null);
    if (error) toast.error(error.message);
    else toast.success("Ergebnis gespeichert");
  };

  const setAllowRepeat = async (row: QueueRow, allow: boolean) => {
    const justification = (repeatEdits[row.id] ?? "").trim();
    if (allow && justification.length < 10) {
      toast.error("Bitte mindestens 10 Zeichen Begründung angeben.");
      return;
    }
    setRepeatSavingId(row.id);
    const { error } = await supabase
      .from("optimization_queue")
      .update({
        allow_repeat: allow,
        repeat_justification: allow ? justification : null,
      })
      .eq("id", row.id);
    setRepeatSavingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(allow ? "Wiederholung freigegeben" : "Sperre wieder aktiv");
    await load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Wöchentliche Optimierungen</h2>
          <p className="text-sm text-muted-foreground">
            Top-Empfehlungen vom CPO-Orchestrator – genehmige oder lehne ab.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>
          <RefreshCw className="h-4 w-4 mr-2" /> Aktualisieren
        </Button>
      </div>

      {/* Learning context — passed to agents next run */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
                Lern-Kontext der Agenten (letzte 4 Wochen)
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Diese Änderungen werden bei jedem Lauf an alle 7 Agenten + den CPO-Orchestrator übergeben.
                Status <code>approved</code> oder <code>done</code>.
              </p>
            </div>
            <Badge variant="outline">{learning.length} Einträge</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {learning.length === 0 ? (
            <div className="py-6 text-center text-muted-foreground text-sm">
              Noch keine Lern-Daten vorhanden. Sobald Optimierungen genehmigt werden, erscheinen sie hier.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Woche</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Titel</TableHead>
                    <TableHead className="whitespace-nowrap">Impact</TableHead>
                    <TableHead>Erwartet</TableHead>
                    <TableHead>Tatsächlich</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {learning.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {r.week_start}
                      </TableCell>
                      <TableCell className="text-xs">{r.agent}</TableCell>
                      <TableCell className="text-sm font-medium max-w-[260px]">{r.title}</TableCell>
                      <TableCell className="text-xs">{r.impact_score ?? "—"}/10</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[220px]">
                        {r.expected_metric || "—"}
                      </TableCell>
                      <TableCell className="text-xs max-w-[220px]">
                        {r.result_metric ? (
                          <span className="text-foreground">{r.result_metric}</span>
                        ) : (
                          <span className="text-muted-foreground italic">noch offen</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={r.status === "done" ? "default" : "secondary"}>
                          {r.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Ausstehend ({pending.length})</h3>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Keine ausstehenden Optimierungen.
            </CardContent>
          </Card>
        ) : (
          pending.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-lg">{r.title}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Woche {r.week_start} · {r.agent}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Impact {r.impact_score ?? "—"}/10</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {r.expected_metric && (
                  <div className="text-sm">
                    <span className="font-medium">Erwartete Verbesserung: </span>
                    <span className="text-muted-foreground">{r.expected_metric}</span>
                  </div>
                )}
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Lovable Prompt</h4>
                  </div>
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                    {r.lovable_prompt}
                  </pre>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => copyPrompt(r)}>
                    {copiedId === r.id ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    Prompt kopieren
                  </Button>
                  <Button size="sm" onClick={() => setStatus(r.id, "approved")}>
                    <ThumbsUp className="h-4 w-4 mr-1" /> Genehmigt
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setStatus(r.id, "rejected")}>
                    <ThumbsDown className="h-4 w-4 mr-1" /> Ablehnen
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Approved last 4 weeks */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Genehmigt – letzte 4 Wochen ({approved.length})</h3>
        {approved.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Noch keine genehmigten Optimierungen.
            </CardContent>
          </Card>
        ) : (
          approved.map((r) => (
            <Card key={r.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <CardTitle className="text-lg">{r.title}</CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Woche {r.week_start} · {r.agent} · Impact {r.impact_score ?? "—"}/10
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.allow_repeat ? (
                      <Badge variant="outline" className="border-amber-500 text-amber-700">
                        Wiederholung erlaubt
                      </Badge>
                    ) : (
                      <Badge variant="outline">Gesperrt für Agenten</Badge>
                    )}
                    <Badge>Approved</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {r.expected_metric && (
                  <div className="text-sm">
                    <span className="font-medium">Erwartet: </span>
                    <span className="text-muted-foreground">{r.expected_metric}</span>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium block mb-1">Tatsächliches Ergebnis</label>
                  <div className="flex gap-2">
                    <Input
                      value={edits[r.id] ?? ""}
                      onChange={(e) => setEdits((p) => ({ ...p, [r.id]: e.target.value }))}
                      placeholder="z.B. +12% Conversion, kein Effekt, ..."
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => saveResult(r.id)}
                      disabled={savingId === r.id}
                    >
                      {savingId === r.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="rounded-lg border border-dashed p-3 space-y-2">
                  <div className="text-sm font-medium">
                    Agenten-Sperre {r.allow_repeat ? "(aufgehoben)" : "(aktiv)"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Standardmäßig dürfen Agenten diese Optimierung nicht erneut vorschlagen.
                    Erlaube die Wiederholung nur mit klarer Begründung – Agenten müssen darauf eingehen.
                  </p>
                  <textarea
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm min-h-[60px]"
                    value={repeatEdits[r.id] ?? ""}
                    onChange={(e) =>
                      setRepeatEdits((p) => ({ ...p, [r.id]: e.target.value }))
                    }
                    placeholder="z.B. 'Erste Umsetzung hatte Bug X – diesmal sauber bauen' (mind. 10 Zeichen)"
                  />
                  <div className="flex gap-2">
                    {!r.allow_repeat ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAllowRepeat(r, true)}
                        disabled={repeatSavingId === r.id}
                      >
                        {repeatSavingId === r.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Wiederholung freigeben
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setAllowRepeat(r, false)}
                        disabled={repeatSavingId === r.id}
                      >
                        {repeatSavingId === r.id ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : null}
                        Sperre wieder aktivieren
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

export default WeeklyOptimizations;

export default WeeklyOptimizations;
