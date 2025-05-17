
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface SiteSettings {
  id?: string;
  siteName: string;
  siteTagline: string;
  siteEmail: string;
  sitePhone: string;
  siteAddress: string;
  googleAnalyticsId: string;
  showLovableBadge: boolean;
  seo: {
    defaultMetaTitle: string;
    defaultMetaDescription: string;
    defaultKeywords: string;
    robotsTxt: string;
  };
  security: {
    enableTwoFactor: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    blockFailedLogins: boolean;
    maxFailedAttempts: number;
    blockDuration: number;
  };
  updated_at?: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'Rasenpilot',
  siteTagline: 'Ihr intelligenter Rasenberater',
  siteEmail: 'info@rasenpilot.de',
  sitePhone: '+49 123 456789',
  siteAddress: 'Rasenweg 1, 10115 Berlin',
  googleAnalyticsId: 'G-7F24N28JNH',
  showLovableBadge: true,
  seo: {
    defaultMetaTitle: 'Rasenpilot - Ihr intelligenter Rasenberater',
    defaultMetaDescription: 'Rasenpilot - Ihr KI-gestützter Rasenpflege-Assistent für einen gesunden, schönen Rasen',
    defaultKeywords: 'Rasenpflege, KI-Rasenberater, Rasen-Assistent, Rasen düngen, Rasen mähen, Rasenpilot',
    robotsTxt: 'User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /dashboard\nDisallow: /profile',
  },
  security: {
    enableTwoFactor: false,
    passwordMinLength: 8,
    sessionTimeout: 30,
    blockFailedLogins: true,
    maxFailedAttempts: 5,
    blockDuration: 15,
  }
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if settings table exists
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'site_settings');
      
      if (tablesError) {
        console.error('Error checking for settings table:', tablesError);
        throw new Error('Failed to check for settings table');
      }
      
      const hasSettingsTable = existingTables && existingTables.length > 0;
      
      if (!hasSettingsTable) {
        console.log('Settings table does not exist, using default settings');
        toast.warning('Einstellungstabelle existiert nicht in der Datenbank', {
          description: 'Verwende Standardeinstellungen. Erstellen Sie die Tabelle "site_settings" in Supabase.'
        });
        return;
      }
      
      // Fetch settings from the database
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching settings:', error);
          throw new Error('Failed to fetch settings');
        }
        
        // No settings found, create default settings
        const { error: insertError } = await supabase
          .from('site_settings')
          .insert([DEFAULT_SETTINGS]);
        
        if (insertError) {
          console.error('Error creating default settings:', insertError);
          throw new Error('Failed to create default settings');
        }
        
        // Return default settings
        return;
      }
      
      // Successfully fetched settings
      setSettings(data);
      
    } catch (err: any) {
      console.error('Error in fetchSettings:', err);
      setError(err.message);
      toast.error('Fehler beim Laden der Einstellungen', {
        description: 'Verwende Standardeinstellungen als Fallback.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const saveSettings = async (newSettings: SiteSettings): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if settings table exists
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'site_settings');
      
      if (tablesError) {
        console.error('Error checking for settings table:', tablesError);
        throw new Error('Failed to check for settings table');
      }
      
      const hasSettingsTable = existingTables && existingTables.length > 0;
      
      if (!hasSettingsTable) {
        console.log('Settings table does not exist, cannot save settings');
        toast.error('Einstellungstabelle existiert nicht in der Datenbank', {
          description: 'Erstellen Sie die Tabelle "site_settings" in Supabase.'
        });
        return false;
      }
      
      // If we have an id, update the existing record
      if (settings.id) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id);
        
        if (error) {
          console.error('Error updating settings:', error);
          throw new Error('Failed to update settings');
        }
      } else {
        // Create a new record
        const { error } = await supabase
          .from('site_settings')
          .insert([{
            ...newSettings,
            updated_at: new Date().toISOString()
          }]);
        
        if (error) {
          console.error('Error creating settings:', error);
          throw new Error('Failed to create settings');
        }
      }
      
      // Update local state
      setSettings(newSettings);
      
      toast.success('Einstellungen gespeichert', {
        description: 'Ihre Änderungen wurden erfolgreich übernommen'
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in saveSettings:', err);
      setError(err.message);
      toast.error('Fehler beim Speichern der Einstellungen', {
        description: err.message
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearCache = async (): Promise<boolean> => {
    try {
      // In a real app, this would clear server-side caches
      // For this demo, we'll simulate clearing the cache
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Cache geleert', {
        description: 'Der Cache wurde erfolgreich geleert'
      });
      
      return true;
    } catch (err: any) {
      toast.error('Fehler beim Leeren des Caches', {
        description: err.message
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { 
    settings, 
    isLoading, 
    error,
    saveSettings,
    clearCache
  };
};
