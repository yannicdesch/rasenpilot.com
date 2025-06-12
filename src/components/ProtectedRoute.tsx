
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
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

  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Starting auth check for path:', location.pathname);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Session error:', error);
          if (mounted) {
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        const isLoggedIn = !!session;
        console.log('ProtectedRoute: Session check result:', isLoggedIn);
        
        if (mounted) {
          setIsAuthenticated(isLoggedIn);
          
          if (isLoggedIn && requireAdmin) {
            try {
              console.log('ProtectedRoute: Checking admin role for user:', session?.user.email);
              
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session?.user.id)
                .single();
                
              if (profileError) {
                console.error('ProtectedRoute: Profile error:', profileError);
                setIsAdmin(false);
                toast.error('Profil nicht gefunden. Admin-Berechtigung erforderlich.');
              } else {
                const adminStatus = profile?.role === 'admin';
                console.log('ProtectedRoute: Admin status:', adminStatus, 'Role:', profile?.role);
                setIsAdmin(adminStatus);
                
                if (!adminStatus) {
                  toast.error('Nur Administratoren dürfen auf diesen Bereich zugreifen');
                }
              }
            } catch (adminError) {
              console.error('ProtectedRoute: Admin check error:', adminError);
              setIsAdmin(false);
            }
          } else if (!requireAdmin) {
            setIsAdmin(true); // Not needed for non-admin routes
          }
          
          setIsLoading(false);
        }
        
      } catch (error) {
        console.error('ProtectedRoute: Auth check error:', error);
        if (mounted) {
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
        console.log('ProtectedRoute: User signed in');
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [requireAdmin, location.pathname]);

  // Show loading
  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Wird geladen...</p>
      </div>
    );
  }

  // Check authentication
  if (isAuthenticated === false) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin privileges if required
  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to /auth');
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
