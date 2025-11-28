
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEmailReports } from '@/hooks/useEmailReports';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Mail, Clock } from 'lucide-react';

interface EmailReportConfig {
  enabled: boolean;
  recipientEmail: string;
  sendTime: string;
  lastSent: string | null;
  reportTypes: {
    newRegistrations: boolean;
    siteStatistics: boolean;
  };
}

const EmailReportSettings = () => {
  const { isLoading, saveEmailConfig, sendTestEmail, checkStatus } = useEmailReports();
  const [config, setConfig] = useState<EmailReportConfig>({
    enabled: true,
    recipientEmail: 'Yannic.Desch@gmail.com', // Default email address
    sendTime: '08:00',
    lastSent: null,
    reportTypes: {
      newRegistrations: true,
      siteStatistics: true
    }
  });
  const [status, setStatus] = useState<{
    status: 'success' | 'warning' | 'error' | 'inactive';
    message: string;
    lastSent: string | null;
  } | null>(null);
  
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data: settings, error: settingsError } = await supabase
          .from('site_settings')
          .select('email_reports')
          .order('updated_at', { ascending: false })
          .limit(1)
          .single();
        
        if (settingsError && settingsError.code !== 'PGRST116') {
          console.error('Error fetching settings:', settingsError);
          return;
        }
        
        if (settings && settings.email_reports) {
          // Parse the JSON data safely
          const emailReportsData = settings.email_reports;
          if (typeof emailReportsData === 'object' && emailReportsData !== null && !Array.isArray(emailReportsData)) {
            // Type assertion after validation
            const configData = emailReportsData as unknown as EmailReportConfig;
            setConfig(configData);
          }
        }
      } catch (err) {
        console.error('Error fetching email config:', err);
      }
    };

    const loadStatus = async () => {
      const statusData = await checkStatus();
      if (statusData) {
        setStatus(statusData);
      }
    };
    
    fetchConfig();
    loadStatus();
    
    // Refresh status every 60 seconds
    const interval = setInterval(loadStatus, 60000);
    return () => clearInterval(interval);
  }, [checkStatus]);
  
  const handleSaveConfig = async () => {
    const success = await saveEmailConfig(config);
    if (success) {
      toast.success('E-Mail-Konfiguration gespeichert');
    }
  };
  
  const handleSendTestEmail = async () => {
    if (!config.recipientEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }
    
    await sendTestEmail(config.recipientEmail);
  };
  
  const getStatusColor = () => {
    if (!status) return 'bg-gray-400';
    switch (status.status) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'inactive': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              E-Mail Berichte
            </CardTitle>
            <CardDescription>
              Konfigurieren Sie automatische E-Mail-Berichte zu Statistiken und neuen Registrierungen
            </CardDescription>
          </div>
          
          {/* Traffic Light Status */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground font-medium">Status</span>
              <span className="text-sm font-medium">{status?.message || 'Wird geladen...'}</span>
              {status?.lastSent && (
                <span className="text-xs text-muted-foreground">
                  {new Date(status.lastSent).toLocaleString('de-DE', { 
                    day: '2-digit', 
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              )}
            </div>
            <div className={`w-4 h-4 rounded-full ${getStatusColor()} shadow-lg ring-2 ring-background`} 
                 title={status?.message || 'Status wird geladen'}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="email-reports-enabled" className="text-base font-medium">Tägliche E-Mail-Berichte</Label>
            <p className="text-sm text-muted-foreground">
              Aktivieren Sie tägliche E-Mail-Berichte mit Statistiken
            </p>
          </div>
          <Switch
            id="email-reports-enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => setConfig(prev => ({ ...prev, enabled: checked }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="recipient-email">Empfänger E-Mail</Label>
          <Input
            id="recipient-email"
            type="email"
            placeholder="email@example.com"
            value={config.recipientEmail}
            onChange={(e) => setConfig(prev => ({ ...prev, recipientEmail: e.target.value }))}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="send-time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Sendezeit (Täglich)
          </Label>
          <Input
            id="send-time"
            type="time"
            value={config.sendTime}
            onChange={(e) => setConfig(prev => ({ ...prev, sendTime: e.target.value }))}
          />
        </div>
        
        <div className="space-y-3">
          <Label>Berichtsinhalt</Label>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="new-registrations"
              checked={config.reportTypes.newRegistrations}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ 
                  ...prev, 
                  reportTypes: { ...prev.reportTypes, newRegistrations: checked } 
                }))
              }
            />
            <Label htmlFor="new-registrations">Neue Registrierungen</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="site-statistics"
              checked={config.reportTypes.siteStatistics}
              onCheckedChange={(checked) => 
                setConfig(prev => ({ 
                  ...prev, 
                  reportTypes: { ...prev.reportTypes, siteStatistics: checked } 
                }))
              }
            />
            <Label htmlFor="site-statistics">Seitenstatistiken</Label>
          </div>
        </div>
        
        {config.lastSent && (
          <p className="text-sm text-muted-foreground">
            Letzter Bericht gesendet: {new Date(config.lastSent).toLocaleString('de-DE')}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={handleSaveConfig}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          Einstellungen speichern
        </Button>
        <Button
          variant="outline"
          onClick={handleSendTestEmail}
          disabled={isLoading || !config.recipientEmail}
          className="w-full sm:w-auto"
        >
          Test-E-Mail senden
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailReportSettings;
