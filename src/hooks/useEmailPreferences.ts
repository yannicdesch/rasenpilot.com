
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface EmailPreferences {
  reminders: boolean;
  frequency: 'daily' | 'weekly';
  time: string;
}

interface ReminderLog {
  id: string;
  task_type: string;
  task_date: string;
  sent_at: string;
}

export const useEmailPreferences = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    reminders: true,
    frequency: 'daily',
    time: '08:00'
  });
  const [reminderHistory, setReminderHistory] = useState<ReminderLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
    loadReminderHistory();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_preferences')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading email preferences:', error);
        return;
      }

      if (profile?.email_preferences) {
        setPreferences(profile.email_preferences);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminderHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: logs, error } = await supabase
        .from('reminder_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading reminder history:', error);
        return;
      }

      setReminderHistory(logs || []);
    } catch (error) {
      console.error('Error loading reminder history:', error);
    }
  };

  const updatePreferences = async (newPreferences: EmailPreferences): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Sie müssen angemeldet sein');
        return false;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ email_preferences: newPreferences })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating email preferences:', error);
        toast.error('Fehler beim Speichern der Einstellungen');
        return false;
      }

      setPreferences(newPreferences);
      toast.success('E-Mail-Einstellungen gespeichert');
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
      return false;
    }
  };

  const sendTestReminder = async (): Promise<boolean> => {
    try {
      const { error } = await supabase.functions.invoke('send-care-reminders', {
        body: { 
          scheduledRun: false,
          testUser: true
        }
      });

      if (error) {
        console.error('Error sending test reminder:', error);
        toast.error('Fehler beim Senden der Test-E-Mail');
        return false;
      }

      toast.success('Test-E-Mail wurde gesendet!');
      // Reload history to show the new test email
      setTimeout(() => loadReminderHistory(), 1000);
      return true;
    } catch (error) {
      console.error('Error sending test reminder:', error);
      toast.error('Fehler beim Senden der Test-E-Mail');
      return false;
    }
  };

  return {
    preferences,
    reminderHistory,
    loading,
    updatePreferences,
    sendTestReminder,
    refresh: () => {
      loadPreferences();
      loadReminderHistory();
    }
  };
};
