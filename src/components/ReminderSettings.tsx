
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar, Bell } from 'lucide-react';
import { useLawn } from '@/context/LawnContext';
import { toast } from "sonner";
import { supabase } from '@/lib/supabase';

interface ReminderSetting {
  type: string;
  enabled: boolean;
  frequency?: 'daily' | 'weekly' | 'task-based';
  label: string;
  description: string;
}

const ReminderSettings: React.FC = () => {
  const { profile, isAuthenticated } = useLawn();
  const [loading, setLoading] = useState(false);
  const [reminders, setReminders] = useState<ReminderSetting[]>([
    {
      type: 'mowing',
      enabled: true,
      frequency: 'task-based',
      label: 'Mäherinnerungen',
      description: 'Erinnerungen wenn es Zeit ist, den Rasen zu mähen'
    },
    {
      type: 'fertilizing',
      enabled: true,
      frequency: 'task-based',
      label: 'Düngeerinnerungen',
      description: 'Erinnerungen für anstehende Düngung'
    },
    {
      type: 'watering',
      enabled: true,
      frequency: 'daily',
      label: 'Bewässerungserinnerungen',
      description: 'Erinnerungen basierend auf Wetterdaten'
    },
    {
      type: 'tips',
      enabled: false,
      frequency: 'weekly',
      label: 'Wöchentliche Tipps',
      description: 'Erhalten Sie wöchentliche Pflegetipps'
    }
  ]);

  const handleToggleReminder = (index: number) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].enabled = !updatedReminders[index].enabled;
    setReminders(updatedReminders);
  };

  const saveReminderSettings = async () => {
    if (!isAuthenticated) {
      toast("Bitte melden Sie sich an, um Erinnerungen zu speichern");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Kein Benutzer gefunden");
      
      // Save reminder settings to user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          reminder_settings: reminders
        }
      });
      
      if (error) throw error;
      
      toast.success("Erinnerungen gespeichert", {
        description: "Ihre Erinnerungseinstellungen wurden erfolgreich aktualisiert."
      });
    } catch (error: any) {
      console.error("Error saving reminder settings:", error);
      toast.error("Fehler beim Speichern der Erinnerungen", {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-gray-500">Erstellen Sie zuerst ein Rasenprofil, um Erinnerungen einzurichten.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-100">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-green-600" />
          Erinnerungen einrichten
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reminders.map((reminder, index) => (
            <div key={reminder.type} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor={`reminder-${reminder.type}`}>{reminder.label}</Label>
                <p className="text-sm text-muted-foreground">{reminder.description}</p>
              </div>
              <Switch
                id={`reminder-${reminder.type}`}
                checked={reminder.enabled}
                onCheckedChange={() => handleToggleReminder(index)}
              />
            </div>
          ))}
          
          <div className="pt-4">
            <Button 
              onClick={saveReminderSettings} 
              className="w-full"
              disabled={loading}
            >
              <Bell className="mr-2 h-4 w-4" />
              {loading ? 'Wird gespeichert...' : 'Erinnerungen speichern'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReminderSettings;
