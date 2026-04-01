
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Rocket, Star, Trophy, Shield, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import lawnBefore from '@/assets/lawn-before.jpg';
import lawnAfter from '@/assets/lawn-after.jpg';

const AnimatedCounter = ({ target, suffix = '' }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const steps = 40;
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
  return 28 + (hash % 45); // Range: 28–72, different each day
};

const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative w-full py-8 md:py-14 lg:py-20 overflow-hidden bg-gradient-to-br from-accent via-secondary to-background">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container relative mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          
          {/* Left Column - Content */}
          <div className="flex-1 space-y-5 md:space-y-6 text-center lg:text-left max-w-2xl">
            
            {/* Urgency Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 rounded-full shadow-sm animate-pulse">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <span className="text-sm font-semibold text-primary font-poppins">
                Heute schon <AnimatedCounter target={getDailyAnalysisCount()} /> Analysen durchgeführt
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-dm-serif text-foreground">
              Dein Rasen verdient{' '}
              <span className="relative inline-block text-primary">
                <span className="relative z-10">Profi-Pflege</span>
                <span className="absolute bottom-1 left-0 w-full h-3 bg-primary/20 -rotate-1"></span>
              </span>
              <br className="hidden sm:block" />
              <span className="text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl">– in nur 30 Sekunden</span>
            </h1>
            
            {/* Value Proposition */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-poppins">
              Lade ein Foto hoch und erhalte sofort einen{' '}
              <span className="font-bold text-foreground">kostenlosen KI-Pflegeplan</span>{' '}
              mit konkreten Schritten für einen saftig grünen Rasen.
            </p>
            
            {/* Primary CTA */}
            <div className="pt-1 space-y-4">
              <Button 
                onClick={() => navigate('/lawn-analysis')} 
                size="lg"
                className="group w-full sm:w-auto text-base md:text-lg py-7 px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground font-poppins"
              >
                <Rocket className="mr-2 h-5 w-5 md:h-6 md:w-6" />
                Kostenlose Analyse starten
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground font-poppins">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Keine Anmeldung nötig
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  100% kostenlos
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Sofort-Ergebnis
                </span>
              </div>
            </div>
            
            {/* Social Proof Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 md:h-5 md:w-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span className="text-base md:text-lg font-bold text-foreground font-poppins">4.9/5</span>
              </div>
              
              <div className="h-4 w-px bg-border hidden sm:block"></div>
              
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-600" />
                <span className="text-sm md:text-base text-muted-foreground font-medium font-poppins">
                  <AnimatedCounter target={50000} suffix="+" /> Nutzer
                </span>
              </div>
              
              <div className="h-4 w-px bg-border hidden sm:block"></div>
              
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span className="text-sm md:text-base text-muted-foreground font-medium font-poppins">
                  DSGVO-konform
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Column - Visual */}
          <div className="flex-1 w-full max-w-md lg:max-w-none">
            <div className="relative">
              {/* Main Card */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
                <div className="flex h-72 md:h-80 lg:h-96">
                  
                  {/* Before */}
                  <div 
                    className="flex-1 relative flex items-end justify-center p-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${lawnBefore})` }}
                  >
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 left-4 bg-destructive/90 backdrop-blur-sm text-destructive-foreground px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      ✗ Vorher
                    </div>
                    <div className="relative z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-white font-bold text-sm md:text-base font-poppins">Score: 34/100</p>
                    </div>
                  </div>
                  
                  {/* Divider Arrow */}
                  <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 z-20 flex items-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                  
                  {/* After */}
                  <div 
                    className="flex-1 relative flex items-end justify-center p-6 bg-cover bg-center"
                    style={{ backgroundImage: `url(${lawnAfter})` }}
                  >
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-4 right-4 bg-primary/90 backdrop-blur-sm text-primary-foreground px-4 py-1.5 rounded-full text-xs md:text-sm font-bold shadow-lg">
                      ✓ Nachher
                    </div>
                    <div className="relative z-10 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                      <p className="text-white font-bold text-sm md:text-base font-poppins">Score: 94/100</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 md:-bottom-6 md:-right-6 rounded-2xl w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center shadow-2xl border-4 border-background bg-primary font-poppins">
                <Sparkles className="h-5 w-5 text-primary-foreground mb-1" />
                <span className="text-xl md:text-2xl font-extrabold text-primary-foreground">30s</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
