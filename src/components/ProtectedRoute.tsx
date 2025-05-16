
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
    // If auth_initialized is true, user just logged in, so we can skip the check
    const authInitialized = localStorage.getItem('auth_initialized');
    if (authInitialized) {
      console.log('Auth initialized flag found, bypassing authentication check');
      setIsAuthenticated(true);
      setIsLoading(false);
      localStorage.removeItem('auth_initialized');
      return;
    }

    const checkAuth = async () => {
      try {
        // Short circuit if Supabase is not configured
        if (!isSupabaseConfigured()) {
          console.error('Supabase is not configured properly');
          toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase authentication error:', error);
          toast.error('Authentifizierungsfehler. Bitte später erneut versuchen.');
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }
        
        console.log('Auth session check:', data.session ? 'Session found' : 'No session found');
        
        // Update authentication state based on session presence
        const isLoggedIn = !!data.session;
        setIsAuthenticated(isLoggedIn);
        
        // If not authenticated, inform about premium features
        if (!isLoggedIn) {
          toast('Diese Funktion erfordert eine Anmeldung. Sehen Sie sich unsere Premium-Funktionen an.', {
            action: {
              label: 'Mehr Info',
              onClick: () => window.location.href = '/features'
            }
          });
        }
        
        // Maximum loading time of 2 seconds to prevent getting stuck
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

    // Set maximum timeout for loading state
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Auth check timeout reached, forcing completion');
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 3000);

    checkAuth();

    // Set up auth listener to respond to auth state changes in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in ProtectedRoute:', event, !!session);
      
      // Update authentication state immediately when auth state changes
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (event === 'SIGNED_OUT') {
        toast.info('Sie wurden abgemeldet');
      }
    });
  
    return () => {
      clearTimeout(timeout);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Show a better loading state with visual feedback, but only for a short time
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mb-4"></div>
        <p className="text-green-800">Authentifizierung wird überprüft...</p>
      </div>
    );
  }

  // If authenticated, render the children (protected content)
  // If not authenticated, redirect to the login page
  return isAuthenticated ? 
    <>{children}</> : 
    <Navigate to="/auth" state={{ from: location }} replace />;
}

export default ProtectedRoute;
