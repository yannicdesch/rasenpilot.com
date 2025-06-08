
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLoginForm from './AdminLoginForm';
import { validateAdminRole, logSecurityEvent } from '@/lib/supabase';
import { toast } from 'sonner';

interface SecureAdminAuthProps {
  children: React.ReactNode;
}

export const SecureAdminAuth: React.FC<SecureAdminAuthProps> = ({ children }) => {
  const [isValidAdmin, setIsValidAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [securityWarning, setSecurityWarning] = useState<string | null>(null);

  useEffect(() => {
    validateAdmin();
  }, []);

  const validateAdmin = async () => {
    try {
      setIsLoading(true);
      
      // Log admin access attempt
      await logSecurityEvent('admin_access_attempt', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      });

      const isAdmin = await validateAdminRole();
      
      if (isAdmin) {
        await logSecurityEvent('admin_access_granted');
        setIsValidAdmin(true);
      } else {
        await logSecurityEvent('admin_access_denied', {
          reason: 'insufficient_privileges'
        });
        setIsValidAdmin(false);
        setSecurityWarning('Insufficient privileges. Admin role required.');
      }
    } catch (error) {
      console.error('Admin validation error:', error);
      await logSecurityEvent('admin_validation_error', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      setIsValidAdmin(false);
      setSecurityWarning('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    // Re-validate admin status after successful login
    validateAdmin();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
        <p className="text-green-800 text-sm">Verifying admin access...</p>
      </div>
    );
  }

  if (!isValidAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {securityWarning && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {securityWarning}
              </AlertDescription>
            </Alert>
          )}
          
          <Card className="border-red-100">
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-800">
                Admin Access Required
              </CardTitle>
              <p className="text-gray-600">
                Please sign in with an administrator account to continue.
              </p>
            </CardHeader>
            <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default SecureAdminAuth;
