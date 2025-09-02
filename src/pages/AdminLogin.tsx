import React from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLoginForm from '@/components/admin/AdminLoginForm';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = () => {
    navigate('/admin-panel');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">
                Admin Login
              </CardTitle>
              <CardDescription>
                Zugang zum Administrationsbereich
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminLoginForm onLoginSuccess={handleLoginSuccess} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;