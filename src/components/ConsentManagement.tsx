import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Mail, Settings } from 'lucide-react';
import { toast } from 'sonner';

const ConsentManagement = () => {
  const [consentMarketing, setConsentMarketing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('consent_marketing')
        .eq('id', user.id)
        .single();

      if (profile) {
        setConsentMarketing(profile.consent_marketing ?? true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const updateConsent = async (newConsent: boolean) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ consent_marketing: newConsent })
        .eq('id', user.id);

      if (error) throw error;

      setConsentMarketing(newConsent);
      toast.success(
        newConsent 
          ? 'E-Mail-Erinnerungen aktiviert' 
          : 'E-Mail-Erinnerungen deaktiviert'
      );
    } catch (error) {
      console.error('Error updating consent:', error);
      toast.error('Fehler beim Speichern der Einstellungen');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">Bitte loggen Sie sich ein, um Ihre Einstellungen zu verwalten.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-5 w-5 text-green-600" />
        <h3 className="text-lg font-semibold">E-Mail-Einstellungen</h3>
      </div>

      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <Label htmlFor="marketing-consent" className="font-medium">
                Rasen-Erinnerungen per E-Mail
              </Label>
            </div>
            <p className="text-sm text-gray-600">
              Erhalten Sie hilfreiche Tipps und Erinnerungen für die optimale Rasenpflege.
              Wir senden Ihnen nach Ihrer Analyse Erinnerungen nach 3, 7, 14, 30 und 60 Tagen.
            </p>
          </div>
          <Switch
            id="marketing-consent"
            checked={consentMarketing}
            onCheckedChange={updateConsent}
            disabled={loading}
          />
        </div>

        {!consentMarketing && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              📱 Sie erhalten keine automatischen Erinnerungen mehr. 
              Sie können jederzeit eine neue Analyse starten, um Ihren Fortschritt zu verfolgen.
            </p>
          </div>
        )}

        {consentMarketing && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">
              Ihre Erinnerungsplan:
            </h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tag 3: Motivation und erste Tipps</li>
              <li>• Tag 7: Wöchentliche Pflege-Empfehlungen</li>
              <li>• Tag 14: Fortschritts-Check</li>
              <li>• Tag 30: Saisonale Rasenpflege</li>
              <li>• Tag 60: Vergleich mit anderen Nutzern</li>
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ConsentManagement;