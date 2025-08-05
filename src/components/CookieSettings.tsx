import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Settings, Cookie } from 'lucide-react';
import { CookiePreferences } from './CookieConsent';
import { getCookiePreferences } from '@/utils/cookieUtils';

const CookieSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const savedPreferences = getCookiePreferences();
    if (savedPreferences) {
      setPreferences(savedPreferences);
    }
  }, []);

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const savePreferences = () => {
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { detail: preferences }));
    
    // Show success message or feedback
    alert('Cookie-Einstellungen gespeichert!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-5 w-5" />
          Cookie-Einstellungen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Verwalten Sie Ihre Cookie-Präferenzen. Änderungen werden sofort wirksam.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Notwendige Cookies</p>
              <p className="text-sm text-muted-foreground">
                Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.
              </p>
            </div>
            <Switch checked disabled />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Analyse-Cookies</p>
              <p className="text-sm text-muted-foreground">
                Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie anonyme Informationen sammeln und melden.
              </p>
            </div>
            <Switch 
              checked={preferences.analytics}
              onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Marketing-Cookies</p>
              <p className="text-sm text-muted-foreground">
                Diese Cookies werden verwendet, um Ihnen relevante Werbung und Marketinginhalte zu zeigen.
              </p>
            </div>
            <Switch 
              checked={preferences.marketing}
              onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <p className="font-medium">Präferenz-Cookies</p>
              <p className="text-sm text-muted-foreground">
                Diese Cookies speichern Ihre Einstellungen und Präferenzen, um Ihre Benutzererfahrung zu personalisieren.
              </p>
            </div>
            <Switch 
              checked={preferences.preferences}
              onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
            />
          </div>
        </div>
        
        <Button onClick={savePreferences} className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Einstellungen speichern
        </Button>
        
        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Hinweis:</strong> Das Deaktivieren bestimmter Cookies kann die Funktionalität der Website beeinträchtigen.</p>
          <p>Weitere Informationen über unsere Verwendung von Cookies finden Sie in unserer Datenschutzerklärung.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CookieSettings;