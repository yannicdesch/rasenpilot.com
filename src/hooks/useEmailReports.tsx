
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
      
      // Check if table exists by querying it directly
      const { error: tableCheckError } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1);
      
      // If the table doesn't exist, we'll get a specific error
      if (tableCheckError && !tableCheckError.message.includes('permission')) {
        console.error('site_settings table does not exist:', tableCheckError);
        toast.error('Die erforderliche Tabelle existiert nicht', {
          description: 'Bitte erstellen Sie die Tabelle "site_settings" gemäß der Anleitung in der Dokumentation.'
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
        updateData.site_email = 'info@rasenpilot.com';
        
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
      
      // Call the Supabase Edge Function
      try {
        const { error } = await supabase.functions.invoke('send-email-report', {
          body: { 
            recipient: recipientEmail,
            isTest: true 
          }
        });
        
        if (error) {
          console.error('Error invoking send-email-report function:', error);
          toast.error('Fehler beim Senden der Test-E-Mail', {
            description: error.message || 'Die Edge-Funktion konnte nicht ausgeführt werden.'
          });
          return false;
        }
        
        toast.success('Test-E-Mail gesendet', {
          description: `Eine E-Mail wurde an ${recipientEmail} gesendet.`
        });
        return true;
      } catch (err: any) {
        console.error('Error sending test email:', err);
        toast.error('Fehler beim Senden der Test-E-Mail', {
          description: err?.message || 'Die Edge-Funktion konnte nicht aufgerufen werden.'
        });
        return false;
      }
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
  
  const checkStatus = async (): Promise<{
    status: 'success' | 'warning' | 'error' | 'inactive';
    message: string;
    lastSent: string | null;
  } | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-email-report-status');
      
      if (error) {
        console.error('Error checking status:', error);
        return null;
      }
      
      return data;
    } catch (err) {
      console.error('Error checking status:', err);
      return null;
    }
  };
  
  return {
    isLoading,
    saveEmailConfig,
    sendTestEmail,
    checkStatus
  };
};
