import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

interface CommunicationPreferences {
  phoneNumber: string;
  countryCode: string;
  whatsappOptIn: boolean;
  smsOptIn: boolean;
}

interface CommunicationStats {
  sms: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    replied: number;
    failed: number;
    deliveryRate: number;
    readRate: number;
  };
  whatsapp: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    replied: number;
    failed: number;
    deliveryRate: number;
    readRate: number;
  };
  combined: {
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
    totalReplied: number;
  };
}

export const useCommunicationTracking = () => {
  const [preferences, setPreferences] = useState<CommunicationPreferences>({
    phoneNumber: '',
    countryCode: '+49',
    whatsappOptIn: false,
    smsOptIn: false
  });
  const [stats, setStats] = useState<CommunicationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Get communication preferences from new table using function call
      const { data, error } = await supabase
        .rpc('get_user_communication_preferences', { 
          user_id_param: user.user.id 
        });

      if (error) {
        console.error('Error fetching communication preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          phoneNumber: data.phone_number || '',
          countryCode: data.country_code || '+49',
          whatsappOptIn: data.whatsapp_opt_in || false,
          smsOptIn: data.sms_opt_in || false
        });
      }
    } catch (err) {
      console.error('Error in fetchPreferences:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const fetchStats = async (timeframe: 'day' | 'week' | 'month' = 'week') => {
    try {
      const { data, error } = await supabase
        .rpc('get_communication_analytics', { p_timeframe: timeframe });

      if (error) {
        console.error('Error fetching communication stats:', error);
        return;
      }

      setStats(data);
    } catch (err) {
      console.error('Error in fetchStats:', err);
    }
  };

  const updatePreferences = async (newPreferences: Partial<CommunicationPreferences>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const updatedPrefs = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .rpc('update_communication_contact', {
          p_user_id: user.user.id,
          p_phone_number: updatedPrefs.phoneNumber,
          p_country_code: updatedPrefs.countryCode,
          p_whatsapp_opt_in: updatedPrefs.whatsappOptIn,
          p_sms_opt_in: updatedPrefs.smsOptIn
        });

      if (error) {
        throw error;
      }

      setPreferences(updatedPrefs);
      
      toast({
        title: "Preferences Updated",
        description: "Your communication preferences have been saved.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update preferences';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const sendTestSMS = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          to: preferences.phoneNumber,
          message: message,
          messageType: 'test'
        }
      });

      if (error) throw error;

      toast({
        title: "Test SMS Sent",
        description: "Check your phone for the test message.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test SMS';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  const sendTestWhatsApp = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: preferences.phoneNumber,
          message: message,
          messageType: 'test'
        }
      });

      if (error) throw error;

      toast({
        title: "Test WhatsApp Sent",
        description: "Check WhatsApp for the test message.",
      });

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send test WhatsApp';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPreferences(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    preferences,
    stats,
    loading,
    error,
    updatePreferences,
    fetchStats,
    sendTestSMS,
    sendTestWhatsApp,
    refetch: () => {
      fetchPreferences();
      fetchStats();
    }
  };
};