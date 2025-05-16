
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetLink from '@/components/auth/PasswordResetLink';

interface AuthFormProps {
  redirectTo?: string;
  onRegistrationSuccess?: () => void;
  initialTab?: 'login' | 'register';
}

const AuthForm = ({ 
  redirectTo = '/dashboard', 
  onRegistrationSuccess,
  initialTab = 'login'
}: AuthFormProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
  };

  const handleRegistrationWithEmailConfirmation = () => {
    setActiveTab('login');
  };

  if (showPasswordReset) {
    return (
      <div className="w-full max-w-md mx-auto">
        <PasswordResetLink onBackToLogin={handleBackToLogin} />
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Anmelden</TabsTrigger>
          <TabsTrigger value="register">Registrieren</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>
              Melde dich mit deinem Rasenpilot-Konto an
            </CardDescription>
          </CardHeader>
          <LoginForm 
            redirectTo={redirectTo} 
            onForgotPassword={handleForgotPassword} 
          />
        </TabsContent>
        <TabsContent value="register">
          <CardHeader>
            <CardTitle>Account erstellen</CardTitle>
            <CardDescription>
              Erstelle dein Rasenpilot-Konto für persönliche Rasenberatung
            </CardDescription>
          </CardHeader>
          <RegisterForm 
            redirectTo={redirectTo} 
            onRegistrationSuccess={onRegistrationSuccess}
            onRegistrationWithEmailConfirmation={handleRegistrationWithEmailConfirmation}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AuthForm;
