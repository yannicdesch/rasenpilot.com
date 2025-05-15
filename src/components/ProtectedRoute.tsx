
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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
          console.log('Auth session check:', data.session ? 'Session found' : 'No session found');
          // The key fix is here - properly check if we have a session
          setIsAuthenticated(!!data.session);
          
          // If not authenticated, inform about premium features
          if (!data.session) {
            toast('Diese Funktion erfordert eine Anmeldung. Sehen Sie sich unsere Premium-Funktionen an.', {
              action: {
                label: 'Mehr Info',
                onClick: () => window.location.href = '/features'
              }
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
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event, !!session);
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

  // If authenticated, render the children (protected content)
  // If not authenticated, redirect to the login page
  return isAuthenticated ? 
    <>{children}</> : 
    <Navigate to="/auth" state={{ from: location }} replace />;
}

export default ProtectedRoute;
