import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, MailCheck, Loader2 } from 'lucide-react';
import MainNavigation from '@/components/MainNavigation';
import PasswordResetLink from '@/components/PasswordResetLink';
import { trackMetaCompleteRegistration, trackMetaLead } from '@/lib/analytics/metaPixel';

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const ref = searchParams.get('ref');
  const isFromAnalysis = ref === 'result-save' || ref === 'blurred-rec';
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  });

  // Post-registration status screen
  // 'idle'      = normal auth form
  // 'pending'   = signup ok, waiting for email confirmation
  // 'confirmed' = session detected, redirecting
  const [authStatus, setAuthStatus] = useState<'idle' | 'pending' | 'confirmed'>('idle');
  const [pendingEmail, setPendingEmail] = useState<string>('');
  const [pendingRedirect, setPendingRedirect] = useState<string>('/');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Watch for session while in 'pending' — auto-advance to 'confirmed'
  useEffect(() => {
    if (authStatus !== 'pending') return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthStatus('confirmed');
        setTimeout(() => navigate(pendingRedirect), 1500);
      }
    });
    return () => subscription.unsubscribe();
  }, [authStatus, pendingRedirect, navigate]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!pendingEmail || resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}${pendingRedirect}`,
        },
      });
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success('Bestätigungs-E-Mail erneut gesendet.');
      setResendCooldown(30);
    } catch {
      toast.error('Erneutes Senden fehlgeschlagen. Bitte später erneut versuchen.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build the post-confirmation redirect URL with ?registered=1 so the
      // analysis-result page knows to claim the orphaned analysis and unlock content.
      const plan = searchParams.get('plan');
      let postConfirmPath = redirectPath || '/';
      if (redirectPath && isFromAnalysis) {
        const sep = postConfirmPath.includes('?') ? '&' : '?';
        postConfirmPath = `${postConfirmPath}${sep}registered=1`;
      }
      if (plan) {
        const sep = postConfirmPath.includes('?') ? '&' : '?';
        postConfirmPath = `${postConfirmPath}${sep}plan=${plan}`;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}${postConfirmPath}`,
          data: {
            full_name: formData.fullName
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Diese E-Mail ist bereits registriert. Bitte melden Sie sich an.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Track Meta Pixel events for registration funnel
      trackMetaCompleteRegistration('Signup', 'success');
      trackMetaLead('registration');

      // If a session was created immediately (email confirmation disabled),
      // redirect now. Otherwise, instruct the user to confirm their email
      // and stay on this page so they don't land back as anonymous.
      if (data.session) {
        toast.success('Registrierung erfolgreich!');
        navigate(postConfirmPath);
      } else {
        toast.success('Bitte bestätige deine E-Mail — danach werden deine Empfehlungen automatisch freigeschaltet.', {
          duration: 8000,
        });
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Ungültige Anmeldedaten. Bitte überprüfen Sie E-Mail und Passwort.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Erfolgreich angemeldet!');
      
      // Redirect to intended destination
      const redirect = redirectPath;
      const plan = searchParams.get('plan');
      if (redirect) {
        const separator = redirect.includes('?') ? '&' : '?';
        const registered = isFromAnalysis ? `${separator}registered=1` : '';
        const planParam = plan ? `${registered ? '&' : separator}plan=${plan}` : '';
        navigate(`${redirect}${registered}${planParam}`);
      } else {
        navigate('/premium-dashboard');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">
                Willkommen bei RasenPilot
              </CardTitle>
              <CardDescription>
                {isFromAnalysis 
                  ? 'Registriere dich kostenlos, um dein Analyseergebnis dauerhaft zu speichern.'
                  : 'Melden Sie sich an oder registrieren Sie sich für Premium-Features'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showPasswordReset ? (
                <div className="space-y-4">
                  <PasswordResetLink />
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowPasswordReset(false)}
                  >
                    Zurück zur Anmeldung
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue={isFromAnalysis ? "signup" : "signin"} className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Anmelden</TabsTrigger>
                    <TabsTrigger value="signup">Registrieren</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin">
                    <form onSubmit={handleSignIn} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">E-Mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-email"
                            name="email"
                            type="email"
                            placeholder="ihre@email.de"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Passwort</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signin-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Ihr Passwort"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pl-10 pr-10"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Anmelden...' : 'Anmelden'}
                      </Button>
                      
                      <Button
                        type="button"
                        variant="link"
                        className="w-full text-sm text-muted-foreground"
                        onClick={() => setShowPasswordReset(true)}
                      >
                        Passwort vergessen?
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    <form onSubmit={handleSignUp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-name">Name</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-name"
                            name="fullName"
                            type="text"
                            placeholder="Ihr vollständiger Name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">E-Mail</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-email"
                            name="email"
                            type="email"
                            placeholder="ihre@email.de"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Passwort</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="signup-password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Mindestens 6 Zeichen"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="pl-10 pr-10"
                            minLength={6}
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Registrieren...' : 'Registrieren'}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;