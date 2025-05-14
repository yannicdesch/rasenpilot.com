import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, UserRoundPlus, Shield, Settings } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Checkbox } from '@/components/ui/checkbox';
import { useLawn } from '@/context/LawnContext';

const loginSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
});

const registerSchema = z.object({
  email: z.string().email('Bitte gib eine gültige E-Mail-Adresse ein'),
  password: z.string().min(6, 'Das Passwort muss mindestens 6 Zeichen lang sein'),
  name: z.string().min(2, 'Name muss mindestens 2 Zeichen lang sein'),
  isAdmin: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthFormProps {
  redirectTo?: string;
}

const AuthForm = ({ redirectTo = '/dashboard' }: AuthFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const [showAdminOption, setShowAdminOption] = useState(false);
  const navigate = useNavigate();
  const { checkAuthentication, checkAdminRole } = useLawn();

  // Listen for authentication changes and redirect if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("User already authenticated, redirecting to:", redirectTo);
        window.location.href = redirectTo;
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in AuthForm:", event, !!session);
      if (session && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        console.log("Auth event detected, redirecting to:", redirectTo);
        window.location.href = redirectTo;
      }
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [redirectTo]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      isAdmin: false,
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', data.email);
      
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }
      
      console.log('Login successful');

      // Special case for yannic.desch@gmail.com - set admin rights
      if (data.email.toLowerCase() === 'yannic.desch@gmail.com') {
        console.log('Setting admin rights for special user');
        try {
          // Update user metadata to include isAdmin: true
          const { error: updateError } = await supabase.auth.updateUser({
            data: { isAdmin: true }
          });
          
          if (updateError) {
            console.error('Failed to update admin status:', updateError);
          } else {
            console.log('Admin rights granted successfully');
            toast.success('Admin-Rechte wurden gewährt!');
          }
        } catch (updateErr) {
          console.error('Error during admin rights update:', updateErr);
        }
      }

      // Update authentication state in LawnContext
      await checkAuthentication();
      
      // Check admin role if needed
      if (data.email.toLowerCase() === 'yannic.desch@gmail.com') {
        await checkAdminRole();
      }

      toast.success('Erfolgreich eingeloggt!');
      
      // Force redirect with page reload to ensure state is refreshed
      console.log('Redirecting to:', redirectTo);
      
      // Directly set window location instead of using React Router
      window.location.href = redirectTo;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Fehler beim Einloggen: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    if (!isSupabaseConfigured()) {
      toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            isAdmin: data.isAdmin || false,
          },
        },
      });

      if (error) {
        throw error;
      }

      toast.success('Registrierung erfolgreich! Bitte überprüfe deine E-Mails für den Bestätigungslink.');
      setActiveTab('login');
    } catch (error: any) {
      toast.error('Fehler bei der Registrierung: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle admin option button handler
  const toggleAdminOption = () => {
    setShowAdminOption(!showAdminOption);
    if (!showAdminOption) {
      toast.success('Admin-Optionen aktiviert');
    } else {
      toast.info('Admin-Optionen deaktiviert');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Anmelden</TabsTrigger>
          <TabsTrigger value="register">Registrieren</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>
              Melde dich mit deinem Rasenpilot-Konto an
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
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
                  control={loginForm.control}
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
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Wird angemeldet...' : 'Anmelden'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
        <TabsContent value="register">
          <CardHeader>
            <CardTitle>Account erstellen</CardTitle>
            <CardDescription>
              Erstelle dein Rasenpilot-Konto für persönliche Rasenberatung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                
                {/* Admin toggle button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={toggleAdminOption}
                    className={`flex items-center gap-1 text-xs ${showAdminOption ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' : ''}`}
                  >
                    <Settings className="h-3 w-3" />
                    Erweiterte Optionen
                  </Button>
                </div>
                
                {showAdminOption && (
                  <FormField
                    control={registerForm.control}
                    name="isAdmin"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3">
                        <FormControl>
                          <Checkbox 
                            checked={field.value} 
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-green-600" />
                            Administrator-Rechte
                          </FormLabel>
                          <p className="text-sm text-muted-foreground">
                            Gewährt vollen Zugriff auf alle Verwaltungsfunktionen
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                )}
                <CardFooter className="px-0 pt-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Wird registriert...' : 'Registrieren'}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
