
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from 'lucide-react';
import lawnBefore from '@/assets/lawn-before.jpg';
import lawnAfter from '@/assets/lawn-after.jpg';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-6 pb-6 md:pt-12 md:pb-16 overflow-hidden bg-gradient-to-b from-accent/40 to-background">
      <div className="container relative mx-auto px-4">
        
        <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
          
          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
            Dein Rasen in{' '}
            <span className="text-primary">30 Sekunden</span>{' '}
            analysiert
          </h1>

          <p className="text-sm sm:text-lg text-muted-foreground max-w-xl mx-auto">
            Foto hochladen — KI sagt dir was fehlt
          </p>

          {/* Before/After */}
          <div className="flex items-center justify-center gap-3 max-w-md mx-auto">
            <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-md">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1588847132813-5b5a9e591505?auto=format&fit=crop&w=400&q=75"
                  alt="Rasen vorher – mit kahlen Stellen"
                  className="w-full h-28 sm:h-40 object-cover"
                  width={400}
                  height={160}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="absolute bottom-1 left-1 bg-red-500/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">Vorher</span>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1 rounded-xl overflow-hidden border border-border shadow-md">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1558635924-b60e7d0023be?auto=format&fit=crop&w=400&q=75"
                  alt="Rasen nachher – sattgrün und dicht"
                  className="w-full h-28 sm:h-40 object-cover"
                  width={400}
                  height={160}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                />
                <span className="absolute bottom-1 left-1 bg-primary/90 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full">Nachher</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate('/lawn-analysis')}
            size="lg"
            className="w-full sm:w-auto text-base sm:text-lg py-7 px-8 sm:px-12 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground min-h-[60px]"
          >
            Rasen kostenlos analysieren →
          </Button>

          {/* Trust badges – single line */}
          <p className="text-xs sm:text-sm text-muted-foreground">
            ✅ Kostenlos · 🔒 DSGVO · ⚡ 30 Sek
          </p>
        </div>

        {/* Desktop: Testimonials below fold */}
        <div className="hidden md:grid mt-12 grid-cols-3 gap-3 max-w-4xl mx-auto">
          <p className="col-span-full text-xs text-muted-foreground text-center mb-1 italic">Beispiel-Erfahrungen unserer Nutzer</p>
          {[
            { name: 'Markus R.', city: 'Stuttgart', text: 'Die KI hat sofort erkannt, was meinem Rasen fehlt. Nach 4 Wochen sichtbare Verbesserung!' },
            { name: 'Julia H.', city: 'Köln', text: 'Als Mutter wenig Zeit – der Pflegekalender sagt mir genau wann was zu tun ist.' },
            { name: 'Frank W.', city: 'München', text: 'Nachbarn fragen schon, wie ich das geschafft habe. Die Wettertipps sind genial!' },
          ].map((t, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 text-left">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground leading-snug mb-2">"{t.text}"</p>
              <span className="text-xs font-medium text-foreground">{t.name}, {t.city}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HeroSection;
