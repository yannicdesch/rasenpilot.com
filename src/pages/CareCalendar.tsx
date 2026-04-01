import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Crown, Lock, Loader2, RefreshCcw, Leaf, Droplets, Bug, Scissors, Sprout } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import MainNavigation from '@/components/MainNavigation';
import SEO from '@/components/SEO';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';

interface MonthPlan {
  month: string;
  tasks: string[];
}

const MONTH_ICONS: Record<string, React.ReactNode> = {
  'januar': <Sprout className="h-5 w-5" />,
  'februar': <Sprout className="h-5 w-5" />,
  'märz': <Leaf className="h-5 w-5" />,
  'april': <Leaf className="h-5 w-5" />,
  'mai': <Scissors className="h-5 w-5" />,
  'juni': <Droplets className="h-5 w-5" />,
  'juli': <Droplets className="h-5 w-5" />,
  'august': <Droplets className="h-5 w-5" />,
  'september': <Leaf className="h-5 w-5" />,
  'oktober': <Leaf className="h-5 w-5" />,
  'november': <Bug className="h-5 w-5" />,
  'dezember': <Sprout className="h-5 w-5" />,
};

const getMonthIcon = (month: string) => {
  const lower = month.toLowerCase();
  for (const [key, icon] of Object.entries(MONTH_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return <Calendar className="h-5 w-5" />;
};

const getCurrentMonthIndex = () => {
  const months = ['januar', 'februar', 'märz', 'april', 'mai', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'dezember'];
  return new Date().getMonth(); // 0-indexed
};

const CareCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { isPremium, loading: subLoading } = useSubscription();
  const { user } = useAuth();
  const [calendarData, setCalendarData] = useState<MonthPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user && !subLoading) {
      loadCalendar();
    } else if (!subLoading) {
      setIsLoading(false);
    }
  }, [user, subLoading]);

  const loadCalendar = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('care_calendars' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const calData = (data[0] as any).calendar_data;
        if (Array.isArray(calData) && calData.length > 0) {
          setCalendarData(calData);
        }
      }
    } catch (error) {
      console.error('Error loading care calendar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCalendar = async () => {
    if (!user) return;
    setIsGenerating(true);

    try {
      // Get the latest analysis result
      const { data: jobs } = await supabase
        .from('analysis_jobs')
        .select('result, grass_type, lawn_goal')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      const latestResult = jobs?.[0]?.result;
      const grassType = jobs?.[0]?.grass_type || 'Unbekannt';
      const lawnGoal = jobs?.[0]?.lawn_goal || 'Schöner grüner Rasen';

      // Get lawn profile for context
      const { data: profiles } = await supabase
        .from('lawn_profiles')
        .select('zip_code, lawn_size, soil_type')
        .eq('user_id', user.id)
        .limit(1);

      const profile = profiles?.[0];

      const prompt = `Erstelle einen detaillierten monatlichen Rasenpflegekalender für 12 Monate (von Januar bis Dezember). 

Kontext:
- Grassorte: ${grassType}
- Rasenziel: ${lawnGoal}
- PLZ/Region: ${profile?.zip_code || 'Deutschland'}
- Rasengröße: ${profile?.lawn_size || 'Unbekannt'}
- Bodentyp: ${profile?.soil_type || 'Unbekannt'}
${latestResult ? `- Letzte Analyse: ${JSON.stringify(latestResult).slice(0, 500)}` : ''}

Antworte NUR mit einem JSON-Array im folgenden Format, keine andere Erklärung:
[{"month":"Januar","tasks":["Aufgabe 1","Aufgabe 2"]},{"month":"Februar","tasks":["Aufgabe 1"]}, ...]

Jeder Monat sollte 2-4 konkrete, umsetzbare Aufgaben enthalten die zum deutschen Klima passen.`;

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: { message: prompt }
      });

      if (error) throw error;

      // Parse the response - extract JSON from the AI reply
      const reply = data?.reply || data?.message || '';
      const jsonMatch = reply.match(/\[[\s\S]*\]/);
      
      if (!jsonMatch) {
        throw new Error('Konnte keinen Kalender aus der KI-Antwort extrahieren');
      }

      const parsed: MonthPlan[] = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Ungültiges Kalenderformat');
      }

      // Save to Supabase
      // Delete old calendars first
      await supabase
        .from('care_calendars' as any)
        .delete()
        .eq('user_id', user.id);

      const { error: insertError } = await supabase
        .from('care_calendars' as any)
        .insert({
          user_id: user.id,
          calendar_data: parsed,
          analysis_job_id: jobs?.[0] ? undefined : null, // only link if we have a job
        } as any);

      if (insertError) throw insertError;

      setCalendarData(parsed);
      toast.success('Pflegekalender wurde erstellt!');
    } catch (error) {
      console.error('Error generating care calendar:', error);
      toast.error('Fehler beim Erstellen des Pflegekalenders');
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || subLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      </div>
    );
  }

  // Premium Gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <SEO title="Mein Pflegekalender | Rasenpilot" description="Dein persönlicher monatlicher Rasenpflegeplan." canonical="/care-calendar" noindex />
        <MainNavigation />
        <div className="container mx-auto px-4 py-12 max-w-lg">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-white">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
                <Lock className="h-8 w-8 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Pflegekalender freischalten</h2>
              <p className="text-gray-600 mb-6">
                Mit Premium erhältst du einen persönlichen, KI-generierten Pflegekalender basierend auf deiner Rasenanalyse.
              </p>
              <ul className="text-left text-sm text-gray-700 space-y-2 mb-6">
                <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-green-600" /> Monatlicher Pflegeplan</li>
                <li className="flex items-center gap-2"><Leaf className="h-4 w-4 text-green-600" /> Basierend auf deiner Analyse</li>
                <li className="flex items-center gap-2"><Sprout className="h-4 w-4 text-green-600" /> Angepasst an dein Klima</li>
              </ul>
              <Button onClick={() => navigate('/subscription?ref=care-calendar')} className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                <Crown className="h-4 w-4 mr-2" />
                7 Tage kostenlos testen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentMonthIdx = getCurrentMonthIndex();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <SEO title="Mein Pflegekalender | RasenPilot" description="Dein persönlicher monatlicher Rasenpflegeplan basierend auf deiner KI-Analyse." />
      <MainNavigation />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-800 mb-1">Mein Pflegekalender</h1>
            <p className="text-gray-600">Dein persönlicher Rasenpflegeplan für das ganze Jahr</p>
          </div>
          <Button
            onClick={generateCalendar}
            disabled={isGenerating}
            variant={calendarData.length > 0 ? 'outline' : 'default'}
            className={calendarData.length > 0 ? '' : 'bg-green-600 hover:bg-green-700'}
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Wird erstellt...</>
            ) : calendarData.length > 0 ? (
              <><RefreshCcw className="h-4 w-4 mr-2" /> Neu generieren</>
            ) : (
              <><Calendar className="h-4 w-4 mr-2" /> Kalender erstellen</>
            )}
          </Button>
        </div>

        {calendarData.length === 0 && !isGenerating ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Noch kein Pflegekalender erstellt</h3>
              <p className="text-gray-600 mb-6">
                Klicke auf "Kalender erstellen", um deinen persönlichen Pflegeplan basierend auf deiner letzten Rasenanalyse zu generieren.
              </p>
              <Button onClick={generateCalendar} className="bg-green-600 hover:bg-green-700">
                <Calendar className="h-4 w-4 mr-2" />
                Jetzt erstellen
              </Button>
            </CardContent>
          </Card>
        ) : isGenerating ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-green-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-800 mb-1">KI erstellt deinen Pflegekalender...</h3>
              <p className="text-gray-500 text-sm">Dies kann einige Sekunden dauern.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-0">
            {calendarData.map((monthPlan, index) => {
              const isCurrentMonth = index === currentMonthIdx;
              const isPast = index < currentMonthIdx;

              return (
                <div key={monthPlan.month} className="relative flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      isCurrentMonth
                        ? 'bg-green-600 text-white ring-4 ring-green-200'
                        : isPast
                        ? 'bg-gray-200 text-gray-500'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getMonthIcon(monthPlan.month)}
                    </div>
                    {index < calendarData.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[1rem] ${isPast ? 'bg-gray-200' : 'bg-green-200'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <Card className={`flex-1 mb-4 ${
                    isCurrentMonth
                      ? 'border-green-300 bg-green-50 shadow-md'
                      : isPast
                      ? 'opacity-60'
                      : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className={`font-bold text-lg ${isCurrentMonth ? 'text-green-800' : 'text-gray-800'}`}>
                          {monthPlan.month}
                        </h3>
                        {isCurrentMonth && (
                          <Badge className="bg-green-600 text-white text-xs">Aktueller Monat</Badge>
                        )}
                      </div>
                      <ul className="space-y-1.5">
                        {monthPlan.tasks.map((task, taskIdx) => (
                          <li key={taskIdx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              isCurrentMonth ? 'bg-green-500' : isPast ? 'bg-gray-300' : 'bg-green-300'
                            }`} />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareCalendar;
