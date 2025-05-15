
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectTo: string;
  onForgotPassword: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectTo, onForgotPassword }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to sign in with:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (!authData.session) {
        throw new Error('Keine Sitzung zurückgegeben');
      }

      console.log('Login successful, session established:', !!authData.session);
      
      // Set session in local storage to ensure it's immediately available
      // This is handled by Supabase client but we're making it explicit
      window.localStorage.setItem('supabase.auth.token', JSON.stringify(authData.session));
      
      toast.success('Erfolgreich eingeloggt!');
      
      // Add a slightly longer delay to ensure the auth state is properly updated
      setTimeout(() => {
        console.log('Redirecting to:', redirectTo);
        navigate(redirectTo);
      }, 500);
    } catch (error: any) {
      console.error('Login error details:', error);
      let errorMessage = 'Unbekannter Fehler';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Falsche E-Mail oder Passwort';
        } else {
          errorMessage = error.message;
        }
      }
      
      toast.error('Fehler beim Einloggen: ' + errorMessage);
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
            <div className="text-right">
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onForgotPassword();
                }}
              >
                Passwort vergessen?
              </Button>
            </div>
            <CardFooter className="px-0 pt-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </>
  );
};

export default LoginForm;
