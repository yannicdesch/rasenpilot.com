
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
import { Progress } from '@/components/ui/progress';

const Auth = () => {
  // Check if Supabase is configured
  const isSupabaseReady = isSupabaseConfigured();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [authProgress, setAuthProgress] = useState(0);
  const { temporaryProfile, syncProfileWithSupabase } = useLawn();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    let progressTimer: number | null = null;
    
    // Start progress animation
    if (checkingAuth) {
      progressTimer = window.setInterval(() => {
        setAuthProgress(prev => Math.min(prev + 10, 90));
      }, 100);
    }
    
    // Enforce max time for auth check
    const maxAuthCheckTime = setTimeout(() => {
      if (checkingAuth) {
        setCheckingAuth(false);
        if (progressTimer) clearInterval(progressTimer);
      }
    }, 2000);
    
    // Check if user is already authenticated
    const checkExistingAuth = async () => {
      if (!isSupabaseReady) {
        setCheckingAuth(false);
        if (progressTimer) clearInterval(progressTimer);
        return;
      }
      
      try {
        console.log('Checking for existing auth session...');
        
        // Check for auth_initialized flag that indicates we just logged in
        const authInitialized = localStorage.getItem('auth_initialized');
        if (authInitialized) {
          console.log('Auth just initialized, skipping check and redirecting');
          localStorage.removeItem('auth_initialized');
          setAlreadyAuthenticated(true);
          
          // Complete progress animation
          setAuthProgress(100);
          
          // Use navigate instead of hard redirect
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 300);
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setCheckingAuth(false);
          if (progressTimer) clearInterval(progressTimer);
          return;
        }
        
        if (data.session) {
          console.log('User already authenticated, redirecting to:', from);
          setAlreadyAuthenticated(true);
          
          // Complete progress animation
          setAuthProgress(100);
          
          // If we have temporary profile data, sync it first
          if (temporaryProfile) {
            console.log('Found temporary profile data, syncing before redirect');
            await syncProfileWithSupabase();
          }
          
          // Use navigate instead of hard redirect
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 300);
        } else {
          console.log('No active session found');
          setCheckingAuth(false);
          if (progressTimer) clearInterval(progressTimer);
        }
      } catch (error) {
        console.error('Unexpected error checking authentication:', error);
        setCheckingAuth(false);
        if (progressTimer) clearInterval(progressTimer);
      }
    };

    // Check for confirmation token in URL (email verification flow)
    const confirmationToken = searchParams.get('confirmation_token');
    if (confirmationToken) {
      console.log('Email confirmation token detected. Handling confirmation...');
      toast.info('E-Mail wird bestätigt...');
    }

    checkExistingAuth();
  
    // Set up auth listener with immediate redirect on sign in
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, !!session);
      
      if (event === 'SIGNED_IN' && session) {
        // Complete progress animation
        setAuthProgress(100);
        
        // If we have temporary profile data, sync it
        if (temporaryProfile) {
          console.log('Found temporary profile data, syncing after sign in');
          await syncProfileWithSupabase();
        }
        
        toast.success('Erfolgreich eingeloggt!');
        localStorage.setItem('auth_initialized', 'true');
        
        // Use navigate instead of hard redirect
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 300);
      } else if (event === 'SIGNED_OUT') {
        toast.info('Abgemeldet');
      }
    });
  
    return () => {
      if (progressTimer) clearInterval(progressTimer);
      clearTimeout(maxAuthCheckTime);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
    
  }, [from, navigate, isSupabaseReady, searchParams, temporaryProfile, syncProfileWithSupabase]);

  const handleRegistrationSuccess = () => {
    setRegistrationComplete(true);
  };

  const handleOnboardingComplete = async (data: any) => {
    // Sync profile before navigating
    await syncProfileWithSupabase();
    navigate(from, { replace: true });
  };

  const handleOnboardingSkip = () => {
    navigate(from, { replace: true });
  };

  // If already authenticated, show minimal loading and immediate redirect
  if (alreadyAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <Progress value={authProgress} className="w-64 h-1.5 mb-3" />
          <p className="text-green-700">Sie sind bereits angemeldet. Weiterleitung zur gewünschten Seite...</p>
        </div>
      </div>
    );
  }

  // If checking auth state, show minimal loading for max 1 second
  if (checkingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3 mx-auto"></div>
          <Progress value={authProgress} className="w-64 h-1.5 mb-3" />
          <p className="text-sm text-gray-500">Überprüfe Anmeldestatus...</p>
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
