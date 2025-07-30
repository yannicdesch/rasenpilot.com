
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
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('ProtectedRoute: Checking authentication for path:', location.pathname);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('ProtectedRoute: Session error:', error);
          setIsAuthenticated(false);
          return;
        }

        const isLoggedIn = !!session;
        console.log('ProtectedRoute: Authentication status:', isLoggedIn);
        
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
        
      } catch (error) {
        console.error('ProtectedRoute: Auth check error:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
    };

    checkAuth();
  }, [requireAdmin, location.pathname]);

  // Show loading
  if (isAuthenticated === null) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-8 h-8 border-2 border-green-200 border-t-green-600 rounded-full animate-spin mb-2"></div>
        <p className="text-green-800 text-sm">Berechtigung wird überprüft...</p>
      </div>
    );
  }

  // Check authentication
  if (isAuthenticated === false) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /lawn-analysis');
    return <Navigate to="/lawn-analysis" state={{ from: location }} replace />;
  }

  // Check admin privileges if required
  if (requireAdmin && !isAdmin) {
    console.log('ProtectedRoute: Admin required but user is not admin, redirecting to /lawn-analysis');
    return <Navigate to="/lawn-analysis" state={{ from: location }} replace />;
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;
