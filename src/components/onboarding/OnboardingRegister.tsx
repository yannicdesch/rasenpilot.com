
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OnboardingData } from './OnboardingFlow';

interface OnboardingRegisterProps {
  data: OnboardingData;
  updateData: (updates: Partial<OnboardingData>) => void;
  onComplete: () => void;
  onBack: () => void;
}

const OnboardingRegister: React.FC<OnboardingRegisterProps> = ({ 
  data, 
  updateData, 
  onComplete, 
  onBack 
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dsgvoConsent, setDsgvoConsent] = useState(false);
  const [aiTrainingConsent, setAiTrainingConsent] = useState(data.consent_ai_training);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      toast.error('Bitte fülle alle Felder aus');
      return;
    }

    if (!dsgvoConsent) {
      toast.error('Bitte stimme den Datenschutzbestimmungen zu');
      return;
    }

    if (password.length < 6) {
      toast.error('Das Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            onboarding_data: {
              ...data,
              consent_ai_training: aiTrainingConsent
            }
          }
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        updateData({ consent_ai_training: aiTrainingConsent });
        toast.success('Registrierung erfolgreich! Du wirst weitergeleitet...');
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRegistration = () => {
    toast.success('Du kannst dich später registrieren. Weiter zum Dashboard...');
    onComplete();
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-green-800">
          Jetzt registrieren
        </CardTitle>
        <p className="text-gray-600">
          Sichere dir deinen personalisierten Rasenpflegeplan
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mindestens 6 Zeichen"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="dsgvo"
              checked={dsgvoConsent}
              onCheckedChange={(checked) => setDsgvoConsent(checked as boolean)}
            />
            <Label htmlFor="dsgvo" className="text-sm leading-relaxed">
              Ich stimme den{' '}
              <a href="/datenschutz" className="text-green-600 hover:underline" target="_blank">
                Datenschutzbestimmungen
              </a>
              {' '}und{' '}
              <a href="/nutzungsbedingungen" className="text-green-600 hover:underline" target="_blank">
                Nutzungsbedingungen
              </a>
              {' '}zu. (Erforderlich)
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox 
              id="ai-training"
              checked={aiTrainingConsent}
              onCheckedChange={(checked) => setAiTrainingConsent(checked as boolean)}
            />
            <Label htmlFor="ai-training" className="text-sm leading-relaxed">
              Meine Bilder dürfen für KI-Training verwendet werden (optional)
            </Label>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleRegister}
            disabled={loading || !dsgvoConsent}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Registriere...</span>
              </div>
            ) : (
              <>
                Kostenlos starten
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <Button 
            variant="outline"
            onClick={handleSkipRegistration}
            className="w-full"
          >
            Später registrieren
          </Button>
        </div>

        <div className="flex justify-start pt-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingRegister;
