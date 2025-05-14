
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, checkAdminRole } = useLawn();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        // Get current user session
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        
        if (!session) {
          setIsChecking(false);
          return;
        }
        
        const userEmail = session.user?.email?.toLowerCase();
        console.log('Current user email:', userEmail);
        
        // Special case for yannic.desch@gmail.com
        if (userEmail === 'yannic.desch@gmail.com') {
          console.log('Special user detected, ensuring admin rights');
          // Update user metadata to ensure isAdmin: true
          try {
            const { error } = await supabase.auth.updateUser({
              data: { isAdmin: true }
            });
            
            if (error) {
              console.error('Failed to update admin status:', error);
            } else {
              console.log('Admin rights confirmed for special user');
            }
          } catch (err) {
            console.error('Error updating user:', err);
          }
        }
        
        // Force check admin role from context
        await checkAdminRole();
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (isAuthenticated) {
      checkAdmin();
    } else {
      setIsChecking(false);
    }
  }, [isAuthenticated, checkAdminRole]);

  if (isChecking) {
    // Still checking admin status
    return <div className="h-screen flex items-center justify-center">Überprüfe Berechtigungen...</div>;
  }

  if (!isAuthenticated) {
    toast.error('Bitte loggen Sie sich ein, um den Admin-Bereich zu nutzen.');
    return <Navigate to="/auth" state={{ from: location }} />;
  }

  if (!isAdmin) {
    toast.error('Sie haben keine Administrator-Berechtigung.');
    return <Navigate to="/dashboard" state={{ from: location }} />;
  }

  return <Outlet />;
};

export default AdminRoute;
