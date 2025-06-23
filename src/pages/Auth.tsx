
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import AuthForm from '@/components/AuthForm';
import OnboardingWizard from '@/components/OnboardingWizard';
import MainNavigation from '@/components/MainNavigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useLawn } from '@/context/LawnContext';

const Auth = () => {
  const isSupabaseReady = isSupabaseConfigured();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();
  
  // Get initial active tab from URL search params
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.redirectTo || location.state?.from?.pathname || '/dashboard';
  
  // Get pre-filled email from location state if available
  const prefillEmail = location.state?.prefillEmail || '';

  // Check if user is already authenticated
  useEffect(() => {
    if (!isSupabaseReady) {
      setIsCheckingAuth(false);
      return;
    }

    const checkInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Auth page: User already authenticated, redirecting to:', from);
          navigate(from, { replace: true });
          return;
        }
      } catch (error) {
        console.error('Auth page: Error checking initial session:', error);
      }
      setIsCheckingAuth(false);
    };

    checkInitialAuth();
  }, [isSupabaseReady, navigate, from]);

  // Set up auth listener for sign-in events
  useEffect(() => {
    if (!isSupabaseReady) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth page: Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth page: User signed in, redirecting to:', from);
        navigate(from, { replace: true });
      }
    });
  
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, isSupabaseReady, from]);

  const handleRegistrationSuccess = () => {
    setRegistrationComplete(true);
  };

  const handleOnboardingComplete = async (data: any) => {
    await syncProfileWithSupabase();
    navigate(from, { replace: true });
  };

  const handleOnboardingSkip = () => {
    navigate(from, { replace: true });
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Authentifizierung wird überprüft...</p>
      </div>
    );
  }

  // Main auth form display
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          {!registrationComplete ? (
            <>
              <h1 className="text-3xl font-bold text-center mb-4 text-green-800 dark:text-green-400">
                Willkommen bei Rasenpilot
              </h1>
              
              <div className="bg-white border border-green-200 shadow-sm p-4 rounded-lg mb-6 flex items-start gap-3">
                <Lock className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-green-700">
                    Mit Ihrem kostenlosen Konto erhalten Sie Zugriff auf alle <Link to="/features" className="underline font-medium">Premium-Funktionen</Link> wie personalisierte Pflegepläne, Foto-Upload und mehr.
                  </p>
                </div>
              </div>
              
              {!isSupabaseReady ? (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Konfigurationsproblem</AlertTitle>
                  <AlertDescription>
                    Die Supabase-Konfiguration wurde nicht gefunden. Bitte stellen Sie sicher, dass die Umgebungsvariablen VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY korrekt eingerichtet sind.
                    <div className="mt-4">
                      <Link to="/">
                        <Button variant="outline" className="w-full">
                          Zurück zur Startseite
                        </Button>
                      </Link>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <AuthForm 
                  redirectTo={from} 
                  onRegistrationSuccess={handleRegistrationSuccess}
                  initialTab={initialTab} 
                  prefillEmail={prefillEmail}
                />
              )}
            </>
          ) : (
            <div className="w-full max-w-lg">
              <OnboardingWizard 
                onComplete={handleOnboardingComplete} 
                onSkip={handleOnboardingSkip}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
