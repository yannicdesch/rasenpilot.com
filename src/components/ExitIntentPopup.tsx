import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { trackDropOffRisk } from '@/lib/analytics/userJourneyTracking';
import { hasConsentFor } from '@/utils/cookieUtils';

const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const trigger = (source: string) => {
      if (sessionStorage.getItem('exitIntentShown')) return;
      sessionStorage.setItem('exitIntentShown', '1');
      setShow(true);
      if (hasConsentFor('analytics')) {
        trackDropOffRisk('/', `exit_intent_${source}`);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) trigger('mouse_leave');
    };

    const handleVisibility = () => {
      if (document.hidden) trigger('tab_hidden');
    };

    if (window.innerWidth >= 768) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      // Mark intent so user lands on /lawn-analysis after OAuth
      sessionStorage.setItem('postAuthRedirect', '/lawn-analysis');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/lawn-analysis`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: err?.message ?? 'Bitte versuche es erneut.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleQuickStart = () => {
    setShow(false);
    navigate('/lawn-analysis');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-7 text-center shadow-2xl">
        <button
          onClick={() => setShow(false)}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Schließen"
        >
          <X className="h-5 w-5" />
        </button>

        <p className="mb-3 text-4xl">🌱</p>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          Warte kurz – dein Rasen wartet!
        </h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Sichere dir in 30 Sekunden deine kostenlose KI-Analyse.
        </p>

        <Button
          onClick={handleGoogleSignup}
          disabled={loading}
          size="lg"
          className="mb-3 w-full rounded-xl bg-primary py-6 text-base font-bold text-primary-foreground hover:bg-primary/90"
        >
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#fff" d="M21.35 11.1H12v3.2h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.66-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.47C16.71 3.86 14.57 3 12 3 6.98 3 3 6.98 3 12s3.98 9 9 9c5.2 0 8.64-3.65 8.64-8.79 0-.59-.06-1.04-.14-1.51z"/>
          </svg>
          {loading ? 'Wird geöffnet…' : 'Jetzt kostenlos testen – nur 1 Klick'}
        </Button>

        <Button
          onClick={handleQuickStart}
          variant="outline"
          size="lg"
          className="w-full rounded-xl py-6 text-base font-semibold"
        >
          <Zap className="mr-2 h-5 w-5" />
          Schnell-Start ohne Anmeldung
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>

        <p className="mt-4 text-xs text-muted-foreground">
          Keine Kreditkarte. Jederzeit kündbar.
        </p>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
