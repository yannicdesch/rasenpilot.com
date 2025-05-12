
import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { Bell } from 'lucide-react';

interface NotificationPreferences {
  weeklyTips: boolean;
  careReminders: boolean;
  weatherAlerts: boolean;
  productUpdates: boolean;
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    weeklyTips: true,
    careReminders: true,
    weatherAlerts: true,
    productUpdates: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPreferences = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.user_metadata?.notification_preferences) {
        setPreferences(user.user_metadata.notification_preferences);
      }
    };

    fetchPreferences();
  }, []);

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          notification_preferences: preferences
        }
      });
      
      if (error) throw error;
      toast.success('Benachrichtigungseinstellungen gespeichert');
    } catch (error: any) {
      toast.error(`Fehler beim Speichern: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="weekly-tips">Wöchentliche Rasentipps</Label>
          <p className="text-sm text-muted-foreground">Erhalten Sie wöchentliche Tipps zur Rasenpflege</p>
        </div>
        <Switch
          id="weekly-tips"
          checked={preferences.weeklyTips}
          onCheckedChange={() => handleToggle('weeklyTips')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="care-reminders">Pflegeerinnerungen</Label>
          <p className="text-sm text-muted-foreground">Erinnerungen für anstehende Rasenarbeiten</p>
        </div>
        <Switch
          id="care-reminders"
          checked={preferences.careReminders}
          onCheckedChange={() => handleToggle('careReminders')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="weather-alerts">Wetterwarnungen</Label>
          <p className="text-sm text-muted-foreground">Benachrichtigungen bei extremen Wetterbedingungen</p>
        </div>
        <Switch
          id="weather-alerts"
          checked={preferences.weatherAlerts}
          onCheckedChange={() => handleToggle('weatherAlerts')}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="product-updates">Produktupdates</Label>
          <p className="text-sm text-muted-foreground">Informationen über neue Features und Updates</p>
        </div>
        <Switch
          id="product-updates"
          checked={preferences.productUpdates}
          onCheckedChange={() => handleToggle('productUpdates')}
        />
      </div>
      
      <Button 
        className="w-full" 
        onClick={savePreferences} 
        disabled={loading}
      >
        <Bell className="mr-2 h-4 w-4" />
        {loading ? 'Wird gespeichert...' : 'Einstellungen speichern'}
      </Button>
    </div>
  );
};

export default NotificationSettings;
