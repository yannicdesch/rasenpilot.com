
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ArrowRight, Calendar, Zap, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLawn } from '@/context/LawnContext';
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
  const navigate = useNavigate();
  const { setTemporaryProfile } = useLawn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dsgvoConsent, setDsgvoConsent] = useState(false);
  const [aiTrainingConsent, setAiTrainingConsent] = useState(data.consent_ai_training);
  const [loading, setLoading] = useState(false);

  const createProfileFromOnboardingData = () => {
    return {
      zipCode: data.standort || '',
      grassType: data.rasentyp || 'weiss-nicht',
      lawnSize: data.rasenfläche?.toString() || '100',
      lawnGoal: data.rasenziel || '',
      rasenproblem: data.rasenproblem || '',
      rasenbild: data.rasenbild || '',
      analysisResults: null,
      analyzesUsed: 0,
    };
  };

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
      // Update consent data
      updateData({ consent_ai_training: aiTrainingConsent });
      
      // Create the profile from onboarding data and store as temporary
      const profileData = createProfileFromOnboardingData();
      console.log('Setting temporary profile before registration:', profileData);
      setTemporaryProfile(profileData);

      // Use the current window location for redirect, but ensure it points to dashboard
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}/dashboard`;

      console.log('Using redirect URL:', redirectUrl);

      // Register user with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            onboarding_completed: true,
            consent_ai_training: aiTrainingConsent
          }
        }
      });

      if (error) {
        console.error('Registration error:', error);
        toast.error(error.message);
        setLoading(false);
        return;
      }

      if (authData.user) {
        console.log('Registration successful, user created:', authData.user.id);
        
        // Check if email confirmation is required
        if (!authData.session) {
          toast.success('Registrierung erfolgreich! Bitte bestätige deine E-Mail-Adresse.', {
            description: 'Ein Bestätigungslink wurde an deine E-Mail gesendet. Nach der Bestätigung wirst du automatisch zum Dashboard weitergeleitet.'
          });
          setLoading(false);
          return;
        }

        // If we have a session, the user is immediately logged in
        toast.success('Registrierung erfolgreich! Du wirst weitergeleitet...');
        
        // The auth state change will handle navigation automatically
        // Don't call navigate here to avoid conflicts
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipRegistration = () => {
    console.log('Skipping registration, creating temporary profile');
    
    // Create temporary profile from onboarding data
    const profileData = createProfileFromOnboardingData();
    console.log('Temporary profile data:', profileData);
    
    setTemporaryProfile(profileData);
    
    // Mark free analysis as used
    localStorage.setItem('freeAnalysisUsed', 'true');
    
    toast.success('Du kannst dich später registrieren. Dein Pflegeplan wird erstellt...');
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <Card className="border-green-100">
      <CardHeader className="text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl text-green-800">
          👉 Dein individueller Pflegeplan ist bereit – jetzt kostenlos speichern
        </CardTitle>
        <p className="text-gray-600">
          Sichere dir deinen personalisierten 14-Tage-Rasenpflegeplan
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Benefits Preview */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-green-800 mb-3">Nach der Registrierung erhältst du:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Calendar className="h-4 w-4" />
              <span>Deinen kompletten 14-Tage-Pflegeplan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <Zap className="h-4 w-4" />
              <span>Pro-Features: Unbegrenzte Analysen & Wetter-Kalender</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Persönliche Empfehlungen basierend auf deiner Analyse</span>
            </div>
          </div>
        </div>

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
            className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Registrierung läuft...</span>
              </div>
            ) : (
              <>
                14-Tage-Plan jetzt kostenlos sichern
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <Button 
            variant="outline"
            onClick={handleSkipRegistration}
            className="w-full"
            disabled={loading}
          >
            Später registrieren
          </Button>
        </div>

        <div className="flex justify-start pt-4">
          <Button variant="ghost" onClick={onBack} disabled={loading}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingRegister;
