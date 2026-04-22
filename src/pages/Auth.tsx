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
import {
  saveAuthIntent,
  clearAuthIntent,
  buildPostAuthPath,
  extractJobIdFromPath,
} from '@/lib/authRedirectIntent';

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
        clearAuthIntent();
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
      // Build the post-confirmation redirect using the central helper so the
      // same params (?registered=1, ?plan=) are applied everywhere.
      const plan = searchParams.get('plan') || undefined;
      const baseRedirect = redirectPath || '/';
      const postConfirmPath = buildPostAuthPath({
        redirectPath: baseRedirect,
        fromAnalysis: isFromAnalysis,
        plan,
      });

      // Persist the intent BEFORE signUp so it survives the email
      // confirmation round-trip (new tab/session loses URL params).
      saveAuthIntent({
        redirectPath: baseRedirect,
        jobId: extractJobIdFromPath(baseRedirect),
        plan,
        fromAnalysis: isFromAnalysis,
      });

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

      // Always store the intended redirect for the status screen
      setPendingEmail(formData.email);
      setPendingRedirect(postConfirmPath);

      // If a session was created immediately (email confirmation disabled),
      // jump straight to the 'confirmed' screen and redirect.
      if (data.session) {
        setAuthStatus('confirmed');
        toast.success('Registrierung erfolgreich!');
        clearAuthIntent();
        setTimeout(() => navigate(postConfirmPath), 1200);
      } else {
        setAuthStatus('pending');
        setResendCooldown(30);
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

      // Redirect to intended destination — use the helper so ?registered=1
      // and ?plan= are applied consistently across all entry points.
      const plan = searchParams.get('plan') || undefined;
      if (redirectPath) {
        const target = buildPostAuthPath({
          redirectPath,
          fromAnalysis: isFromAnalysis,
          plan,
        });
        clearAuthIntent();
        navigate(target);
      } else {
        clearAuthIntent();
        navigate('/premium-dashboard');
      }
    } catch (error) {
      toast.error('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Post-registration status screens
  // ─────────────────────────────────────────────────────────────
  if (authStatus === 'pending' || authStatus === 'confirmed') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card className="shadow-lg">
              {authStatus === 'pending' ? (
                <CardContent className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center">
                    <MailCheck className="h-8 w-8 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Bitte bestätige deine E-Mail
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Wir haben einen Bestätigungs-Link an
                    </p>
                    <p className="text-sm font-semibold text-foreground my-1 break-all">
                      {pendingEmail}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      gesendet. Klicke darauf, um dein Konto zu aktivieren.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left space-y-2">
                    <div className="flex items-start gap-2">
                      <Loader2 className="h-4 w-4 text-green-600 animate-spin mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-green-800">
                        Diese Seite wartet automatisch auf deine Bestätigung — danach
                        wirst du sofort zu deinem Ergebnis weitergeleitet.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Keine E-Mail erhalten? Schaue auch im Spam-Ordner nach.</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleResendEmail}
                    disabled={resendCooldown > 0}
                  >
                    {resendCooldown > 0
                      ? `Erneut senden in ${resendCooldown}s`
                      : 'Bestätigungs-E-Mail erneut senden'}
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full text-sm text-muted-foreground"
                    onClick={() => setAuthStatus('idle')}
                  >
                    Zurück
                  </Button>
                </CardContent>
              ) : (
                <CardContent className="p-8 text-center space-y-5">
                  <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      E-Mail bestätigt 🎉
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Dein Konto ist aktiv. Du wirst gleich zu deinem Ergebnis weitergeleitet…
                    </p>
                  </div>
                  <Loader2 className="h-5 w-5 text-green-600 animate-spin mx-auto" />
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    );
  }

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