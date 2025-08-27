import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, TestTube } from 'lucide-react';

const EmailTestPanel = () => {
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendTestEmail = async () => {
    console.log('=== EMAIL TEST DEBUG START ===');
    console.log('Test email value:', testEmail);
    
    if (!testEmail) {
      console.log('ERROR: No email provided');
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Starting email test function call...');
      console.log('Supabase client exists:', !!supabase);

      const { data, error } = await supabase.functions.invoke('test-email', {
        body: { email: testEmail }
      });

      console.log('Function response - data:', data);
      console.log('Function response - error:', error);

      if (error) {
        console.error('Function invocation error:', error);
        toast.error('E-Mail-Test fehlgeschlagen', {
          description: error.message || 'Unbekannter Fehler bei der Funktions-Ausführung'
        });
        return;
      }

      console.log('Test email response successful:', data);
      toast.success('Test-E-Mail erfolgreich gesendet!', {
        description: `E-Mail wurde an ${testEmail} gesendet`
      });

    } catch (err: any) {
      console.error('Catch block - Error testing email:', err);
      console.error('Error type:', typeof err);
      console.error('Error stack:', err.stack);
      toast.error('Fehler beim E-Mail-Test', {
        description: err.message || 'Bitte überprüfen Sie die Konsole für Details'
      });
    } finally {
      console.log('=== EMAIL TEST DEBUG END ===');
      setIsLoading(false);
    }
  };

  const testWelcomeEmail = async () => {
    if (!testEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Testing welcome email function with:', testEmail);

      const { data, error } = await supabase.functions.invoke('send-welcome-email', {
        body: { 
          email: testEmail,
          firstName: 'Test User',
          analysisScore: 85,
          analysisId: 'test-123'
        }
      });

      if (error) {
        console.error('Welcome email function error:', error);
        toast.error('Welcome-E-Mail-Test fehlgeschlagen', {
          description: error.message || 'Unbekannter Fehler'
        });
        return;
      }

      console.log('Welcome email response:', data);
      toast.success('Welcome-E-Mail erfolgreich gesendet!', {
        description: `Welcome-E-Mail wurde an ${testEmail} gesendet`
      });

    } catch (err: any) {
      console.error('Error testing welcome email:', err);
      toast.error('Fehler beim Welcome-E-Mail-Test', {
        description: err.message || 'Bitte überprüfen Sie die Konsole für Details'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailReport = async () => {
    if (!testEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Testing email report function with:', testEmail);

      const { data, error } = await supabase.functions.invoke('send-email-report', {
        body: { 
          recipient: testEmail,
          isTest: true
        }
      });

      if (error) {
        console.error('Email report function error:', error);
        toast.error('E-Mail-Report-Test fehlgeschlagen', {
          description: error.message || 'Unbekannter Fehler'
        });
        return;
      }

      console.log('Email report response:', data);
      toast.success('E-Mail-Report erfolgreich gesendet!', {
        description: `E-Mail-Report wurde an ${testEmail} gesendet`
      });

    } catch (err: any) {
      console.error('Error testing email report:', err);
      toast.error('Fehler beim E-Mail-Report-Test', {
        description: err.message || 'Bitte überprüfen Sie die Konsole für Details'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          E-Mail Funktionen Testen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Test E-Mail-Adresse</Label>
          <Input
            id="test-email"
            type="email"
            placeholder="test@example.com"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={sendTestEmail}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? 'Sende...' : 'Basis-Test'}
          </Button>

          <Button
            onClick={testWelcomeEmail}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? 'Sende...' : 'Welcome-E-Mail'}
          </Button>

          <Button
            onClick={testEmailReport}
            disabled={isLoading || !testEmail}
            variant="outline"
            className="w-full"
          >
            <Mail className="h-4 w-4 mr-2" />
            {isLoading ? 'Sende...' : 'E-Mail-Report'}
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>Wichtige Hinweise:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Domain-Verifizierung:</strong> Stellen Sie sicher, dass Ihre Domain in Resend verifiziert ist</li>
            <li><strong>API-Schlüssel:</strong> Der RESEND_API_KEY muss in den Supabase Secrets konfiguriert sein</li>
            <li><strong>From-Adresse:</strong> Aktuell verwenden die Funktionen @rasenpilot.com - das muss verifiziert sein</li>
            <li><strong>Logs:</strong> Überprüfen Sie die Entwicklertools für detaillierte Fehlermeldungen</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTestPanel;