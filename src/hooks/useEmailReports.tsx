
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
      
      // Check if the site_settings table exists by attempting to query it
      try {
        const { error: tableCheckError } = await supabase
          .from('site_settings')
          .select('id')
          .limit(0);
          
        if (tableCheckError && !tableCheckError.message.includes('permission')) {
          console.error('site_settings table does not exist:', tableCheckError);
          toast.error('Die erforderliche Tabelle existiert nicht', {
            description: 'Bitte erstellen Sie die Tabelle "site_settings" gemäß der Anleitung in der Dokumentation.'
          });
          return false;
        }
      } catch (err) {
        console.error('Error checking for table existence:', err);
        toast.error('Fehler beim Überprüfen der Tabelle');
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
      
      // Log attempt
      console.log(`Attempting to send test email to: ${recipientEmail}`);
      
      // Check if the function exists by calling it
      const { error } = await supabase.functions.invoke('send-email-report', {
        body: { 
          recipient: recipientEmail,
          isTest: true 
        }
      });
      
      if (error) {
        console.error('Error invoking function:', error);
        throw new Error(`Failed to invoke function: ${error.message}`);
      }
      
      toast.success('Test-E-Mail gesendet', {
        description: `Eine E-Mail wurde an ${recipientEmail} gesendet.`
      });
      return true;
    } catch (err: any) {
      console.error('Error sending test email:', err);
      toast.error('Fehler beim Senden der Test-E-Mail', {
        description: err?.message || 'Bitte überprüfen Sie, ob die Supabase-Funktion korrekt eingerichtet ist.'
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
