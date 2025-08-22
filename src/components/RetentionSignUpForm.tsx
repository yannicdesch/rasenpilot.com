import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Star, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface RetentionSignUpFormProps {
  analysisScore: number;
  analysisId?: string;
  onSignUpComplete?: () => void;
}

const RetentionSignUpForm: React.FC<RetentionSignUpFormProps> = ({
  analysisScore,
  analysisId,
  onSignUpComplete
}) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [consentMarketing, setConsentMarketing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Bitte geben Sie Ihre E-Mail-Adresse ein');
      return;
    }

    if (!firstName.trim()) {
      toast.error('Bitte geben Sie Ihren Vornamen ein');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create or update profile with consent
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in - update their profile
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName,
            consent_marketing: consentMarketing,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;
      } else {
        // Anonymous user - create a subscriber record for now
        const { error } = await supabase
          .from('subscribers')
          .insert({
            email: email,
            name: firstName,
            status: 'active',
            source: 'Analysis Result',
            interests: ['lawn_care']
          });

        if (error && !error.message.includes('duplicate')) {
          throw error;
        }
      }

      // If user consented and we have an analysis, create reminders
      if (consentMarketing && analysisId) {
        const baseUrl = 'https://www.rasenpilot.com/lawn-analysis?ref=reminder';
        const reminders = [
          { days: 3, kind: 'D3', message_key: 'motivation_3d' },
          { days: 7, kind: 'D7', message_key: 'tip_7d' },
          { days: 14, kind: 'D14', message_key: 'progress_14d' },
          { days: 30, kind: 'D30', message_key: 'season_30d' },
          { days: 60, kind: 'D60', message_key: 'compare_region_60d' }
        ];

        for (const reminder of reminders) {
          const sendAt = new Date();
          sendAt.setDate(sendAt.getDate() + reminder.days);

          await supabase
            .from('reminders')
            .insert({
              user_id: user?.id || null,
              send_at: sendAt.toISOString(),
              kind: reminder.kind,
              message_key: reminder.message_key,
              payload_url: `${baseUrl}&kind=${reminder.kind}&aid=${analysisId}`,
              last_score: analysisScore,
              status: 'pending'
            });
        }
      }

      // Send immediate welcome email with analysis results
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: email,
            firstName: firstName,
            analysisScore: analysisScore,
            analysisId: analysisId || ''
          }
        });

        if (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't block the signup process if email fails
          toast.success(
            consentMarketing 
              ? `Vielen Dank, ${firstName}! Ihre Erinnerungen sind aktiviert.`
              : `Vielen Dank für Ihre Anmeldung, ${firstName}!`
          );
        } else {
          console.log('✅ Welcome email sent successfully');
          toast.success(
            `Willkommen bei RasenPilot, ${firstName}! 🎉 Check Ihre E-Mails - wir haben Ihnen Ihre Analyse-Ergebnisse gesendet!`
          );
        }
      } catch (error) {
        console.error('Error sending welcome email:', error);
        toast.success(
          consentMarketing 
            ? `Vielen Dank, ${firstName}! Ihre Erinnerungen sind aktiviert.`
            : `Vielen Dank für Ihre Anmeldung, ${firstName}!`
        );
      }

      onSignUpComplete?.();
    } catch (error) {
      console.error('Error in retention signup:', error);
      toast.error('Fehler bei der Anmeldung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-600 rounded-full flex items-center justify-center">
          <Star className="h-8 w-8 text-white" />
        </div>
        <CardTitle className="text-xl text-green-800">
          Bleiben Sie auf dem Laufenden!
        </CardTitle>
        <p className="text-green-700 text-sm">
          Erhalten Sie personalisierte Tipps und verfolgen Sie Ihren Fortschritt
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Benefits */}
        <div className="grid grid-cols-1 gap-2 text-sm mb-4">
          <div className="flex items-center gap-2 text-green-700">
            <Calendar className="h-4 w-4" />
            <span>Erinnerungen nach 3, 7, 14, 30 und 60 Tagen</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <TrendingUp className="h-4 w-4" />
            <span>Fortschritts-Tracking mit Ihrem letzten Score: {analysisScore}/100</span>
          </div>
          <div className="flex items-center gap-2 text-green-700">
            <Mail className="h-4 w-4" />
            <span>Personalisierte Rasenpflege-Tipps</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="firstName" className="text-green-800 font-medium">
              Vorname
            </Label>
            <Input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Ihr Vorname"
              className="bg-white border-green-300 focus:border-green-500"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-green-800 font-medium">
              E-Mail-Adresse
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ihre.email@beispiel.de"
              className="bg-white border-green-300 focus:border-green-500"
              required
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={consentMarketing}
              onCheckedChange={(checked) => setConsentMarketing(checked as boolean)}
              className="mt-1"
            />
            <Label htmlFor="consent" className="text-sm text-green-700 leading-relaxed">
              Ja, ich möchte E-Mail-Erinnerungen und Tipps zur Rasenpflege erhalten. 
              Die Einwilligung kann jederzeit widerrufen werden.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 hover:bg-green-700 h-12 font-semibold"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Wird gespeichert...
              </div>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Kostenlos anmelden
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-green-600 text-center">
          Kostenlos und jederzeit kündbar. Keine Weitergabe an Dritte.
        </p>
      </CardContent>
    </Card>
  );
};

export default RetentionSignUpForm;