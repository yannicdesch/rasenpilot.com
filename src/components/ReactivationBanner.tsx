import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sparkles, X, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const DISMISS_KEY = 'reactivationBannerDismissed';

interface DiscountRow {
  code: string;
  percent_off: number;
  expires_at: string;
  redeemed_at: string | null;
}

const ReactivationBanner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState<DiscountRow | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(
    () => sessionStorage.getItem(DISMISS_KEY) === '1'
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || dismissed) return;
    let active = true;

    const load = async () => {
      // Trial expired in the last 30 days, not subscribed?
      const { data: sub } = await supabase
        .from('subscribers')
        .select('subscribed, trial_end')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!sub || sub.subscribed) return;
      const end = sub.trial_end ? new Date(sub.trial_end).getTime() : 0;
      const now = Date.now();
      const expiredWithin30d = end > 0 && end < now && now - end < 30 * 24 * 60 * 60 * 1000;
      if (!expiredWithin30d) return;

      const { data: codes } = await supabase
        .from('discount_codes')
        .select('code, percent_off, expires_at, redeemed_at')
        .eq('user_id', user.id)
        .eq('source', 'trial_reactivation')
        .is('redeemed_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (active && codes?.[0]) setDiscount(codes[0] as DiscountRow);
    };

    load();
    return () => { active = false; };
  }, [user, dismissed]);

  if (!user || dismissed || !discount) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(discount.code);
    setCopied(true);
    toast({ title: 'Code kopiert', description: discount.code });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-md">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm sm:text-base">
            <strong>Willkommen zurück!</strong> Sichere dir jetzt{' '}
            <span className="font-bold">{discount.percent_off}% Rabatt</span> auf Premium —
            nur für dich.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-2 rounded-md bg-primary-foreground/15 px-3 py-1.5 font-mono text-sm font-bold tracking-wider hover:bg-primary-foreground/25"
            aria-label="Code kopieren"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {discount.code}
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/subscription?code=${discount.code}&ref=reactivation`)}
          >
            Jetzt einlösen
          </Button>
          <button
            onClick={handleDismiss}
            className="rounded-md p-1.5 hover:bg-primary-foreground/15"
            aria-label="Schließen"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReactivationBanner;
