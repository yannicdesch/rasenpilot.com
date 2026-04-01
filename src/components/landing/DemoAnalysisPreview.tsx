
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Droplets, Sun, Leaf, AlertTriangle } from 'lucide-react';

const DemoAnalysisPreview = () => {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-background to-accent/10">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3">
            So sieht dein Ergebnis aus
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg">
            In 30 Sekunden erhältst du eine vollständige KI-Analyse wie diese:
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Mock Analysis Card */}
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
            
            {/* Score Header */}
            <div className="bg-gradient-to-r from-primary/10 to-accent/20 p-5 sm:p-6 text-center">
              <p className="text-sm text-muted-foreground mb-1">Dein Rasen-Score</p>
              <div className="text-5xl sm:text-6xl font-bold text-primary">56<span className="text-2xl text-muted-foreground">/100</span></div>
              <p className="text-sm font-medium text-amber-600 mt-1 flex items-center justify-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Dein Rasen braucht Aufmerksamkeit
              </p>
            </div>

            {/* Analysis Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Droplets, label: 'Feuchtigkeit', value: 'Zu trocken', color: 'text-amber-600' },
                  { icon: Sun, label: 'Sonnenlicht', value: 'Ausreichend', color: 'text-primary' },
                  { icon: Leaf, label: 'Dichte', value: 'Lückig', color: 'text-amber-600' },
                  { icon: AlertTriangle, label: 'Problem', value: 'Moos erkannt', color: 'text-destructive' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40">
                    <item.icon className={`h-4 w-4 ${item.color} shrink-0`} />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className={`text-sm font-medium ${item.color} truncate`}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Steps Preview */}
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-2">Dein 3-Schritte-Plan:</p>
                <ol className="space-y-1.5 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="font-bold text-primary shrink-0">1.</span>
                    Vertikutieren um Moos und Rasenfilz zu entfernen
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary shrink-0">2.</span>
                    Nachsaat mit Schattenrasen an kahlen Stellen
                  </li>
                  <li className="flex gap-2">
                    <span className="font-bold text-primary shrink-0">3.</span>
                    Startdüngung mit organischem Langzeitdünger
                  </li>
                </ol>
              </div>

              {/* Blur overlay hint */}
              <div className="relative">
                <div className="h-12 bg-gradient-to-b from-transparent to-card"></div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <Button
                onClick={() => navigate('/lawn-analysis')}
                className="w-full py-5 text-base font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md min-h-[48px]"
              >
                Jetzt deinen Rasen analysieren
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                Kostenlos · Keine Anmeldung nötig · Ergebnis in 30 Sekunden
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoAnalysisPreview;
