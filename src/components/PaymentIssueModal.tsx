import React, { useEffect, useState } from 'react';
import { AlertTriangle, CreditCard, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ProfilePaymentRow {
  payment_status: string | null;
  payment_issue_since: string | null;
}

/**
 * Shown on the premium dashboard when the current user's profile carries
 * `payment_status === 'payment_issue'`. Provides a direct Stripe Customer
 * Portal link so they can update their card.
 */
const PaymentIssueModal: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [issueSince, setIssueSince] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;
    const load = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('payment_status, payment_issue_since')
        .eq('id', user.id)
        .maybeSingle<ProfilePaymentRow>();
      if (cancelled || error || !data) return;
      if (data.payment_status === 'payment_issue') {
        setIssueSince(data.payment_issue_since);
        setOpen(true);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const handleOpenPortal = async () => {
    setLoadingPortal(true);
    try {
      const { data, error } = await supabase.functions.invoke<{ url?: string; error?: string }>(
        'create-billing-portal',
        { body: {} },
      );
      if (error || !data?.url) {
        toast.error(data?.error ?? 'Billing-Portal konnte nicht geöffnet werden.');
        return;
      }
      // Use href to bypass pop-up blockers (project convention)
      window.location.href = data.url;
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setLoadingPortal(false);
    }
  };

  const sinceLabel = issueSince
    ? new Date(issueSince).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle className="text-center">Zahlung fehlgeschlagen</DialogTitle>
          <DialogDescription className="text-center">
            Deine letzte Premium-Zahlung konnte nicht eingezogen werden
            {sinceLabel ? ` (seit ${sinceLabel})` : ''}. Aktualisiere kurz deine
            Zahlungsmethode, damit dein Zugang aktiv bleibt.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
          Wir versuchen die Abbuchung in den nächsten 7 Tagen automatisch noch dreimal.
          Danach pausieren wir dein Premium-Abo automatisch.
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleOpenPortal}
            disabled={loadingPortal}
            className="w-full bg-[#007B43] hover:bg-[#006335]"
          >
            {loadingPortal ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4 mr-2" />
            )}
            Zahlungsmethode aktualisieren
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>
            Später erinnern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentIssueModal;
