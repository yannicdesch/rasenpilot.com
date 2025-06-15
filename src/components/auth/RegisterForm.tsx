
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Lock, UserRoundPlus } from 'lucide-react';
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useLawn } from '@/context/LawnContext';
import { trackRegistrationStart, trackRegistrationStep, trackRegistrationComplete, trackFormInteraction } from '@/lib/analytics';

const registerSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  redirectTo: string;
  onRegistrationSuccess?: () => void;
  onRegistrationWithEmailConfirmation: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ 
  redirectTo, 
  onRegistrationSuccess, 
  onRegistrationWithEmailConfirmation 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();

  const prefillEmail = location.state?.prefillEmail || '';

  // Track when registration form is viewed
  useEffect(() => {
    trackRegistrationStart();
  }, []);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefillEmail,
      password: '',
      name: '',
    },
  });

  // Update form values when prefillEmail changes
  useEffect(() => {
    if (prefillEmail) {
      form.setValue('email', prefillEmail);
    }
  }, [prefillEmail, form]);

  // Track field completion
  const handleFieldComplete = (fieldName: string) => {
    trackRegistrationStep('field_complete', fieldName);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    trackFormInteraction('register', 'submit');
    
    if (!isSupabaseConfigured()) {
      trackFormInteraction('register', 'error', 'Supabase not configured');
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsLoading(true);
    try {
      // Get redirect URL
      const redirectUrl = `${window.location.origin}${redirectTo}`;
      
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: data.name,
            full_name: data.name,
          },
        },
      });

      if (error) {
        trackFormInteraction('register', 'error', error.message);
        throw error;
      }

      // Check if we have a session - user is authenticated immediately
      if (authData.session) {
        trackRegistrationComplete('direct');
        toast.success('Registrierung erfolgreich!');
        
        // Wait a moment for the profile to be created by the trigger
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // If we have temporary profile data, sync it
        if (temporaryProfile) {
          console.log('Syncing temporary profile data after successful registration');
          await syncProfileWithSupabase();
        }
        
        // If onRegistrationSuccess callback is provided, call it
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        } else {
          navigate(redirectTo);
        }
      } else {
        // If confirmation is required
        trackRegistrationStep('email_confirmation_sent');
        toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails für den Bestätigungslink.');
        onRegistrationWithEmailConfirmation();
      }
    } catch (error: any) {
      trackFormInteraction('register', 'error', error.message || 'Unknown error');
      toast.error('Fehler bei der Registrierung: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <UserRoundPlus className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Dein Name" 
                        className="pl-10" 
                        {...field} 
                        onBlur={() => handleFieldComplete('name')}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-Mail</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="deine@email.de" 
                        className="pl-10" 
                        {...field}
                        onBlur={() => handleFieldComplete('email')}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passwort</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="password" 
                        className="pl-10" 
                        {...field}
                        onBlur={() => handleFieldComplete('password')} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <CardFooter className="px-0 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Wird registriert...' : 'Registrieren'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </>
  );
};

export default RegisterForm;
