
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';
import { useLawn } from '@/context/LawnContext';

const ProtectedRoute = () => {
  const { isAuthenticated, checkAuthentication } = useLawn();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        // We should always be configured now, but keep the check
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured properly');
          toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
          setIsLoading(false);
          return;
        }

        // Force a check of authentication status
        await checkAuthentication();
        
        // Get the session directly as well
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
      }
    };

    verifyAuthentication();
    
    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in ProtectedRoute:", event, !!session);
      checkAuthentication();
    });

    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [checkAuthentication]);

  if (isLoading) {
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
