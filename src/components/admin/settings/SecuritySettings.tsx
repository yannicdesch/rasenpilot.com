
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Save, ShieldCheck, Eye } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SecurityMonitoring from '../SecurityMonitoring';

interface SecuritySettingsProps {
  securitySettings: {
    enableTwoFactor: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    blockFailedLogins: boolean;
    maxFailedAttempts: number;
    blockDuration: number;
  };
  isLoading: boolean;
  onSave: (securitySettings: any) => Promise<boolean>;
}

const SecuritySettings = ({ securitySettings, isLoading, onSave }: SecuritySettingsProps) => {
  const [localSettings, setLocalSettings] = React.useState({ ...securitySettings });

  const handleNumberChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setLocalSettings(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSliderChange = (name: string, value: number[]) => {
    setLocalSettings(prev => ({ ...prev, [name]: value[0] }));
  };

  const handleSaveSettings = async () => {
    await onSave(localSettings);
  };

  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings" className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          Einstellungen
        </TabsTrigger>
        <TabsTrigger value="monitoring" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Überwachung
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="settings">
        <div className="space-y-6">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enableTwoFactor" className="text-base font-medium">Zwei-Faktor-Authentifizierung</Label>
                <p className="text-sm text-muted-foreground">Erhöhte Sicherheit durch zusätzlichen Anmeldeschritt</p>
              </div>
              <Switch
                id="enableTwoFactor"
                checked={localSettings.enableTwoFactor}
                onCheckedChange={(checked) => 
                  setLocalSettings(prev => ({ ...prev, enableTwoFactor: checked }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimale Passwortlänge</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  id="passwordMinLength"
                  min={6}
                  max={16}
                  step={1}
                  value={[localSettings.passwordMinLength]}
                  onValueChange={(value) => handleSliderChange('passwordMinLength', value)}
                />
                <span className="w-12 text-center bg-muted rounded-md py-1 px-2">
                  {localSettings.passwordMinLength}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Empfohlen: mindestens 8 Zeichen</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
              <div className="flex items-center space-x-3">
                <Slider
                  id="sessionTimeout"
                  min={5}
                  max={60}
                  step={5}
                  value={[localSettings.sessionTimeout]}
                  onValueChange={(value) => handleSliderChange('sessionTimeout', value)}
                />
                <span className="w-12 text-center bg-muted rounded-md py-1 px-2">
                  {localSettings.sessionTimeout}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Zeit bis zur automatischen Abmeldung</p>
            </div>

            <div className="pt-2 pb-4 border-t">
              <h3 className="text-base font-medium my-4">Anmelde-Schutz</h3>
              
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Label htmlFor="blockFailedLogins" className="text-base font-medium">Login-Versuche beschränken</Label>
                  <p className="text-sm text-muted-foreground">Temporäre Sperrung nach mehreren fehlgeschlagenen Versuchen</p>
                </div>
                <Switch
                  id="blockFailedLogins"
                  checked={localSettings.blockFailedLogins}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ ...prev, blockFailedLogins: checked }))
                  }
                />
              </div>

              {localSettings.blockFailedLogins && (
                <>
                  <div className="space-y-2 mt-4">
                    <Label htmlFor="maxFailedAttempts">Maximale Fehlversuche</Label>
                    <Input
                      id="maxFailedAttempts"
                      type="number"
                      min={1}
                      max={10}
                      value={localSettings.maxFailedAttempts}
                      onChange={handleNumberChange('maxFailedAttempts')}
                    />
                  </div>

                  <div className="space-y-2 mt-4">
                    <Label htmlFor="blockDuration">Sperrzeit (Minuten)</Label>
                    <Input
                      id="blockDuration"
                      type="number"
                      min={1}
                      max={60}
                      value={localSettings.blockDuration}
                      onChange={handleNumberChange('blockDuration')}
                    />
                  </div>
                </>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-6 border-t">
            <Button 
              onClick={handleSaveSettings} 
              disabled={isLoading}
            >
              <ShieldCheck className="mr-2 h-4 w-4" />
              Sicherheitseinstellungen speichern
            </Button>
          </CardFooter>
        </div>
      </TabsContent>
      
      <TabsContent value="monitoring">
        <SecurityMonitoring />
      </TabsContent>
    </Tabs>
  );
};

export default SecuritySettings;
