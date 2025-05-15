
import React, { useState } from 'react';
import { Settings, Save, Globe, Key, Lock, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const SiteSettings = () => {
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'Rasenpilot',
    siteTagline: 'Ihr intelligenter Rasenberater',
    siteEmail: 'info@rasenpilot.de',
    sitePhone: '+49 123 456789',
    siteAddress: 'Rasenweg 1, 10115 Berlin',
    googleAnalyticsId: 'UA-12345678-1',
    showLovableBadge: true,
  });
  
  const [seoSettings, setSeoSettings] = useState({
    defaultMetaTitle: 'Rasenpilot - Ihr intelligenter Rasenberater',
    defaultMetaDescription: 'Rasenpilot - Ihr KI-gestützter Rasenpflege-Assistent für einen gesunden, schönen Rasen',
    defaultKeywords: 'Rasenpflege, KI-Rasenberater, Rasen-Assistent, Rasen düngen, Rasen mähen, Rasenpilot',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /profile',
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    enableTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    blockFailedLogins: true,
    maxFailedAttempts: 5,
    blockDuration: 15,
  });
  
  const handleGeneralChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setGeneralSettings({
      ...generalSettings,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSwitchChange = (name: string, checked: boolean) => {
    setGeneralSettings({
      ...generalSettings,
      [name]: checked,
    });
  };
  
  const handleSeoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSeoSettings({
      ...seoSettings,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) : e.target.value;
    setSecuritySettings({
      ...securitySettings,
      [e.target.name]: value,
    });
  };
  
  const handleSecuritySwitchChange = (name: string, checked: boolean) => {
    setSecuritySettings({
      ...securitySettings,
      [name]: checked,
    });
  };
  
  const handleSaveGeneral = () => {
    toast.success('Allgemeine Einstellungen gespeichert', {
      description: 'Ihre Änderungen wurden erfolgreich übernommen'
    });
  };
  
  const handleSaveSeo = () => {
    toast.success('SEO-Einstellungen gespeichert', {
      description: 'Ihre Änderungen wurden erfolgreich übernommen'
    });
  };
  
  const handleSaveSecurity = () => {
    toast.success('Sicherheitseinstellungen gespeichert', {
      description: 'Ihre Änderungen wurden erfolgreich übernommen'
    });
  };
  
  const handleClearCache = () => {
    toast.success('Cache geleert', {
      description: 'Der Cache wurde erfolgreich geleert'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-green-800 flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Website-Einstellungen
        </h2>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Sicherheit
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>
                Bearbeiten Sie die grundlegenden Informationen Ihrer Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Website-Name</Label>
                  <Input
                    id="siteName"
                    name="siteName"
                    value={generalSettings.siteName}
                    onChange={handleGeneralChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteTagline">Slogan</Label>
                  <Input
                    id="siteTagline"
                    name="siteTagline"
                    value={generalSettings.siteTagline}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteEmail">Kontakt-E-Mail</Label>
                <Input
                  id="siteEmail"
                  name="siteEmail"
                  type="email"
                  value={generalSettings.siteEmail}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="sitePhone">Telefonnummer</Label>
                  <Input
                    id="sitePhone"
                    name="sitePhone"
                    value={generalSettings.sitePhone}
                    onChange={handleGeneralChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteAddress">Adresse</Label>
                  <Input
                    id="siteAddress"
                    name="siteAddress"
                    value={generalSettings.siteAddress}
                    onChange={handleGeneralChange}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                <Input
                  id="googleAnalyticsId"
                  name="googleAnalyticsId"
                  value={generalSettings.googleAnalyticsId}
                  onChange={handleGeneralChange}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="showLovableBadge"
                  checked={generalSettings.showLovableBadge}
                  onCheckedChange={(checked) => handleSwitchChange('showLovableBadge', checked)}
                />
                <Label htmlFor="showLovableBadge">Lovable-Badge anzeigen</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleClearCache} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Cache leeren
              </Button>
              <Button onClick={handleSaveGeneral} className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO-Einstellungen</CardTitle>
              <CardDescription>
                Optimieren Sie Ihre Website für Suchmaschinen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="defaultMetaTitle">Standard Meta-Titel</Label>
                <Input
                  id="defaultMetaTitle"
                  name="defaultMetaTitle"
                  value={seoSettings.defaultMetaTitle}
                  onChange={handleSeoChange}
                />
                <p className="text-xs text-muted-foreground">
                  {seoSettings.defaultMetaTitle.length}/60 Zeichen
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultMetaDescription">Standard Meta-Beschreibung</Label>
                <Textarea
                  id="defaultMetaDescription"
                  name="defaultMetaDescription"
                  value={seoSettings.defaultMetaDescription}
                  onChange={handleSeoChange}
                  className="resize-y h-20"
                />
                <p className="text-xs text-muted-foreground">
                  {seoSettings.defaultMetaDescription.length}/160 Zeichen
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultKeywords">Standard Keywords</Label>
                <Input
                  id="defaultKeywords"
                  name="defaultKeywords"
                  value={seoSettings.defaultKeywords}
                  onChange={handleSeoChange}
                />
                <p className="text-xs text-muted-foreground">
                  Mit Kommas getrennte Keywords
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="robotsTxt">robots.txt Inhalt</Label>
                <Textarea
                  id="robotsTxt"
                  name="robotsTxt"
                  value={seoSettings.robotsTxt}
                  onChange={handleSeoChange}
                  className="resize-y h-28 font-mono"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSeo} className="ml-auto bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="h-4 w-4" />
                SEO-Einstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>
                Konfigurieren Sie die Sicherheitsoptionen Ihrer Website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enableTwoFactor">Zwei-Faktor-Authentifizierung</Label>
                  <p className="text-sm text-muted-foreground">
                    Erhöht die Sicherheit durch zusätzlichen Verifizierungsschritt
                  </p>
                </div>
                <Switch
                  id="enableTwoFactor"
                  checked={securitySettings.enableTwoFactor}
                  onCheckedChange={(checked) => handleSecuritySwitchChange('enableTwoFactor', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="passwordMinLength">Minimale Passwortlänge</Label>
                  <Input
                    id="passwordMinLength"
                    name="passwordMinLength"
                    type="number"
                    min="6"
                    max="20"
                    value={securitySettings.passwordMinLength}
                    onChange={handleSecurityChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session-Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    name="sessionTimeout"
                    type="number"
                    min="5"
                    value={securitySettings.sessionTimeout}
                    onChange={handleSecurityChange}
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="blockFailedLogins">Fehlgeschlagene Logins blockieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporär blockieren nach mehreren fehlgeschlagenen Versuchen
                  </p>
                </div>
                <Switch
                  id="blockFailedLogins"
                  checked={securitySettings.blockFailedLogins}
                  onCheckedChange={(checked) => handleSecuritySwitchChange('blockFailedLogins', checked)}
                />
              </div>
              
              {securitySettings.blockFailedLogins && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-6 border-l-2 border-green-100">
                  <div className="space-y-2">
                    <Label htmlFor="maxFailedAttempts">Max. Fehlversuche</Label>
                    <Input
                      id="maxFailedAttempts"
                      name="maxFailedAttempts"
                      type="number"
                      min="3"
                      max="10"
                      value={securitySettings.maxFailedAttempts}
                      onChange={handleSecurityChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="blockDuration">Blockierungsdauer (Minuten)</Label>
                    <Input
                      id="blockDuration"
                      name="blockDuration"
                      type="number"
                      min="5"
                      value={securitySettings.blockDuration}
                      onChange={handleSecurityChange}
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <div className="flex items-start gap-2">
                  <Key className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-800">API-Schlüssel verwalten</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      API-Schlüssel sollten in einem sicheren Bereich verwaltet werden. 
                      In einer vollständigen Implementierung würde hier eine API-Schlüsselverwaltung integriert sein.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveSecurity} className="ml-auto bg-green-600 hover:bg-green-700 flex items-center gap-2">
                <Save className="h-4 w-4" />
                Sicherheitseinstellungen speichern
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettings;
