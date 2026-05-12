import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, Play } from 'lucide-react';

interface SequenceRow {
  id: string;
  user_id: string | null;
  email: string;
  sequence_type: string;
  current_step: number;
  last_sent: string | null;
  completed: boolean;
  started_at: string;
}

const STEP_LABELS = ['Noch nicht gesendet', 'Tag 1: Was hat gefehlt?', 'Tag 3: 20% Rabatt', 'Tag 5: Letzte Chance'];

const EmailSequencesAdmin: React.FC = () => {
  const [rows, setRows] = useState<SequenceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setRows((data ?? []) as SequenceRow[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runNow = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('expired-trial-sequence');
      if (error) throw error;
      toast.success(`Verarbeitet: ${data?.stats?.sent ?? 0} Emails versendet`);
      await load();
    } catch (e: any) {
      toast.error(e.message ?? 'Fehler');
    } finally {
      setRunning(false);
    }
  };

  const total = rows.length;
  const active = rows.filter(r => !r.completed).length;
  const completed = rows.filter(r => r.completed).length;
  const sentCount = rows.reduce((sum, r) => sum + r.current_step, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Sequenzen gesamt</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{total}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Aktiv</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold text-primary">{active}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Abgeschlossen</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{completed}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Emails gesendet</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold">{sentCount}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Expired Trial Sequence</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Aktualisieren
            </Button>
            <Button size="sm" onClick={runNow} disabled={running}>
              {running ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />} Jetzt ausführen
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Schritt</TableHead>
                  <TableHead>Letzter Versand</TableHead>
                  <TableHead>Gestartet</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Keine Sequenzen vorhanden</TableCell></TableRow>
                )}
                {rows.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.email}</TableCell>
                    <TableCell>{STEP_LABELS[r.current_step] ?? `Schritt ${r.current_step}`}</TableCell>
                    <TableCell>{r.last_sent ? new Date(r.last_sent).toLocaleString('de-DE') : '—'}</TableCell>
                    <TableCell>{new Date(r.started_at).toLocaleDateString('de-DE')}</TableCell>
                    <TableCell>
                      {r.completed
                        ? <Badge variant="secondary">Abgeschlossen</Badge>
                        : <Badge>Aktiv</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSequencesAdmin;
