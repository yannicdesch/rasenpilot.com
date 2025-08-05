import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Cookie, Settings, X } from 'lucide-react';
import { Link } from 'react-router-dom';

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
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md">
        <Card className="border shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Cookie className="h-5 w-5" />
              Cookie-Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Wir verwenden Cookies, um Ihre Erfahrung zu verbessern und unsere Website zu analysieren. 
              Sie können Ihre Präferenzen jederzeit anpassen.
            </p>
            
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button onClick={acceptAll} className="flex-1">
                Alle akzeptieren
              </Button>
              <Button onClick={acceptNecessary} variant="outline" className="flex-1">
                Nur notwendige
              </Button>
              <Dialog open={showPreferences} onOpenChange={setShowPreferences}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
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
                          <p className="font-medium">Notwendige Cookies</p>
                          <p className="text-sm text-muted-foreground">
                            Erforderlich für grundlegende Funktionen
                          </p>
                        </div>
                        <Switch checked disabled />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Analyse-Cookies</p>
                          <p className="text-sm text-muted-foreground">
                            Helfen uns die Website zu verbessern
                          </p>
                        </div>
                        <Switch 
                          checked={preferences.analytics}
                          onCheckedChange={(checked) => handlePreferenceChange('analytics', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Marketing-Cookies</p>
                          <p className="text-sm text-muted-foreground">
                            Für personalisierte Werbung
                          </p>
                        </div>
                        <Switch 
                          checked={preferences.marketing}
                          onCheckedChange={(checked) => handlePreferenceChange('marketing', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Präferenz-Cookies</p>
                          <p className="text-sm text-muted-foreground">
                            Speichern Ihre Einstellungen
                          </p>
                        </div>
                        <Switch 
                          checked={preferences.preferences}
                          onCheckedChange={(checked) => handlePreferenceChange('preferences', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => savePreferences(preferences)}
                        className="flex-1"
                      >
                        Speichern
                      </Button>
                      <Button 
                        onClick={() => setShowPreferences(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Abbrechen
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Weitere Informationen finden Sie in unserer{' '}
                      <Link to="/datenschutz" className="text-primary hover:underline">
                        Datenschutzerklärung
                      </Link>
                    </p>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Mehr Details in unserer{' '}
              <Link to="/datenschutz" className="text-primary hover:underline">
                Datenschutzerklärung
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CookieConsent;