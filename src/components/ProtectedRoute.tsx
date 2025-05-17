
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
  
  // Special handling for admin route
  const isAdminRoute = location.pathname === '/admin';

  useEffect(() => {
    // Immediately consider admin login successful if flag exists
    const adminLoginSuccess = localStorage.getItem('admin_login_success');
    if (adminLoginSuccess && isAdminRoute) {
      console.log('Admin login success flag found, bypassing authentication check');
      setIsAuthenticated(true);
      setIsLoading(false);
      return;
    }
    
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
          if (!isAdminRoute) {
            toast.error('Supabase-Konfiguration fehlt. Bitte verwenden Sie gültige Anmeldedaten.');
          }
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Don't navigate away from admin page
          if (!isAdminRoute) {
            navigate('/auth', { state: { from: location }, replace: true });
          }
          return;
        }

        // Get the current session
        console.log('Checking for session in ProtectedRoute');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Supabase authentication error:', error);
          if (!isAdminRoute) {
            toast.error('Authentifizierungsfehler. Bitte später erneut versuchen.');
          }
          setIsAuthenticated(false);
          setIsLoading(false);
          
          // Don't navigate away from admin page
          if (!isAdminRoute) {
            navigate('/auth', { state: { from: location }, replace: true });
          }
          return;
        }
        
        console.log('Auth session check:', data.session ? 'Session found' : 'No session found');
        
        // Update authentication state based on session presence
        const isLoggedIn = !!data.session;
        setIsAuthenticated(isLoggedIn);
        
        // If not authenticated and not on admin page, inform about premium features
        if (!isLoggedIn && !isAdminRoute) {
          toast('Diese Funktion erfordert eine Anmeldung. Sehen Sie sich unsere Premium-Funktionen an.', {
            action: {
              label: 'Mehr Info',
              onClick: () => navigate('/features')
            }
          });
          navigate('/auth', { state: { from: location }, replace: true });
        }
        
        // Complete loading state faster
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        
        // Don't navigate away from admin page
        if (!isAdminRoute) {
          navigate('/auth', { state: { from: location }, replace: true });
        }
      }
    };

    // Set shorter timeout for loading state (150ms max)
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('Auth check timeout reached, forcing completion');
        setIsLoading(false);
        
        // If we're still not sure of the auth state after timeout, try to check one more time
        if (isAuthenticated === null) {
          supabase.auth.getSession().then(({ data }) => {
            const hasSession = !!data.session;
            setIsAuthenticated(hasSession);
            
            if (!hasSession && !isAdminRoute) {
              navigate('/auth', { state: { from: location }, replace: true });
            }
          }).catch(() => {
            if (!isAdminRoute) {
              navigate('/auth', { state: { from: location }, replace: true });
            }
          });
        }
      }
    }, 150); // Reduced timeout to 150ms for faster UX

    // Start auth check process
    checkAuth();

    // Set up auth listener to respond to auth state changes in real-time
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed in ProtectedRoute:', event, !!session);
      
      // Update authentication state immediately when auth state changes
      setIsAuthenticated(!!session);
      setIsLoading(false);
      
      if (event === 'SIGNED_IN') {
        toast.success('Erfolgreich eingeloggt!');
        
        // Set admin login success flag if signing in from admin page
        if (isAdminRoute) {
          localStorage.setItem('admin_login_success', 'true');
        }
      } else if (event === 'SIGNED_OUT') {
        toast.info('Sie wurden abgemeldet');
        if (!isAdminRoute) {
          navigate('/auth', { state: { from: location }, replace: true });
        }
      }
    });
  
    return () => {
      clearTimeout(timeout);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location, isAdminRoute]);

  // Show a better loading state with visual feedback, but only for a very short time
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
        <p className="text-green-800 text-sm">Authentifizierung wird überprüft...</p>
      </div>
    );
  }

  // For admin route, we always render the children and handle auth within the component
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // For other routes, if authenticated, render the children (protected content)
  return isAuthenticated ? 
    <>{children}</> : 
    <Navigate to="/auth" state={{ from: location }} replace />;
}

export default ProtectedRoute;
