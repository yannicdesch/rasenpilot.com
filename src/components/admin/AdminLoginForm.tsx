
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, validateAdminRole, logSecurityEvent } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';

const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface AdminLoginFormProps {
  onLoginSuccess?: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
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
      // Log login attempt
      await logSecurityEvent('admin_login_attempt', {
        email: data.email,
        timestamp: new Date().toISOString()
      });
      
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      clearTimeout(loginTimeout);
      clearInterval(progressInterval);

      if (error) {
        await logSecurityEvent('admin_login_failed', {
          email: data.email,
          error: error.message
        });
        throw error;
      }

      if (!authData.session) {
        throw new Error('Keine Sitzung zurückgegeben');
      }

      // Validate admin role after successful authentication
      const isAdmin = await validateAdminRole();
      
      if (!isAdmin) {
        await logSecurityEvent('admin_login_denied', {
          email: data.email,
          reason: 'insufficient_role'
        });
        
        // Sign out the non-admin user
        await supabase.auth.signOut();
        throw new Error('Nur Administratoren dürfen auf diesen Bereich zugreifen');
      }

      await logSecurityEvent('admin_login_success', {
        email: data.email,
        sessionId: authData.session.access_token.substring(0, 10) + '...'
      });
      
      setLoginProgress(100);
      toast.success('Erfolgreich als Administrator eingeloggt!');
      
      if (onLoginSuccess) {
        onLoginSuccess();
      }
      
    } catch (error: any) {
      clearTimeout(loginTimeout);
      clearInterval(progressInterval);
      
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
                      <Input 
                        placeholder="admin@example.com" 
                        className="pl-10" 
                        {...field} 
                        disabled={isLoading}
                        autoComplete="email"
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
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
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
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={form.handleSubmit(onSubmit)}
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Wird angemeldet...' : 'Admin Login'}
        </Button>
      </CardFooter>
    </>
  );
};

export default AdminLoginForm;
