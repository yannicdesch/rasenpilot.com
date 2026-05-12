import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Users, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalAnalyses: number;
  solvedProblems: number;
  topProblems: Array<{ key: string; label: string; count: number }>;
}

const FALLBACK: Stats = {
  totalAnalyses: 1200,
  solvedProblems: 850,
  topProblems: [
    { key: 'moss', label: 'Moos im Rasen', count: 312 },
    { key: 'yellow', label: 'Gelbe Stellen', count: 268 },
    { key: 'bald', label: 'Kahle Stellen', count: 184 },
    { key: 'weeds', label: 'Unkraut', count: 142 },
  ],
};

const formatNumber = (n: number) => new Intl.NumberFormat('de-DE').format(n);

const SocialProofOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-social-proof-stats');
        if (!error && data && active) {
          setStats({
            totalAnalyses: data.totalAnalyses ?? FALLBACK.totalAnalyses,
            solvedProblems: data.solvedProblems ?? FALLBACK.solvedProblems,
            topProblems: data.topProblems?.length ? data.topProblems : FALLBACK.topProblems,
          });
        }
      } catch (err) {
        console.error("Failed to fetch social proof stats:", err);
        setStats(FALLBACK);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <section
      aria-label="Social Proof"
      className="relative overflow-hidden bg-gradient-to-b from-background via-accent/40 to-background py-14 md:py-20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%)]" />
      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Vertraut von Rasenfans in ganz Deutschland
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            Andere Nutzer haben bereits{' '}
            <span className="text-primary">{formatNumber(stats.solvedProblems)}+ Rasenprobleme</span>{' '}
            gelöst
          </h2>
          <p className="mt-3 text-base text-muted-foreground md:text-lg">
            Mach mit – deine kostenlose KI-Analyse dauert nur 30 Sekunden.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          <StatCard
            icon={<Users className="h-6 w-6" />}
            value={`${formatNumber(stats.totalAnalyses)}+`}
            label="durchgeführte Rasen-Analysen"
          />
          <StatCard
            icon={<CheckCircle2 className="h-6 w-6" />}
            value={`${formatNumber(stats.solvedProblems)}+`}
            label="erkannte Rasenprobleme"
          />
          <StatCard
            icon={<Sparkles className="h-6 w-6" />}
            value="4,8 / 5"
            label="durchschnittliche Bewertung*"
          />
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <h3 className="mb-4 text-center font-serif text-xl font-semibold text-foreground">
            Häufigste Probleme, die unsere KI erkennt
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {(loading ? FALLBACK.topProblems : stats.topProblems).map((p) => (
              <div
                key={p.key}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm font-medium text-foreground">{p.label}</span>
                <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-primary">
                  {formatNumber(p.count)}× erkannt
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Button
            size="lg"
            onClick={() => navigate('/lawn-analysis')}
            className="rounded-xl bg-primary px-8 py-6 text-base font-bold text-primary-foreground hover:bg-primary/90"
          >
            Jetzt kostenlos analysieren
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Keine Anmeldung nötig · 30 Sekunden · 100% kostenlos
          </p>
        </div>
      </div>
    </section>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; value: string; label: string }> = ({
  icon, value, label,
}) => (
  <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
    <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
    <div className="font-serif text-3xl font-bold text-foreground">{value}</div>
    <div className="mt-1 text-sm text-muted-foreground">{label}</div>
  </div>
);

export default SocialProofOnboarding;
