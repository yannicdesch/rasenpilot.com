
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { Mail, Clock, CheckCircle, Send } from 'lucide-react';

export const EmailPreferencesSettings = () => {
  const { 
    preferences, 
    reminderHistory, 
    loading, 
    updatePreferences, 
    sendTestReminder 
  } = useEmailPreferences();
  
  const [saving, setSaving] = useState(false);

  const handleSavePreferences = async () => {
    setSaving(true);
    await updatePreferences(preferences);
    setSaving(false);
  };

  const handleTestEmail = async () => {
    setSaving(true);
    const success = await sendTestReminder();
    setSaving(false);
    
    if (success) {
      toast.success('Test-E-Mail wurde erfolgreich gesendet!');
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

  const lastReminderSent = reminderHistory.length > 0 
    ? new Date(reminderHistory[0].sent_at).toLocaleDateString('de-DE')
    : null;

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
              updatePreferences({ ...preferences, reminders: checked })
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
                  updatePreferences({ ...preferences, frequency: value })
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
                  updatePreferences({ ...preferences, time: value })
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
            onClick={handleSavePreferences} 
            disabled={saving}
            className="flex-1"
          >
            {saving ? 'Speichern...' : 'Einstellungen speichern'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleTestEmail}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            {saving ? 'Senden...' : 'Test-E-Mail'}
          </Button>
        </div>

        {reminderHistory.length > 0 && (
          <div className="space-y-2">
            <Label>Letzte Erinnerungen</Label>
            <div className="max-h-32 overflow-y-auto border rounded p-2 bg-gray-50">
              {reminderHistory.slice(0, 5).map((log) => (
                <div key={log.id} className="text-sm flex justify-between py-1">
                  <span>{log.task_type}</span>
                  <span className="text-muted-foreground">
                    {new Date(log.sent_at).toLocaleDateString('de-DE')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailPreferencesSettings;
