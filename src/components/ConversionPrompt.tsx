
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from "sonner";
import { z } from "zod";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { trackRegistrationStep, trackRegistrationComplete } from '@/lib/analytics';

// Import our new component modules
import BenefitsList from './conversion/BenefitsList';
import QuickRegisterForm from './conversion/QuickRegisterForm';
import TaskPreview from './conversion/TaskPreview';
import FeatureCards from './conversion/FeatureCards';

// Define schema for quick registration
const quickRegisterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse ein"),
  password: z.string().min(6, "Das Passwort muss mindestens 6 Zeichen lang sein"),
  name: z.string().min(2, "Name muss mindestens 2 Zeichen lang sein").optional(),
});

type QuickRegisterValues = z.infer<typeof quickRegisterSchema>;

interface ConversionPromptProps {
  onRegister: () => void;
  onContinueWithoutRegistration: () => void;
  onQuickRegister?: (email: string) => void;
}

const ConversionPrompt: React.FC<ConversionPromptProps> = ({ 
  onRegister, 
  onContinueWithoutRegistration,
  onQuickRegister
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Track conversion prompt view as a registration step
    trackRegistrationStep('conversion_prompt_view');
  }, []);

  const handleQuickRegister = async (data: QuickRegisterValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name || "",
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if we have a session - user is authenticated
      if (authData.session) {
        trackRegistrationComplete('quick_register');
        toast.success('Registrierung erfolgreich!');
        navigate('/free-care-plan');
      } else {
        // If confirmation is required
        trackRegistrationStep('email_confirmation_sent');
        toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails für den Bestätigungslink.');
        navigate('/auth?tab=login');
      }
    } catch (error: any) {
      toast.error('Fehler bei der Registrierung: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fixed "Jetzt freischalten" button handler
  const handleUnlockNow = () => {
    // Navigate to subscription page to unlock premium features
    navigate('/subscription');
  };

  return (
    <Card className="border-green-200 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl text-green-800">
          Dein Plan ist bereit!
        </CardTitle>
        <CardDescription>
          3 personalisierte Aufgaben für die nächsten 7 Tage
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="mb-6">
          <TaskPreview />
          
          <div className="text-center px-4 py-6 border border-gray-200 rounded-lg bg-gray-50 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800">
              👉 Jetzt kostenlos registrieren, um:
            </h3>
            
            <BenefitsList />
            
            {/* Quick registration form */}
            <QuickRegisterForm 
              onSubmit={handleQuickRegister} 
              isSubmitting={isSubmitting} 
            />
            
            {/* Fixed "Jetzt freischalten" button - now properly navigates to subscription */}
            <div className="mt-4">
              <Button 
                onClick={handleUnlockNow}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 text-lg font-medium"
              >
                🔒 Jetzt freischalten
              </Button>
            </div>
            
            <div className="mt-4">
              <Button 
                onClick={onContinueWithoutRegistration}
                variant="outline"
                className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                Ohne Registrierung fortfahren
              </Button>
            </div>
          </div>
        </div>
        
        <FeatureCards />
      </CardContent>
    </Card>
  );
};

export default ConversionPrompt;
