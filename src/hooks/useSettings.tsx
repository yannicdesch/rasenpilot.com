
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
    passwordMinLength: number;
    maxFailedAttempts: number;
    blockFailedLogins: boolean;
    blockDuration: number;
    sessionTimeout: number;
    enableTwoFactor: boolean;
  };
}

const defaultSettings: SiteSettings = {
  siteName: 'Rasenpilot',
  siteTagline: 'Ihr KI-Experte für Rasenpflege',
  siteEmail: 'info@rasenpilot.de',
  sitePhone: '+49 123 456789',
  siteAddress: 'Musterstraße 1, 12345 Musterstadt',
  googleAnalyticsId: 'G-7F24N28JNH',
  showLovableBadge: true,
  seo: {
    defaultMetaTitle: 'Rasenpilot - KI-Rasenanalyse',
    defaultMetaDescription: 'Professionelle KI-gestützte Rasenanalyse und Pflegeempfehlungen',
    defaultKeywords: 'Rasen, Garten, KI, Analyse, Rasenpflege',
    robotsTxt: 'User-agent: *\nAllow: /'
  },
  security: {
    passwordMinLength: 8,
    maxFailedAttempts: 5,
    blockFailedLogins: true,
    blockDuration: 15,
    sessionTimeout: 30,
    enableTwoFactor: false
  }
};

const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        throw fetchError;
      }

      if (data) {
        // Transform database data to match SiteSettings interface
        const transformedSettings: SiteSettings = {
          id: data.id,
          siteName: data.site_name,
          siteTagline: data.site_tagline,
          siteEmail: data.site_email,
          sitePhone: data.site_phone || '',
          siteAddress: data.site_address || '',
          googleAnalyticsId: data.google_analytics_id || '',
          showLovableBadge: data.show_lovable_badge ?? true,
          seo: data.seo ? {
            defaultMetaTitle: (data.seo as any)?.defaultMetaTitle || defaultSettings.seo.defaultMetaTitle,
            defaultMetaDescription: (data.seo as any)?.defaultMetaDescription || defaultSettings.seo.defaultMetaDescription,
            defaultKeywords: (data.seo as any)?.defaultKeywords || defaultSettings.seo.defaultKeywords,
            robotsTxt: (data.seo as any)?.robotsTxt || defaultSettings.seo.robotsTxt
          } : defaultSettings.seo,
          security: data.security ? {
            passwordMinLength: (data.security as any)?.passwordMinLength || defaultSettings.security.passwordMinLength,
            maxFailedAttempts: (data.security as any)?.maxFailedAttempts || defaultSettings.security.maxFailedAttempts,
            blockFailedLogins: (data.security as any)?.blockFailedLogins ?? defaultSettings.security.blockFailedLogins,
            blockDuration: (data.security as any)?.blockDuration || defaultSettings.security.blockDuration,
            sessionTimeout: (data.security as any)?.sessionTimeout || defaultSettings.security.sessionTimeout,
            enableTwoFactor: (data.security as any)?.enableTwoFactor ?? defaultSettings.security.enableTwoFactor
          } : defaultSettings.security
        };

        setSettings(transformedSettings);
      } else {
        setSettings(defaultSettings);
      }
    } catch (err: any) {
      console.error('Error in fetchSettings:', err);
      setError(err.message);
      setSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: SiteSettings) => {
    try {
      setIsSaving(true);
      setError(null);

      // Transform settings to database format
      const dataToSave = {
        site_name: newSettings.siteName,
        site_tagline: newSettings.siteTagline,
        site_email: newSettings.siteEmail,
        site_phone: newSettings.sitePhone,
        site_address: newSettings.siteAddress,
        google_analytics_id: newSettings.googleAnalyticsId,
        show_lovable_badge: newSettings.showLovableBadge,
        seo: newSettings.seo,
        security: newSettings.security,
        updated_at: new Date().toISOString()
      };

      let result;
      if (settings.id) {
        // Update existing settings
        result = await supabase
          .from('site_settings')
          .update(dataToSave)
          .eq('id', settings.id)
          .select()
          .single();
      } else {
        // Create new settings
        result = await supabase
          .from('site_settings')
          .insert([dataToSave])
          .select()
          .single();
      }

      const { data, error } = result;

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }

      // Update local state with saved data
      const savedSettings: SiteSettings = {
        id: data.id,
        siteName: data.site_name,
        siteTagline: data.site_tagline,
        siteEmail: data.site_email,
        sitePhone: data.site_phone || '',
        siteAddress: data.site_address || '',
        googleAnalyticsId: data.google_analytics_id || '',
        showLovableBadge: data.show_lovable_badge ?? true,
        seo: data.seo ? {
          defaultMetaTitle: (data.seo as any)?.defaultMetaTitle || '',
          defaultMetaDescription: (data.seo as any)?.defaultMetaDescription || '',
          defaultKeywords: (data.seo as any)?.defaultKeywords || '',
          robotsTxt: (data.seo as any)?.robotsTxt || ''
        } : defaultSettings.seo,
        security: data.security ? {
          passwordMinLength: (data.security as any)?.passwordMinLength || 8,
          maxFailedAttempts: (data.security as any)?.maxFailedAttempts || 5,
          blockFailedLogins: (data.security as any)?.blockFailedLogins ?? true,
          blockDuration: (data.security as any)?.blockDuration || 15,
          sessionTimeout: (data.security as any)?.sessionTimeout || 30,
          enableTwoFactor: (data.security as any)?.enableTwoFactor ?? false
        } : defaultSettings.security
      };

      setSettings(savedSettings);
      toast.success('Einstellungen gespeichert!');
      return savedSettings;
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message);
      toast.error('Fehler beim Speichern der Einstellungen', {
        description: err.message
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    isLoading,
    isSaving,
    error,
    saveSettings,
    updateSettings,
    refetch: fetchSettings
  };
};

export default useSettings;
