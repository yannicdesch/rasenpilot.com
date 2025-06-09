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
  const isSupabaseReady = isSupabaseConfigured();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();
  
  // Get initial active tab from URL search params
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login';
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.redirectTo || location.state?.from?.pathname || '/dashboard';
  
  // Get pre-filled email from location state if available
  const prefillEmail = location.state?.prefillEmail || '';

  useEffect(() => {
    let mounted = true;
    
    // Quick auth check with shorter timeout
    const checkExistingAuth = async () => {
      if (!isSupabaseReady) {
        if (mounted) setCheckingAuth(false);
        return;
      }
      
      try {
        console.log('Auth page: Checking for existing session...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth page: Session check error:', error);
          if (mounted) setCheckingAuth(false);
          return;
        }
        
        if (data.session && mounted) {
          console.log('Auth page: User already authenticated, redirecting to:', from);
          
          // If we have temporary profile data, sync it first
          if (temporaryProfile) {
            console.log('Auth page: Found temporary profile, syncing before redirect');
            try {
              await syncProfileWithSupabase();
            } catch (syncError) {
              console.error('Auth page: Profile sync error:', syncError);
            }
          }
          
          // Navigate immediately
          navigate(from, { replace: true });
          return;
        }
        
        if (mounted) {
          console.log('Auth page: No active session found');
          setCheckingAuth(false);
        }
      } catch (error) {
        console.error('Auth page: Unexpected error:', error);
        if (mounted) setCheckingAuth(false);
      }
    };

    // Reduce timeout to 500ms to prevent hanging
    const authCheckTimeout = setTimeout(() => {
      if (mounted) {
        console.log('Auth page: Auth check timeout, proceeding to show auth form');
        setCheckingAuth(false);
      }
    }, 500);

    checkExistingAuth();
    
    // Set up auth listener for sign-in events
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth page: Auth state changed:', event, !!session);
      
      if (!mounted) return;
      
      if (event === 'SIGNED_IN' && session) {
        console.log('Auth page: User signed in, syncing profile and redirecting...');
        
        // If we have temporary profile data, sync it
        if (temporaryProfile) {
          console.log('Auth page: Found temporary profile data, syncing after sign in');
          try {
            await syncProfileWithSupabase();
            console.log('Auth page: Profile sync completed successfully');
          } catch (error) {
            console.error('Auth page: Error syncing profile:', error);
            toast.error('Fehler beim Speichern des Profils');
          }
        }
        
        toast.success('Erfolgreich eingeloggt!');
        
        // Navigate to dashboard immediately
        navigate('/dashboard', { replace: true });
        
      } else if (event === 'SIGNED_OUT') {
        toast.info('Abgemeldet');
      }
    });
  
    return () => {
      mounted = false;
      clearTimeout(authCheckTimeout);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
    
  }, [from, navigate, isSupabaseReady, temporaryProfile, syncProfileWithSupabase]);

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

  // If checking auth state, show minimal loading with shorter duration
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2 mx-auto"></div>
          <p className="text-sm text-gray-500">Anmeldestatus wird überprüft...</p>
        </div>
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
