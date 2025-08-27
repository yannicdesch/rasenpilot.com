
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import useSettings, { SiteSettings } from '@/hooks/useSettings';
import { Settings, Globe, Shield, Search, Mail, TestTube } from 'lucide-react';
import EmailReportSettings from './EmailReportSettings';
import EmailTestPanel from './EmailTestPanel';

const SiteSettingsComponent = () => {
  const { settings, isLoading, isSaving, saveSettings, updateSettings } = useSettings();

  const handleSave = async () => {
    try {
      await saveSettings(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleInputChange = (field: keyof SiteSettings, value: any) => {
    updateSettings({ [field]: value });
  };

  const handleNestedChange = (parent: keyof SiteSettings, field: string, value: any) => {
    const parentValue = settings[parent] as any;
    updateSettings({
      [parent]: {
        ...parentValue,
        [field]: value
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p>Lade Einstellungen...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Website-Einstellungen</h1>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Speichern...' : 'Einstellungen speichern'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            E-Mail
          </TabsTrigger>
          <TabsTrigger value="email-test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            E-Mail Tests
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Erweitert
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>
                Grundlegende Informationen über Ihre Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Website-Name</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange('siteName', e.target.value)}
                    placeholder="Meine Website"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Tagline</Label>
                  <Input
                    id="siteTagline"
                    value={settings.siteTagline}
                    onChange={(e) => handleInputChange('siteTagline', e.target.value)}
                    placeholder="Ein kurzer Slogan"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteEmail">Kontakt E-Mail</Label>
                <Input
                  id="siteEmail"
                  type="email"
                  value={settings.siteEmail}
                  onChange={(e) => handleInputChange('siteEmail', e.target.value)}
                  placeholder="kontakt@example.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sitePhone">Telefon</Label>
                  <Input
                    id="sitePhone"
                    value={settings.sitePhone}
                    onChange={(e) => handleInputChange('sitePhone', e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteAddress">Adresse</Label>
                <Textarea
                  id="siteAddress"
                  value={settings.siteAddress}
                  onChange={(e) => handleInputChange('siteAddress', e.target.value)}
                  placeholder="Musterstraße 1, 12345 Musterstadt"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLovableBadge"
                  checked={settings.showLovableBadge}
                  onCheckedChange={(checked) => handleInputChange('showLovableBadge', checked)}
                />
                <Label htmlFor="showLovableBadge">Lovable Badge anzeigen</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO-Einstellungen</CardTitle>
              <CardDescription>
                Suchmaschinenoptimierung für Ihre Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultMetaTitle">Standard Meta-Titel</Label>
                <Input
                  id="defaultMetaTitle"
                  value={settings.seo.defaultMetaTitle}
                  onChange={(e) => handleNestedChange('seo', 'defaultMetaTitle', e.target.value)}
                  placeholder="Meine Website - Slogan"
                  maxLength={60}
                />
                <p className="text-sm text-muted-foreground">
                  Empfohlen: 50-60 Zeichen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultMetaDescription">Standard Meta-Beschreibung</Label>
                <Textarea
                  id="defaultMetaDescription"
                  value={settings.seo.defaultMetaDescription}
                  onChange={(e) => handleNestedChange('seo', 'defaultMetaDescription', e.target.value)}
                  placeholder="Eine kurze Beschreibung Ihrer Website"
                  maxLength={160}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Empfohlen: 150-160 Zeichen
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultKeywords">Standard Keywords</Label>
                <Input
                  id="defaultKeywords"
                  value={settings.seo.defaultKeywords}
                  onChange={(e) => handleNestedChange('seo', 'defaultKeywords', e.target.value)}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="robotsTxt">Robots.txt Inhalt</Label>
                <Textarea
                  id="robotsTxt"
                  value={settings.seo.robotsTxt}
                  onChange={(e) => handleNestedChange('seo', 'robotsTxt', e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /"
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie Sicherheitsaspekte Ihrer Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimale Passwort-Länge</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    min="6"
                    max="50"
                    value={settings.security.passwordMinLength}
                    onChange={(e) => handleNestedChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="1440"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleNestedChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="blockFailedLogins"
                  checked={settings.security.blockFailedLogins}
                  onCheckedChange={(checked) => handleNestedChange('security', 'blockFailedLogins', checked)}
                />
                <Label htmlFor="blockFailedLogins">Fehlgeschlagene Anmeldungen blockieren</Label>
              </div>

              {settings.security.blockFailedLogins && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxFailedAttempts">Max. fehlgeschlagene Versuche</Label>
                    <Input
                      id="maxFailedAttempts"
                      type="number"
                      min="1"
                      max="20"
                      value={settings.security.maxFailedAttempts}
                      onChange={(e) => handleNestedChange('security', 'maxFailedAttempts', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="blockDuration">Blockierungsdauer (Minuten)</Label>
                    <Input
                      id="blockDuration"
                      type="number"
                      min="1"
                      max="1440"
                      value={settings.security.blockDuration}
                      onChange={(e) => handleNestedChange('security', 'blockDuration', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Switch
                  id="enableTwoFactor"
                  checked={settings.security.enableTwoFactor}
                  onCheckedChange={(checked) => handleNestedChange('security', 'enableTwoFactor', checked)}
                />
                <Label htmlFor="enableTwoFactor">Zwei-Faktor-Authentifizierung aktivieren</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <EmailReportSettings />
        </TabsContent>

        <TabsContent value="email-test" className="space-y-6">
          <EmailTestPanel />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Einstellungen</CardTitle>
              <CardDescription>
                Erweiterte Konfigurationsoptionen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Systeminfo</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Version:</strong> 1.0.0</p>
                  <p><strong>Letzte Aktualisierung:</strong> {new Date().toLocaleDateString('de-DE')}</p>
                  <p><strong>Umgebung:</strong> Produktion</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                <h3 className="font-medium mb-2 text-red-800">Gefahr Zone</h3>
                <p className="text-sm text-red-700 mb-3">
                  Diese Aktionen können nicht rückgängig gemacht werden.
                </p>
                <Button variant="destructive" size="sm">
                  Cache leeren
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettingsComponent;
