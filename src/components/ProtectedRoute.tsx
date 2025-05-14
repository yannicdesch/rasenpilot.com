
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useLawn } from '@/context/LawnContext';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuthentication } = useLawn();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // We should always be configured now, but keep the check
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured properly');
          toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
          setIsLoading(false);
          setHasCheckedAuth(true);
          return;
        }

        // Force a check of authentication status
        const authResult = await checkAuthentication();
        console.log("Authentication check result:", authResult);
        
        // Get the session directly as well for double verification
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase authentication error:', error);
          toast.error('Authentifizierungsfehler. Bitte später erneut versuchen.');
        } else {
          console.log("Auth session check in ProtectedRoute:", data.session ? "Session exists" : "No session");
          
          // If not authenticated, inform about premium features
          if (!data.session) {
            toast.error('Diese Funktion erfordert eine Anmeldung. Sehen Sie sich unsere Premium-Funktionen an.', {
              action: {
                label: 'Mehr Info',
                onClick: () => window.location.href = '/features'
              },
            });
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
        setHasCheckedAuth(true);
      }
    };

    console.log("ProtectedRoute mounted, verifying authentication...");
    verifyAuthentication();
    
    // Set up auth listener for real-time updates
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed in ProtectedRoute:", event, !!session);
      const authResult = await checkAuthentication();
      console.log("Auth result after state change:", authResult);
      setHasCheckedAuth(true);
      setIsLoading(false);
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [checkAuthentication]);

  // Add explicit logging to help debug the rendering condition
  console.log("Protected route render state:", { 
    isLoading, 
    hasCheckedAuth, 
    isAuthenticated 
  });
  
  if (isLoading || !hasCheckedAuth) {
    // Still checking auth state
    return <div className="h-screen flex items-center justify-center">Lade...</div>;
  }

  console.log("Protected route render - isAuthenticated:", isAuthenticated);
  
  if (!isAuthenticated) {
    console.log("Redirecting to auth page from protected route");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <Outlet />;
};

export default ProtectedRoute;
