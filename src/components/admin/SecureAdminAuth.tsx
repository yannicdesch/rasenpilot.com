
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AdminLoginForm from './AdminLoginForm';
import { supabase } from '@/lib/supabase';
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
      console.log('SecureAdminAuth: Starting admin validation...');
      
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('SecureAdminAuth: Auth error:', authError);
        setIsValidAdmin(false);
        setSecurityWarning('Authentication error. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!user) {
        console.log('SecureAdminAuth: No user found');
        setIsValidAdmin(false);
        setSecurityWarning('Please sign in to access admin area.');
        setIsLoading(false);
        return;
      }

      console.log('SecureAdminAuth: User found, checking admin role for:', user.email);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('SecureAdminAuth: Profile error:', profileError);
        setIsValidAdmin(false);
        setSecurityWarning('Profile not found. Admin role required.');
        setIsLoading(false);
        return;
      }

      const isAdmin = profile?.role === 'admin';
      console.log('SecureAdminAuth: Admin check result:', isAdmin, 'Role:', profile?.role);
      
      if (isAdmin) {
        setIsValidAdmin(true);
        setSecurityWarning(null);
      } else {
        setIsValidAdmin(false);
        setSecurityWarning('Insufficient privileges. Admin role required.');
      }
      
    } catch (error) {
      console.error('SecureAdminAuth: Validation error:', error);
      setIsValidAdmin(false);
      setSecurityWarning('Authentication error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    console.log('SecureAdminAuth: Login success, re-validating...');
    validateAdmin();
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="w-12 h-12 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mb-3"></div>
        <p className="text-green-800 text-sm">Admin-Zugang wird überprüft...</p>
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
                Admin-Zugang erforderlich
              </CardTitle>
              <p className="text-gray-600">
                Bitte melden Sie sich mit einem Administrator-Konto an.
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
