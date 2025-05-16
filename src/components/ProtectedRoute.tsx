
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // If auth_initialized is true, user just logged in, so we can immediately show the protected content
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
          navigate('/auth', { replace: true });
          return;
        }

        // Get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase authentication error:', error);
          toast.error('Authentifizierungsfehler. Bitte später erneut versuchen.');
          setIsAuthenticated(false);
          setIsLoading(false);
          navigate('/auth', { replace: true });
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
              onClick: () => navigate('/features')
            }
          });
          navigate('/auth', { replace: true });
        }
        
        // Complete loading state faster
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/auth', { replace: true });
      }
    };

    // Set shorter timeout for loading state (500ms max)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Auth check timeout reached, forcing completion');
        setIsLoading(false);
        
        // If we're still not sure of the auth state after timeout, try to check one more time
        if (isAuthenticated === null) {
          supabase.auth.getSession().then(({ data }) => {
            const hasSession = !!data.session;
            setIsAuthenticated(hasSession);
            
            if (!hasSession) {
              navigate('/auth', { replace: true });
            }
          });
        }
      }
    }, 500); // Reduce timeout to 500ms for faster UX

    checkAuth();

    // Set up auth listener to respond to auth state changes in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in ProtectedRoute:', event, !!session);
      
      // Update authentication state immediately when auth state changes
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (event === 'SIGNED_IN') {
        toast.success('Erfolgreich eingeloggt!');
      } else if (event === 'SIGNED_OUT') {
        toast.info('Sie wurden abgemeldet');
        navigate('/auth', { replace: true });
      }
    });
  
    return () => {
      clearTimeout(timeout);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate]);

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
  // If not authenticated, navigate to the login page
  return isAuthenticated ? 
    <>{children}</> : 
    <Navigate to="/auth" state={{ from: location }} replace />;
}

export default ProtectedRoute;
