import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AnalysisContext {
  score: number;
  summary: string;
  problems: string[];
  steps: string[];
  imageUrl: string | null;
  createdAt: string;
}

interface LawnProfileContext {
  zipCode: string;
  grassType: string;
  lawnSize: string;
  lawnGoal: string;
  soilType: string | null;
}

export interface ChatContext {
  analysis: AnalysisContext | null;
  profile: LawnProfileContext | null;
  loading: boolean;
}

const getCurrentSeason = (): string => {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'Frühling';
  if (month >= 5 && month <= 7) return 'Sommer';
  if (month >= 8 && month <= 10) return 'Herbst';
  return 'Winter';
};

export const buildSystemPrompt = (ctx: ChatContext): string => {
  let prompt = `Du bist ein erfahrener deutscher Rasenexperte und hilfst Gartenbesitzern bei allen Fragen rund um die Rasenpflege.
Aktuelle Jahreszeit: ${getCurrentSeason()}.
Antworte immer auf Deutsch, sei spezifisch und nutze das Wissen über den Rasen des Nutzers.
Empfehle bei Bedarf passende Produkte.`;

  if (ctx.analysis) {
    prompt += `\n\nDer Nutzer hat folgenden Rasen-Score: ${ctx.analysis.score}/100.`;
    if (ctx.analysis.problems.length > 0) {
      prompt += `\nErkannte Probleme: ${ctx.analysis.problems.join(', ')}.`;
    }
    if (ctx.analysis.steps.length > 0) {
      prompt += `\nLetzter Pflegeplan:\n${ctx.analysis.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    }
    if (ctx.analysis.summary) {
      prompt += `\nZusammenfassung: ${ctx.analysis.summary}`;
    }
  }

  if (ctx.profile) {
    prompt += `\n\nRasenprofil des Nutzers:`;
    prompt += `\nPLZ: ${ctx.profile.zipCode}`;
    prompt += `\nGrasart: ${ctx.profile.grassType}`;
    prompt += `\nRasengröße: ${ctx.profile.lawnSize}`;
    prompt += `\nZiel: ${ctx.profile.lawnGoal}`;
    if (ctx.profile.soilType) prompt += `\nBodenart: ${ctx.profile.soilType}`;
  }

  return prompt;
};

export const useChatContext = (): ChatContext => {
  const [analysis, setAnalysis] = useState<AnalysisContext | null>(null);
  const [profile, setProfile] = useState<LawnProfileContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContext = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setLoading(false); return; }

        const [analysisRes, profileRes] = await Promise.all([
          supabase
            .from('analyses')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          supabase
            .from('lawn_profiles')
            .select('*')
            .eq('user_id', user.id)
            .limit(1)
            .single()
        ]);

        if (analysisRes.data) {
          const a = analysisRes.data;
          const problems: string[] = [];
          if (a.density_note) problems.push(a.density_note);
          if (a.moisture_note) problems.push(a.moisture_note);
          if (a.soil_note) problems.push(a.soil_note);
          if (a.sunlight_note) problems.push(a.sunlight_note);

          setAnalysis({
            score: a.score,
            summary: a.summary_short || '',
            problems,
            steps: [a.step_1, a.step_2, a.step_3].filter(Boolean) as string[],
            imageUrl: a.image_url,
            createdAt: a.created_at,
          });
        }

        if (profileRes.data) {
          const p = profileRes.data;
          setProfile({
            zipCode: p.zip_code,
            grassType: p.grass_type,
            lawnSize: p.lawn_size,
            lawnGoal: p.lawn_goal,
            soilType: p.soil_type,
          });
        }
      } catch (err) {
        console.error('Error loading chat context:', err);
      } finally {
        setLoading(false);
      }
    };

    loadContext();
  }, []);

  return { analysis, profile, loading };
};
