import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initializeMetaPixel } from '@/lib/analytics/metaPixel';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const defaultPreferences: CookiePreferences = {
  necessary: true, // Always true, can't be disabled
  analytics: false,
  marketing: false,
  preferences: false,
};

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPreferences = localStorage.getItem('cookie-preferences');
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', 'true');
    localStorage.setItem('cookie-preferences', JSON.stringify(prefs));
    setPreferences(prefs);
    setIsVisible(false);
    setShowPreferences(false);
    
    // Initialize Meta Pixel if marketing consent is given
    if (prefs.marketing) {
      initializeMetaPixel();
    }
    
    // Trigger event for other components to listen to
    window.dispatchEvent(new CustomEvent('cookiePreferencesChanged', { detail: prefs }));
  };

  const acceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    savePreferences(defaultPreferences);
  };

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === 'necessary') return; // Can't change necessary cookies
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="bg-background/95 backdrop-blur-sm border-t shadow-lg px-4 py-3 md:py-4">
          <div className="max-w-screen-md mx-auto flex items-center gap-3">
            <p className="text-xs text-muted-foreground flex-1 leading-snug">
              Wir nutzen Cookies für Analyse & Werbung.{' '}
              <Link to="/datenschutz" className="text-primary hover:underline">Mehr erfahren</Link>
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={acceptNecessary} variant="ghost" size="sm" className="text-xs h-8 px-3">
                Nur nötige
              </Button>
              <Button onClick={acceptAll} size="sm" className="text-xs h-8 px-3">
                OK
              </Button>
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Cookie-Präferenzen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Notwendige Cookies</p>
                          <p className="text-xs text-muted-foreground">Erforderlich</p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Analyse-Cookies</p>
                          <p className="text-xs text-muted-foreground">Website verbessern</p>
                        </div>
                        <Switch 
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Marketing-Cookies</p>
                          <p className="text-xs text-muted-foreground">Personalisierte Werbung</p>
                        </div>
                        <Switch 
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Präferenz-Cookies</p>
                          <p className="text-xs text-muted-foreground">Einstellungen speichern</p>
                        </div>
                        <Switch 
                          checked={preferences.preferences}
                          onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => savePreferences(preferences)} className="flex-1" size="sm">Speichern</Button>
                      <Button onClick={() => setShowPreferences(false)} variant="outline" className="flex-1" size="sm">Abbrechen</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;