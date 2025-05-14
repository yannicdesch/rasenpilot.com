import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from '@/components/ui/sonner';

const ProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // We should always be configured now, but keep the check
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured properly');
          toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase authentication error:', error);
          toast.error('Authentifizierungsfehler. Bitte später erneut versuchen.');
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!data.session);
          
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
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up auth listener
    try {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
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
  }, []);

  if (isLoading) {
    // Still checking auth state
    return <div className="h-screen flex items-center justify-center">Lade...</div>;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" state={{ from: location }} />;
};

export default ProtectedRoute;
