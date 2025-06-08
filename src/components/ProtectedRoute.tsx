
import React, { useEffect, useState, ReactNode } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { supabase, validateAdminRole, logSecurityEvent } from '@/lib/supabase';
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
    checkAuth();
  }, [requireAdmin]);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Supabase authentication error:', error);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      const isLoggedIn = !!data.session;
      setIsAuthenticated(isLoggedIn);
      
      if (isLoggedIn && requireAdmin) {
        const adminStatus = await validateAdminRole();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          await logSecurityEvent('unauthorized_admin_access_attempt', {
            path: location.pathname,
            userId: data.session.user.id
          });
          toast.error('Nur Administratoren dürfen auf diesen Bereich zugreifen');
        }
      }
      
    } catch (error) {
      console.error('Error checking authentication:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_IN') {
        toast.success('Erfolgreich eingeloggt!');
      } else if (event === 'SIGNED_OUT') {
        toast.info('Sie wurden abgemeldet');
        setIsAdmin(false);
        navigate('/auth', { state: { from: location }, replace: true });
      }
    });
  
    return () => {
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [navigate, location]);

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
        <p className="text-green-800 text-sm">Authentifizierung wird überprüft...</p>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check admin privileges if required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
