import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Link, RefreshCcw, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrphanedSub {
  id: string;
  stripe_session_id: string | null;
  stripe_customer_id: string | null;
  customer_email: string | null;
  price_type: string | null;
  resolved: boolean;
  resolved_at: string | null;
  notes: string | null;
  created_at: string;
}

const OrphanedSubscriptions = () => {
  const [orphaned, setOrphaned] = useState<OrphanedSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [linkEmail, setLinkEmail] = useState('');
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);

  const fetchOrphaned = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('orphaned_subscriptions' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orphaned subscriptions:', error);
    } else {
      setOrphaned((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrphaned(); }, []);

  const handleResolve = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from('orphaned_subscriptions' as any)
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
      } as any)
      .eq('id', id);

    if (error) {
      toast.error('Fehler beim Auflösen');
    } else {
      toast.success('Als aufgelöst markiert');
      fetchOrphaned();
    }
  };

  const handleSendEmail = async (sub: OrphanedSub) => {
    if (!sub.customer_email) {
      toast.error('Keine E-Mail-Adresse vorhanden');
      return;
    }
    setSendingEmailId(sub.id);
    try {
      const { data, error } = await supabase.functions.invoke('send-registration-email', {
        body: { email: sub.customer_email }
      });
      if (error) throw error;
      toast.success(`Registrierungs-E-Mail an ${sub.customer_email} gesendet!`);
    } catch (err: any) {
      toast.error('E-Mail konnte nicht gesendet werden: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleLinkUser = async (orphanedSub: OrphanedSub) => {
    const email = linkEmail || orphanedSub.customer_email;
    if (!email) {
      toast.error('Keine E-Mail-Adresse angegeben');
      return;
    }

    // Find profile by email
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (!profile) {
      toast.error(`Kein Profil gefunden für ${email}`);
      return;
    }

    // Link subscriber to user
    const { error: subError } = await supabase
      .from('subscribers')
      .update({ user_id: profile.id, updated_at: new Date().toISOString() })
      .eq('email', email);

    if (subError) {
      toast.error('Fehler beim Verknüpfen: ' + subError.message);
      return;
    }

    // Mark as resolved
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('orphaned_subscriptions' as any)
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: user?.id,
        notes: `Manuell verknüpft mit Profil ${profile.id}`,
      } as any)
      .eq('id', orphanedSub.id);

    toast.success(`Abo erfolgreich mit ${email} verknüpft!`);
    setLinkingId(null);
    setLinkEmail('');
    fetchOrphaned();
  };

  const unresolvedCount = orphaned.filter(o => !o.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Verwaiste Abonnements
          </h2>
          <p className="text-sm text-muted-foreground">
            Stripe-Käufe ohne verknüpftes Benutzerkonto
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unresolvedCount > 0 && (
            <Badge variant="destructive">{unresolvedCount} offen</Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchOrphaned}>
            <RefreshCcw className="h-4 w-4 mr-1" /> Aktualisieren
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Laden...</p>
      ) : orphaned.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium">Keine verwaisten Abonnements</p>
            <p className="text-sm text-muted-foreground">Alle Stripe-Käufe sind korrekt verknüpft.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orphaned.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.customer_email || '—'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{sub.price_type || '—'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(sub.created_at).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell>
                      {sub.resolved ? (
                        <Badge className="bg-green-100 text-green-800">Aufgelöst</Badge>
                      ) : (
                        <Badge variant="destructive">Offen</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!sub.resolved && (
                        <div className="flex items-center gap-2">
                          {linkingId === sub.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                placeholder={sub.customer_email || 'E-Mail'}
                                value={linkEmail}
                                onChange={(e) => setLinkEmail(e.target.value)}
                                className="w-48 h-8 text-sm"
                              />
                              <Button size="sm" onClick={() => handleLinkUser(sub)}>
                                Verknüpfen
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setLinkingId(null)}>
                                ✕
                              </Button>
                            </div>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => setLinkingId(sub.id)}>
                                <Link className="h-3 w-3 mr-1" /> Verknüpfen
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleResolve(sub.id)}>
                                <CheckCircle className="h-3 w-3 mr-1" /> Auflösen
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                      {sub.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{sub.notes}</p>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrphanedSubscriptions;
