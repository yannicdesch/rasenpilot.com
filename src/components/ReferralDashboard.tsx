import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Copy, Check, Gift, Mail, Users, Loader2, Send } from 'lucide-react';
import { z } from 'zod';

interface ReferralRow {
  id: string;
  referred_email: string;
  status: 'pending' | 'completed' | 'rewarded';
  created_at: string;
}

const REWARD_THRESHOLD = 3;
const emailSchema = z.string().trim().email().max(255);

const ReferralDashboard: React.FC = () => {
  const { user } = useAuth();
  const [code, setCode] = useState<string | null>(null);
  const [count, setCount] = useState<number>(0);
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);

  const referralLink = code
    ? `${window.location.origin}/lawn-analysis?ref=${code}`
    : '';

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: profile }, { data: refs }] = await Promise.all([
        supabase
          .from('profiles')
          .select('referral_code, referral_count')
          .eq('id', user.id)
          .single(),
        supabase
          .from('referrals')
          .select('id, referred_email, status, created_at')
          .eq('referrer_user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setCode((profile as any)?.referral_code ?? null);
      setCount((profile as any)?.referral_count ?? 0);
      setReferrals((refs as ReferralRow[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const copyLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const sendInvite = async () => {
    const parsed = emailSchema.safeParse(inviteEmail);
    if (!parsed.success) {
      toast.error('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-referral-invite', {
        body: { email: parsed.data },
      });
      if (error) throw new Error((data as any)?.error ?? error.message);
      toast.success(`Einladung an ${parsed.data} gesendet! 🌱`);
      setInviteEmail('');
      // Refresh list
      const { data: refs } = await supabase
        .from('referrals')
        .select('id, referred_email, status, created_at')
        .eq('referrer_user_id', user!.id)
        .order('created_at', { ascending: false });
      setReferrals((refs as ReferralRow[]) ?? []);
    } catch (e: any) {
      toast.error(e?.message ?? 'Einladung konnte nicht gesendet werden.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const completed = referrals.filter((r) => r.status === 'completed' || r.status === 'rewarded').length;
  const towardsNext = REWARD_THRESHOLD - (count % REWARD_THRESHOLD || REWARD_THRESHOLD);
  const progressPct = ((count % REWARD_THRESHOLD) / REWARD_THRESHOLD) * 100;

  return (
    <div className="space-y-6">
      {/* Reward progress */}
      <Card className="border-primary/30 bg-gradient-to-br from-accent/40 to-background">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Deine Belohnung</CardTitle>
          </div>
          <CardDescription>
            Für je <strong>{REWARD_THRESHOLD} erfolgreiche Einladungen</strong> bekommst du
            <strong> 1 Monat Premium gratis</strong>.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {count % REWARD_THRESHOLD}/{REWARD_THRESHOLD} bis zur nächsten Belohnung
            </span>
            <span className="font-semibold text-primary">{count} insgesamt</span>
          </div>
          <Progress value={progressPct} className="h-2" />
          {count > 0 && (
            <p className="text-xs text-muted-foreground">
              Noch {towardsNext} Einladung{towardsNext === 1 ? '' : 'en'} bis zum nächsten Monat Premium gratis.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Share link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dein persönlicher Einladungs-Link</CardTitle>
          <CardDescription>Teile ihn mit Freunden und Familie.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <Button onClick={copyLink} variant="secondary" className="shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          {code && (
            <p className="text-xs text-muted-foreground">
              Code: <span className="font-mono font-bold text-primary">{code}</span>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Email invite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Per E-Mail einladen
          </CardTitle>
          <CardDescription>Wir senden eine persönliche Einladung in deinem Namen.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="freund@beispiel.de"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              disabled={sending}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendInvite();
              }}
            />
            <Button onClick={sendInvite} disabled={sending || !inviteEmail}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="ml-2 hidden sm:inline">Einladen</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Invitations list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Deine Einladungen ({referrals.length})
          </CardTitle>
          <CardDescription>
            {completed} angenommen · {referrals.length - completed} ausstehend
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Noch keine Einladungen versendet. Lade jetzt deine ersten Freunde ein!
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {referrals.map((r) => (
                <li key={r.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{r.referred_email}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const StatusBadge: React.FC<{ status: ReferralRow['status'] }> = ({ status }) => {
  if (status === 'rewarded') {
    return <Badge className="bg-primary text-primary-foreground">🎁 Belohnt</Badge>;
  }
  if (status === 'completed') {
    return <Badge className="bg-green-600 text-white">✓ Registriert</Badge>;
  }
  return <Badge variant="secondary">Ausstehend</Badge>;
};

export default ReferralDashboard;
