// This is a modified version of the component that will include our database setup tool
// We're keeping the original imports and structure, just adding our DatabaseSetup component
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from './settings/GeneralSettings';
import SeoSettings from './settings/SeoSettings';
import SecuritySettings from './settings/SecuritySettings';
import EmailReportSettings from './EmailReportSettings';
import { DatabaseSetup } from './DatabaseSetup';
import { useSettings } from '@/hooks/useSettings';
import { toast } from 'sonner';

export const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, isLoading, updateSettings } = useSettings();

  const handleSaveSettings = async (section: string, data: any) => {
    try {
      const success = await updateSettings(section, data);
      if (success) {
        toast.success(`${section} settings saved successfully`);
      }
      return success;
    } catch (error) {
      console.error(`Error saving ${section} settings:`, error);
      toast.error(`Failed to save ${section} settings`);
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-medium">Website-Einstellungen</h3>
        <p className="text-sm text-muted-foreground">
          Verwalten Sie globale Einstellungen für Ihre Website.
        </p>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">Allgemein</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="security">Sicherheit</TabsTrigger>
          <TabsTrigger value="email-reports">E-Mail Berichte</TabsTrigger>
          <TabsTrigger value="database">Datenbank</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <GeneralSettings 
            settings={settings} 
            isLoading={isLoading} 
            onSave={(data) => handleSaveSettings('general', data)}
            onClearCache={() => toast.success('Cache cleared')}
          />
        </TabsContent>
        
        <TabsContent value="seo" className="space-y-4">
          <SeoSettings 
            seoSettings={settings?.seo || {
              defaultMetaTitle: '',
              defaultMetaDescription: '',
              defaultKeywords: '',
              robotsTxt: ''
            }} 
            isLoading={isLoading} 
            onSave={(data) => handleSaveSettings('seo', data)}
          />
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <SecuritySettings 
            securitySettings={settings?.security || {
              enableTwoFactor: false,
              passwordMinLength: 8,
              sessionTimeout: 30,
              blockFailedLogins: true,
              maxFailedAttempts: 5,
              blockDuration: 15
            }} 
            isLoading={isLoading} 
            onSave={(data) => handleSaveSettings('security', data)}
          />
        </TabsContent>
        
        <TabsContent value="email-reports" className="space-y-4">
          <EmailReportSettings />
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <DatabaseSetup />
        </TabsContent>
      </Tabs>
    </div>
  );
};
