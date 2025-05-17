
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';

const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loginProgress, setLoginProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

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
    setShowProgress(true);
    
    // Set up progress animation
    let progressInterval = setInterval(() => {
      setLoginProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    // Set timeout to prevent infinite loading
    const loginTimeout = setTimeout(() => {
      setIsLoading(false);
      setShowProgress(false);
      clearInterval(progressInterval);
      toast.error('Anmeldung fehlgeschlagen. Zeitüberschreitung bei der Verbindung zum Server.');
    }, 10000);

    try {
      console.log('Attempting admin sign in with:', data.email);
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      clearTimeout(loginTimeout);
      clearInterval(progressInterval);

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      if (!authData.session) {
        throw new Error('Keine Sitzung zurückgegeben');
      }

      console.log('Login successful, session established:', !!authData.session);
      
      // Set explicit flag in localStorage to help with auth detection
      localStorage.setItem('auth_initialized', 'true');
      
      toast.success('Erfolgreich eingeloggt!');
      
      // Ensure we complete the progress bar
      setLoginProgress(100);
      
      // Reload the page to update authentication state
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
    } catch (error: any) {
      clearTimeout(loginTimeout);
      clearInterval(progressInterval);
      
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
      setShowProgress(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="admin@example.com" className="pl-10" {...field} disabled={isLoading} />
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
                  <Input type="password" className="pl-10" {...field} disabled={isLoading} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {showProgress && (
          <div className="py-2">
            <Progress value={loginProgress} className="h-2" />
          </div>
        )}
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Wird angemeldet...' : 'Admin Login'}
        </Button>
      </form>
    </Form>
  );
};

export default AdminLoginForm;
