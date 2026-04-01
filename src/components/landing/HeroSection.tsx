
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Star } from 'lucide-react';

const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count.toLocaleString('de-DE')}{suffix}</span>;
};

const getDailyAnalysisCount = (): number => {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const hash = ((seed * 9301 + 49297) % 233280);
  return 28 + (hash % 45);
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-6 pb-10 md:pt-12 md:pb-16 lg:pt-16 lg:pb-20 overflow-hidden bg-gradient-to-b from-accent/40 to-background">
      <div className="container relative mx-auto px-4">
        
        {/* Mobile-first: single column, CTA above fold */}
        <div className="max-w-3xl mx-auto text-center space-y-5 md:space-y-6">
          
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs sm:text-sm font-semibold text-primary">
              Heute <AnimatedCounter target={getDailyAnalysisCount()} /> Analysen
            </span>
          </div>

          {/* Headline – short, punchy */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Dein Rasen braucht nur{' '}
            <span className="text-primary">30 Sekunden</span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Foto hochladen → KI analysiert → Sofort deinen kostenlosen Pflegeplan erhalten. Ohne Anmeldung.
          </p>

          {/* PRIMARY CTA – big, thumb-friendly, above fold on mobile */}
          <div className="pt-2">
            <Button
              onClick={() => navigate('/lawn-analysis')}
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg py-6 sm:py-7 px-8 sm:px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground min-h-[56px]"
            >
              Rasen jetzt kostenlos analysieren
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Trust signals – compact */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              Keine Anmeldung
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              100% kostenlos
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-primary" />
              Sofort-Ergebnis
            </span>
          </div>
        </div>

        {/* Social Proof Bar */}
        <div className="mt-8 md:mt-12 max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <span className="font-bold text-foreground">4.9/5</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-border"></div>
            <span className="font-medium">
              <AnimatedCounter target={7} /> Rasenflächen analysiert
            </span>
            <div className="hidden sm:block h-4 w-px bg-border"></div>
            <span className="font-medium">DSGVO-konform</span>
          </div>
        </div>

        {/* Mini Testimonials */}
        <div className="mt-8 md:mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto">
          {[
            { name: 'Markus R.', city: 'Stuttgart', text: 'Die KI hat sofort erkannt, was meinem Rasen fehlt. Nach 4 Wochen wie vom Profi!', score: '38 → 91' },
            { name: 'Julia H.', city: 'Köln', text: 'Als Mutter wenig Zeit – der Pflegekalender sagt mir genau wann was zu tun ist.', score: '42 → 87' },
            { name: 'Frank W.', city: 'München', text: 'Nachbarn fragen schon, wie ich das geschafft habe. Die Wettertipps sind genial!', score: '55 → 93' },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-left">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-snug mb-2">"{t.text}"</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{t.name}, {t.city}</span>
                <span className="text-xs font-bold text-primary">{t.score}</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
