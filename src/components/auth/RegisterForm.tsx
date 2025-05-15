
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
          },
        },
      });

      if (error) {
        throw error;
      }

      // Check if we have a session - user is authenticated
      if (authData.session) {
        toast.success('Registrierung erfolgreich!');
        
        // If we have temporary profile data, sync it first
        if (temporaryProfile) {
          console.log('Syncing temporary profile data after successful registration');
          await syncProfileWithSupabase();
        }
        
        // If onRegistrationSuccess callback is provided, call it to show the onboarding wizard
        if (onRegistrationSuccess) {
          onRegistrationSuccess();
        } else {
          // If no callback is provided, navigate directly to dashboard
          navigate(redirectTo);
        }
      } else {
        // If confirmation is required
        toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails für den Bestätigungslink.');
        onRegistrationWithEmailConfirmation();
      }
    } catch (error: any) {
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
                      <Input placeholder="Dein Name" className="pl-10" {...field} />
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
                      <Input placeholder="deine@email.de" className="pl-10" {...field} />
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
                      <Input type="password" className="pl-10" {...field} />
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
