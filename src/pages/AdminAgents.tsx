import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, RefreshCw, Play, Copy, Check } from "lucide-react";
import WeeklyOptimizations from "@/components/admin/WeeklyOptimizations";

interface AgentReport {
  id: string;
  agent: string;
  report_type: string;
  content: string;
  lovable_prompt: string | null;
  created_at: string;
}

const AdminAgents = () => {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [reports, setReports] = useState<AgentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("agent_reports")
      .select("id, agent, report_type, content, lovable_prompt, created_at")
      .order("created_at", { ascending: false })
      .limit(7);
    if (error) {
      toast.error("Konnte Berichte nicht laden: " + error.message);
    } else {
      setReports(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) loadReports();
  }, [isAdmin]);

  const runAgents = async () => {
    setRunning(true);
    toast.info("Agenten werden ausgeführt – das kann 30–60 Sekunden dauern …");
    try {
      const { data, error } = await supabase.functions.invoke("run-growth-agents", {
        body: { mode: "daily" },
      });
      if (error) throw error;
      toast.success("Agenten erfolgreich ausgeführt");
      await loadReports();
    } catch (e: any) {
      toast.error("Fehler: " + e.message);
    } finally {
      setRunning(false);
    }
  };

  if (adminLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Growth Agents</h1>
            <p className="text-muted-foreground mt-1">
              Letzte 7 Berichte der KI-Agenten
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadReports} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Aktualisieren
            </Button>
            <Button onClick={runAgents} disabled={running}>
              {running ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Jetzt ausführen
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              Noch keine Berichte vorhanden. Klicke auf „Jetzt ausführen“.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <CardTitle className="text-xl">{r.agent}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.report_type === "weekly" ? "default" : "secondary"}>
                        {r.report_type}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(r.created_at).toLocaleString("de-DE")}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                    {r.content}
                  </pre>
                  {r.lovable_prompt && (
                    <div className="mt-6 rounded-lg border bg-muted/50 p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-sm">Lovable Prompt</h4>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            await navigator.clipboard.writeText(r.lovable_prompt!);
                            setCopiedId(r.id);
                            toast.success("Prompt kopiert");
                            setTimeout(() => setCopiedId((c) => (c === r.id ? null : c)), 2000);
                          }}
                        >
                          {copiedId === r.id ? (
                            <Check className="h-4 w-4 mr-1" />
                          ) : (
                            <Copy className="h-4 w-4 mr-1" />
                          )}
                          {copiedId === r.id ? "Kopiert" : "Kopieren"}
                        </Button>
                      </div>
                      <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-muted-foreground">
                        {r.lovable_prompt}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAgents;
