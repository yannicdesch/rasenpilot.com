
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, validateAdminRole, validateSession } from '@/lib/supabase';
import { trackAdminAction } from '@/utils/auditLogger';
import { sessionSecurity } from '@/utils/securityHeaders';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    let authCheckTimeout: NodeJS.Timeout;
    
    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Starting auth check for path:', location.pathname);
        
        // Set a timeout to prevent infinite loading
        authCheckTimeout = setTimeout(() => {
          if (mounted) {
            console.log('ProtectedRoute: Auth check timeout, assuming not authenticated');
            setIsAuthenticated(false);
            setIsLoading(false);
          }
        }, 2000);
        
        // Quick session check first
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Session error:', error);
          if (mounted) {
            clearTimeout(authCheckTimeout);
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        const isLoggedIn = !!session;
        console.log('ProtectedRoute: Session check result:', isLoggedIn);
        
        if (mounted) {
          clearTimeout(authCheckTimeout);
          setIsAuthenticated(isLoggedIn);
          
          if (isLoggedIn) {
            // Update session activity
            sessionSecurity.updateLastActivity();
            
            // Check admin status if required
            if (requireAdmin) {
              try {
                const adminStatus = await validateAdminRole();
                setIsAdmin(adminStatus);
                
                if (!adminStatus) {
                  await trackAdminAction('unauthorized_access_attempt', undefined, {
                    path: location.pathname,
                    userId: session?.user.id
                  });
                  toast.error('Nur Administratoren dürfen auf diesen Bereich zugreifen');
                }
              } catch (adminError) {
                console.error('ProtectedRoute: Admin check error:', adminError);
                setIsAdmin(false);
              }
            }
          }
          
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('ProtectedRoute: Auth check error:', error);
        if (mounted) {
          clearTimeout(authCheckTimeout);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Set up auth listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('ProtectedRoute: Auth state changed:', event, !!session);
      
      if (!mounted) return;
      
      const isLoggedIn = !!session;
      setIsAuthenticated(isLoggedIn);
      
      if (event === 'SIGNED_IN' && session) {
        sessionSecurity.updateLastActivity();
        console.log('ProtectedRoute: User signed in, auth should be complete');
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        sessionSecurity.clearSession();
        setIsAdmin(false);
        setIsLoading(false);
        // Don't navigate here - let the component handle it
      } else if (event === 'TOKEN_REFRESHED') {
        sessionSecurity.updateLastActivity();
      }
    });

    // Cleanup function
    return () => {
      mounted = false;
      if (authCheckTimeout) {
        clearTimeout(authCheckTimeout);
      }
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [requireAdmin, location.pathname]);

  // Session timeout checker
  useEffect(() => {
    if (!isAuthenticated) return;

    const checkSessionTimeout = () => {
      const lastActivity = sessionSecurity.getLastActivity();
      if (lastActivity && !sessionSecurity.isSessionValid(lastActivity)) {
        supabase.auth.signOut();
      }
    };

    const interval = setInterval(checkSessionTimeout, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Show loading only briefly
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Wird geladen...</p>
      </div>
    );
  }

  // Check authentication - redirect to auth if not authenticated
  if (isAuthenticated === false) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin privileges if required
  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
