
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface EmailReportConfig {
  enabled: boolean;
  recipientEmail: string;
  sendTime: string; // Format: HH:MM
  lastSent: string | null;
  reportTypes: {
    newRegistrations: boolean;
    siteStatistics: boolean;
  };
}

export const useEmailReports = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const saveEmailConfig = async (config: EmailReportConfig): Promise<boolean> => {
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
        toast.error('Fehler beim Überprüfen der Einstellungstabelle');
        return false;
      }
      
      const hasSettingsTable = existingTables && existingTables.length > 0;
      
      if (!hasSettingsTable) {
        toast.error('Die Einstellungstabelle existiert nicht in der Datenbank', {
          description: 'Bitte erstellen Sie die "site_settings" Tabelle in Supabase.'
        });
        return false;
      }
      
      // Get current settings
      const { data: settings, error: settingsError } = await supabase
        .from('site_settings')
        .select('id, email_reports')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();
      
      if (settingsError && settingsError.code !== 'PGRST116') {
        console.error('Error fetching settings:', settingsError);
        toast.error('Fehler beim Abrufen der Einstellungen');
        return false;
      }
      
      const updateData: any = {};
      
      // If we have settings, update them, otherwise create new
      if (settings) {
        updateData.email_reports = config;
        
        const { error } = await supabase
          .from('site_settings')
          .update(updateData)
          .eq('id', settings.id);
        
        if (error) {
          console.error('Error updating email config:', error);
          toast.error('Fehler beim Speichern der E-Mail-Konfiguration');
          return false;
        }
      } else {
        // No settings record exists, create one
        updateData.email_reports = config;
        updateData.site_name = 'Rasenpilot';
        updateData.site_tagline = 'Ihr intelligenter Rasenberater';
        updateData.site_email = 'info@rasenpilot.de';
        
        const { error } = await supabase
          .from('site_settings')
          .insert(updateData);
        
        if (error) {
          console.error('Error creating email config:', error);
          toast.error('Fehler beim Erstellen der E-Mail-Konfiguration');
          return false;
        }
      }
      
      toast.success('E-Mail-Konfiguration gespeichert');
      return true;
    } catch (err: any) {
      console.error('Error saving email config:', err);
      toast.error('Fehler beim Speichern der E-Mail-Konfiguration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const sendTestEmail = async (recipientEmail: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // In a real implementation with Supabase, we would call an edge function
      // For now, we'll simulate sending an email
      console.log(`Sending test email to: ${recipientEmail}`);
      
      const { error } = await supabase.functions.invoke('send-email-report', {
        body: { 
          recipient: recipientEmail,
          isTest: true 
        }
      });
      
      if (error) {
        throw error;
      }
      
      toast.success('Test-E-Mail gesendet', {
        description: `Eine E-Mail wurde an ${recipientEmail} gesendet.`
      });
      return true;
    } catch (err: any) {
      console.error('Error sending test email:', err);
      toast.error('Fehler beim Senden der Test-E-Mail', {
        description: 'Bitte überprüfen Sie, ob die Supabase-Funktion korrekt eingerichtet ist.'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    saveEmailConfig,
    sendTestEmail
  };
};
