
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import { toast } from '@/components/ui/sonner';

const AdminRoute = () => {
  const { isAuthenticated, isAdmin, checkAdminRole } = useLawn();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = async () => {
      await checkAdminRole();
      setIsChecking(false);
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
