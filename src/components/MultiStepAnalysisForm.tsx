import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';

export type LawnAnalysisFormData = {
  // Step 1 – Grunddaten
  lawnSize?: 'small' | 'medium' | 'large';
  sunExposure?: 'full_sun' | 'partial_shade' | 'full_shade';
  // Step 2 – Problembereiche (multi-select)
  problemAreas?: Array<'weeds' | 'bare_spots' | 'moss' | 'yellow' | 'puddles'>;
  // Step 3 – Ziele & Präferenzen
  lawnGoal?: 'lush' | 'family' | 'low_maintenance';
  lastFertilized?: 'this_year' | 'last_year' | 'never';
  lawnUsage?: 'family' | 'display' | 'pets';
};

interface Props {
  jobId: string;
  userId?: string | null;
  onComplete?: (data: LawnAnalysisFormData) => void;
}

const TOTAL_STEPS = 3;
const STEP_LABELS = ['Grunddaten', 'Probleme', 'Ziele'];

export default function MultiStepAnalysisForm({ jobId, userId, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<LawnAnalysisFormData>({ problemAreas: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // Load existing draft
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: draft } = await supabase
        .from('lawn_analysis_drafts')
        .select('current_step, form_data, completed')
        .eq('job_id', jobId)
        .maybeSingle();
      if (cancelled) return;
      if (draft && !draft.completed) {
        setData({ problemAreas: [], ...(draft.form_data as LawnAnalysisFormData) });
        setStep(Math.min(Math.max(draft.current_step ?? 1, 1), TOTAL_STEPS));
      }
      setIsHydrated(true);
    })();
    return () => { cancelled = true; };
  }, [jobId]);

  // Debounced autosave
  useEffect(() => {
    if (!isHydrated) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      await supabase
        .from('lawn_analysis_drafts')
        .upsert(
          {
            job_id: jobId,
            user_id: userId ?? null,
            current_step: step,
            form_data: data as any,
            completed: false,
          },
          { onConflict: 'job_id' },
        );
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [data, step, jobId, userId, isHydrated]);

  const canNext = (() => {
    if (step === 1) return !!data.lawnSize && !!data.sunExposure;
    if (step === 2) return (data.problemAreas?.length ?? 0) > 0;
    if (step === 3) return !!data.lawnGoal && !!data.lastFertilized && !!data.lawnUsage;
    return false;
  })();

  const update = <K extends keyof LawnAnalysisFormData>(key: K, value: LawnAnalysisFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const toggleProblem = (v: NonNullable<LawnAnalysisFormData['problemAreas']>[number]) => {
    setData((d) => {
      const set = new Set(d.problemAreas ?? []);
      set.has(v) ? set.delete(v) : set.add(v);
      return { ...d, problemAreas: Array.from(set) };
    });
  };

  const handleSubmit = async () => {
    if (!canNext) return;
    setIsSubmitting(true);
    try {
      const puddlesAfterRain = data.problemAreas?.includes('puddles') ? 'yes' : 'no';
      const { error } = await supabase.functions.invoke('refine-analysis', {
        body: {
          jobId,
          lastFertilized: data.lastFertilized,
          lawnUsage: data.lawnUsage,
          sunExposure: data.sunExposure,
          puddlesAfterRain,
        },
      });
      if (error) throw error;
      await supabase
        .from('lawn_analysis_drafts')
        .update({ completed: true, current_step: TOTAL_STEPS, form_data: data as any })
        .eq('job_id', jobId);
      toast.success('Empfehlungen wurden personalisiert');
      onComplete?.(data);
    } catch (err) {
      console.error('MultiStepAnalysisForm submit error', err);
      toast.error('Aktualisierung fehlgeschlagen. Bitte erneut versuchen.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const PillButton = ({
    active,
    children,
    onClick,
  }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-lg border text-center transition-all text-sm font-medium ${
        active
          ? 'border-green-500 bg-green-50 ring-2 ring-green-200 text-green-900'
          : 'border-border bg-white hover:border-green-300 text-foreground'
      }`}
    >
      {children}
    </button>
  );

  return (
    <Card className="border-amber-200/50 bg-amber-50/30">
      <CardContent className="p-4 space-y-4">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Schritt {step} von {TOTAL_STEPS}: {STEP_LABELS[step - 1]}
            </p>
            <p className="text-xs text-muted-foreground">{Math.round((step / TOTAL_STEPS) * 100)}%</p>
          </div>
          <Progress value={(step / TOTAL_STEPS) * 100} className="h-2" />
        </div>

        {/* Steps with smooth fade/slide */}
        <div key={step} className="animate-in fade-in slide-in-from-right-2 duration-200 space-y-4">
          {step === 1 && (
            <>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Wie groß ist Dein Rasen?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'small', l: '< 100 m²' },
                    { v: 'medium', l: '100–500 m²' },
                    { v: 'large', l: '> 500 m²' },
                  ].map((o) => (
                    <PillButton key={o.v} active={data.lawnSize === o.v} onClick={() => update('lawnSize', o.v as any)}>
                      {o.l}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Wie sonnig ist die Lage?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'full_sun', l: '☀️ Vollsonne' },
                    { v: 'partial_shade', l: '⛅ Halbschatten' },
                    { v: 'full_shade', l: '🌥 Schatten' },
                  ].map((o) => (
                    <PillButton key={o.v} active={data.sunExposure === o.v} onClick={() => update('sunExposure', o.v as any)}>
                      {o.l}
                    </PillButton>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <div>
              <p className="text-sm font-semibold text-foreground mb-1">Welche Probleme siehst Du?</p>
              <p className="text-xs text-muted-foreground mb-3">Mehrfachauswahl möglich</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { v: 'weeds', l: '🌿 Unkraut' },
                  { v: 'bare_spots', l: '🟫 Kahle Stellen' },
                  { v: 'moss', l: '🟢 Moos' },
                  { v: 'yellow', l: '🟡 Gelbe Flecken' },
                  { v: 'puddles', l: '💧 Pfützen nach Regen' },
                ].map((o) => {
                  const active = (data.problemAreas ?? []).includes(o.v as any);
                  return (
                    <PillButton key={o.v} active={active} onClick={() => toggleProblem(o.v as any)}>
                      <span className="inline-flex items-center gap-1.5">
                        {active && <Check className="h-3.5 w-3.5" />}
                        {o.l}
                      </span>
                    </PillButton>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Was ist Dein Ziel?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'lush', l: '✨ Sattgrün' },
                    { v: 'family', l: '👨‍👩‍👧 Familie' },
                    { v: 'low_maintenance', l: '🛠 Pflegeleicht' },
                  ].map((o) => (
                    <PillButton key={o.v} active={data.lawnGoal === o.v} onClick={() => update('lawnGoal', o.v as any)}>
                      {o.l}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Wann zuletzt gedüngt?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'this_year', l: 'Dieses Jahr' },
                    { v: 'last_year', l: 'Letztes Jahr' },
                    { v: 'never', l: 'Noch nie' },
                  ].map((o) => (
                    <PillButton key={o.v} active={data.lastFertilized === o.v} onClick={() => update('lastFertilized', o.v as any)}>
                      {o.l}
                    </PillButton>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-2">Rasen-Nutzung?</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { v: 'family', l: '👨‍👩‍👧 Familie' },
                    { v: 'display', l: '🌿 Repräsentation' },
                    { v: 'pets', l: '🐕 Hunde/Tiere' },
                  ].map((o) => (
                    <PillButton key={o.v} active={data.lawnUsage === o.v} onClick={() => update('lawnUsage', o.v as any)}>
                      {o.l}
                    </PillButton>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSubmitting}
            className="h-11"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Zurück
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              onClick={() => setStep((s) => Math.min(TOTAL_STEPS, s + 1))}
              disabled={!canNext}
              className="h-11 bg-green-600 hover:bg-green-700 text-white flex-1 max-w-[60%]"
            >
              Weiter
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!canNext || isSubmitting}
              className="h-11 bg-amber-600 hover:bg-amber-700 text-white flex-1 max-w-[60%] font-semibold"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Aktualisiere…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Empfehlungen personalisieren
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
