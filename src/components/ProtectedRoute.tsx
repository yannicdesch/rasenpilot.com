
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
        
        // Complete loading regardless of authentication status
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
      }
    };

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
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Show a better loading state with visual feedback
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
