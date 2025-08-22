import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Star, Calendar, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';

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

        // CRITICAL: Claim this analysis for the user (connects anonymous analysis to user account)
        if (analysisId) {
          const { error: claimError } = await supabase.rpc('claim_orphaned_analysis', {
            p_user_id: user.id,
            p_email: email,
            p_analysis_id: analysisId
          });
          
          if (claimError) {
            console.error('Error claiming analysis:', claimError);
          } else {
            console.log('✅ Analysis successfully claimed for user');
          }
        }
      } else {
        // Anonymous user - create a subscriber record AND a temporary profile link
        const { error: subscriberError } = await supabase
          .from('subscribers')
          .insert({
            email: email,
            name: firstName,
            status: 'active',
            source: 'Analysis Result',
            interests: ['lawn_care']
          });

        if (subscriberError && !subscriberError.message.includes('duplicate')) {
          throw subscriberError;
        }

        // Store connection data for when they eventually create an account
        if (analysisId) {
          localStorage.setItem('pending_analysis_claim', JSON.stringify({
            analysisId: analysisId,
            email: email,
            firstName: firstName,
            timestamp: new Date().toISOString()
          }));
        }
      }

      // Schedule reminders with proper user_id handling
      if (consentMarketing && analysisId) {
        const userId = user?.id || null;
        
        if (userId) {
          // User is logged in - create proper reminders
          const { error: reminderError } = await supabase.rpc('create_analysis_reminders', {
            p_user_id: userId,
            p_score: analysisScore,
            p_analysis_id: analysisId
          });
          
          if (reminderError) {
            console.error('Error scheduling reminders:', reminderError);
          }
        } else {
          // Anonymous user - store reminder data for later
          localStorage.setItem('pending_reminders', JSON.stringify({
            email: email,
            analysisScore: analysisScore,
            analysisId: analysisId,
            timestamp: new Date().toISOString()
          }));
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