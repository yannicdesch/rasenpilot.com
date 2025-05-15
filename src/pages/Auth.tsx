
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import OnboardingWizard from '@/components/OnboardingWizard';
import MainNavigation from '@/components/MainNavigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { useLawn } from '@/context/LawnContext';

const Auth = () => {
  // Check if Supabase is configured
  const isSupabaseReady = isSupabaseConfigured();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Check if user is already authenticated
    const checkExistingAuth = async () => {
      try {
        console.log('Checking for existing auth session...');
        setCheckingAuth(true);
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          return;
        }
        
        if (data.session) {
          console.log('User already authenticated, redirecting to:', from);
          setAlreadyAuthenticated(true);
          
          // If we have temporary profile data, sync it first
          if (temporaryProfile) {
            console.log('Found temporary profile data, syncing before redirect');
            await syncProfileWithSupabase();
          }
          
          // Small timeout to ensure state update before navigation
          setTimeout(() => {
            navigate(from);
          }, 300);
        } else {
          console.log('No active session found');
        }
      } catch (error) {
        console.error('Unexpected error checking authentication:', error);
      } finally {
        setCheckingAuth(false);
      }
    };

    // Check for confirmation token in URL (email verification flow)
    const confirmationToken = searchParams.get('confirmation_token');
    if (confirmationToken) {
      // Let Supabase handle the confirmation token automatically
      console.log('Email confirmation token detected. Handling confirmation...');
      toast.info('E-Mail wird bestätigt...');
    }

    if (isSupabaseReady) {
      checkExistingAuth();
    } else {
      setCheckingAuth(false);
    }
  
    // Set up auth listener
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event, !!session);
        
        if (event === 'SIGNED_IN' && session) {
          // If we have temporary profile data, sync it
          if (temporaryProfile) {
            console.log('Found temporary profile data, syncing after sign in');
            await syncProfileWithSupabase();
          }
          
          toast.success('Erfolgreich eingeloggt!');
          navigate(from);
        } else if (event === 'SIGNED_OUT') {
          toast.info('Abgemeldet');
        }
      });
  
      return () => {
        if (authListener?.subscription) {
          authListener.subscription.unsubscribe();
        }
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      return () => {};
    }
  }, [from, navigate, isSupabaseReady, searchParams, temporaryProfile, syncProfileWithSupabase]);

  const handleRegistrationSuccess = () => {
    setRegistrationComplete(true);
  };

  const handleOnboardingComplete = async (data: any) => {
    // Sync profile before navigating
    await syncProfileWithSupabase();
    navigate(from);
  };

  const handleOnboardingSkip = () => {
    navigate(from);
  };

  // If checking auth state, show a loading state
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <p className="text-sm text-gray-500">Überprüfe Anmeldestatus...</p>
        </div>
      </div>
    );
  }

  // If already authenticated, show a loading state until redirect happens
  if (alreadyAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <p className="mb-2 text-green-700">Sie sind bereits angemeldet.</p>
          <p className="text-sm text-gray-500">Weiterleitung zur gewünschten Seite...</p>
        </div>
      </div>
    );
  }

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
                <AuthForm redirectTo={from} onRegistrationSuccess={handleRegistrationSuccess} />
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
