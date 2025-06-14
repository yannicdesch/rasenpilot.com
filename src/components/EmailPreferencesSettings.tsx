
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Clock, CheckCircle } from 'lucide-react';

interface EmailPreferences {
  reminders: boolean;
  frequency: 'daily' | 'weekly';
  time: string;
}

export const EmailPreferencesSettings = () => {
  const [preferences, setPreferences] = useState<EmailPreferences>({
    reminders: true,
    frequency: 'daily',
    time: '08:00'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastReminderSent, setLastReminderSent] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email_preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading email preferences:', error);
        return;
      }

      if (profile?.email_preferences) {
        setPreferences(profile.email_preferences);
      }

      // Get last reminder sent
      const { data: lastLog } = await supabase
        .from('reminder_logs')
        .select('sent_at')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      if (lastLog) {
        setLastReminderSent(new Date(lastLog.sent_at).toLocaleDateString('de-DE'));
      }

    } catch (error) {
      console.error('Error loading preferences:', error);
      toast.error('Fehler beim Laden der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Sie müssen angemeldet sein');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({ email_preferences: preferences })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving email preferences:', error);
        toast.error('Fehler beim Speichern der Einstellungen');
        return;
      }

      toast.success('E-Mail-Einstellungen gespeichert');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    } finally {
      setSaving(false);
    }
  };

  const testReminder = async () => {
    try {
      setSaving(true);
      const { data, error } = await supabase.functions.invoke('send-care-reminders', {
        body: { 
          scheduledRun: false,
          testUser: true
        }
      });

      if (error) {
        console.error('Error sending test reminder:', error);
        toast.error('Fehler beim Senden der Test-E-Mail');
        return;
      }

      toast.success('Test-E-Mail wurde gesendet!');
    } catch (error) {
      console.error('Error sending test reminder:', error);
      toast.error('Fehler beim Senden der Test-E-Mail');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            E-Mail-Erinnerungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          E-Mail-Erinnerungen
        </CardTitle>
        <CardDescription>
          Lassen Sie sich automatisch an Ihre Rasenpflege-Aufgaben erinnern
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reminders">Erinnerungen aktivieren</Label>
            <p className="text-sm text-muted-foreground">
              Erhalten Sie E-Mail-Benachrichtigungen für anstehende Rasenpflege-Aufgaben
            </p>
          </div>
          <Switch
            id="reminders"
            checked={preferences.reminders}
            onCheckedChange={(checked) =>
              setPreferences(prev => ({ ...prev, reminders: checked }))
            }
          />
        </div>

        {preferences.reminders && (
          <>
            <div className="space-y-2">
              <Label>Häufigkeit</Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value: 'daily' | 'weekly') =>
                  setPreferences(prev => ({ ...prev, frequency: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Täglich</SelectItem>
                  <SelectItem value="weekly">Wöchentlich</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Uhrzeit
              </Label>
              <Select
                value={preferences.time}
                onValueChange={(value) =>
                  setPreferences(prev => ({ ...prev, time: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="06:00">06:00 Uhr</SelectItem>
                  <SelectItem value="07:00">07:00 Uhr</SelectItem>
                  <SelectItem value="08:00">08:00 Uhr</SelectItem>
                  <SelectItem value="09:00">09:00 Uhr</SelectItem>
                  <SelectItem value="10:00">10:00 Uhr</SelectItem>
                  <SelectItem value="18:00">18:00 Uhr</SelectItem>
                  <SelectItem value="19:00">19:00 Uhr</SelectItem>
                  <SelectItem value="20:00">20:00 Uhr</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {lastReminderSent && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-600" />
            Letzte Erinnerung gesendet: {lastReminderSent}
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <Button 
            onClick={savePreferences} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </Button>
          
          {preferences.reminders && (
            <Button 
              variant="outline" 
              onClick={testReminder}
              disabled={saving}
            >
              Test-E-Mail senden
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailPreferencesSettings;
