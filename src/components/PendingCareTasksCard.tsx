import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, Scissors, Droplets } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareTask {
  type: 'mowing' | 'fertilizing';
  title: string;
  description: string;
  icon: React.ReactNode;
  daysSince: number | null;
}

const PendingCareTasksCard = () => {
  const [tasks, setTasks] = useState<CareTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: lawnProfile } = await supabase
        .from('lawn_profiles')
        .select('last_mowed, last_fertilized')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!lawnProfile) {
        setLoading(false);
        return;
      }

      const today = new Date();
      const month = today.getMonth();
      const isGrowingSeason = month >= 3 && month <= 9;
      const mowingFreq = isGrowingSeason ? 7 : 14;
      const fertilizingFreq = (month >= 2 && month <= 4) || (month >= 8 && month <= 10) ? 45 : 120;

      const pendingTasks: CareTask[] = [];

      if (lawnProfile.last_mowed) {
        const daysSince = Math.floor((today.getTime() - new Date(lawnProfile.last_mowed).getTime()) / 86400000);
        if (daysSince >= mowingFreq) {
          pendingTasks.push({
            type: 'mowing',
            title: 'Rasen mähen',
            description: `Zuletzt gemäht am ${new Date(lawnProfile.last_mowed).toLocaleDateString('de-DE')} – ${daysSince} Tage her.`,
            icon: <Scissors className="h-5 w-5 text-green-600" />,
            daysSince
          });
        }
      } else {
        pendingTasks.push({
          type: 'mowing',
          title: 'Rasen mähen',
          description: 'Noch kein Mähdatum eingetragen.',
          icon: <Scissors className="h-5 w-5 text-green-600" />,
          daysSince: null
        });
      }

      if (lawnProfile.last_fertilized) {
        const daysSince = Math.floor((today.getTime() - new Date(lawnProfile.last_fertilized).getTime()) / 86400000);
        if (daysSince >= fertilizingFreq) {
          pendingTasks.push({
            type: 'fertilizing',
            title: 'Düngen',
            description: `Letzte Düngung: ${new Date(lawnProfile.last_fertilized).toLocaleDateString('de-DE')} – ${daysSince} Tage her.`,
            icon: <Droplets className="h-5 w-5 text-emerald-600" />,
            daysSince
          });
        }
      }

      setTasks(pendingTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeTask = async (taskType: 'mowing' | 'fertilizing') => {
    setCompleting(taskType);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updateField = taskType === 'mowing' 
        ? { last_mowed: new Date().toISOString().split('T')[0] }
        : { last_fertilized: new Date().toISOString().split('T')[0] };

      const { error } = await supabase
        .from('lawn_profiles')
        .update({ ...updateField, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing task:', error);
        toast.error('Fehler beim Aktualisieren');
        return;
      }

      setTasks(prev => prev.filter(t => t.type !== taskType));
      toast.success(
        taskType === 'mowing' 
          ? '✅ Mähen als erledigt markiert – keine weiteren Erinnerungen bis zum nächsten Termin!'
          : '✅ Düngen als erledigt markiert – keine weiteren Erinnerungen bis zum nächsten Termin!'
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Offene Pflegeaufgaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            🎉 Keine offenen Aufgaben – dein Rasen ist bestens versorgt!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-orange-500" />
          Offene Pflegeaufgaben ({tasks.length})
        </CardTitle>
        <CardDescription>
          Markiere erledigte Aufgaben, um keine weiteren E-Mail-Erinnerungen dafür zu erhalten.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div key={task.type} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              {task.icon}
              <div>
                <p className="font-medium text-sm">{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 shrink-0"
              onClick={() => completeTask(task.type)}
              disabled={completing === task.type}
            >
              {completing === task.type ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Erledigt
                </>
              )}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingCareTasksCard;
