
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { useSettings } from '@/hooks/useSettings';
import { AlertCircle, Save } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import GeneralSettings from './settings/GeneralSettings';
import SeoSettings from './settings/SeoSettings';
import SecuritySettings from './settings/SecuritySettings';
import EmailReportSettings from './EmailReportSettings';

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, isLoading, error, saveSettings, clearCache } = useSettings();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-green-800">Einstellungen</h2>
        <p className="text-gray-500">
          Verwalten Sie die grundlegenden Einstellungen und Konfigurationen Ihrer Website
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>
            {error} 
            {error.includes('table') && (
              <span className="block mt-1">
                Es wird empfohlen, die erforderlichen Tabellen in Ihrem Supabase-Projekt zu erstellen. 
                Siehe die Dokumentation für Details.
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full grid grid-cols-4 rounded-b-none bg-muted/50">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
            <TabsTrigger value="security">Sicherheit</TabsTrigger>
            <TabsTrigger value="emails">E-Mail Berichte</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettings
              settings={settings}
              isLoading={isLoading}
              onSave={saveSettings}
              onClearCache={clearCache}
            />
          </TabsContent>
          
          <TabsContent value="seo">
            <SeoSettings
              seoSettings={settings.seo}
              isLoading={isLoading}
              onSave={(seo) => saveSettings({ ...settings, seo })}
            />
          </TabsContent>
          
          <TabsContent value="security">
            <SecuritySettings
              securitySettings={settings.security}
              isLoading={isLoading}
              onSave={(security) => saveSettings({ ...settings, security })}
            />
          </TabsContent>
          
          <TabsContent value="emails">
            <EmailReportSettings />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default SiteSettings;
