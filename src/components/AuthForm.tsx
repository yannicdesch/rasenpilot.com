
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';
import PasswordResetLink from '@/components/auth/PasswordResetLink';
import { trackPageView, trackRegistrationStart, trackRegistrationStep } from '@/lib/analytics';

interface AuthFormProps {
  redirectTo?: string;
  onRegistrationSuccess?: () => void;
  initialTab?: 'login' | 'register';
  prefillEmail?: string;
}

const AuthForm = ({ 
  redirectTo = '/dashboard', 
  onRegistrationSuccess,
  initialTab = 'login',
  prefillEmail = ''
}: AuthFormProps) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') as 'login' | 'register' | null;
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(tabFromUrl || initialTab);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Track auth form view with specific tab
  useEffect(() => {
    if (activeTab === 'register') {
      trackRegistrationStart();
      trackRegistrationStep('auth_form_register_tab');
    } else {
      trackPageView('/auth/login');
    }
  }, [activeTab]);

  // Update active tab when URL params change
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === 'login' || tabFromUrl === 'register')) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleForgotPassword = () => {
    setShowPasswordReset(true);
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
  };

  const handleRegistrationWithEmailConfirmation = () => {
    trackRegistrationStep('registration_with_email_confirmation');
    setActiveTab('login');
  };

  const handleTabChange = (value: 'login' | 'register') => {
    if (value === 'register') {
      trackRegistrationStep('switched_to_register_tab');
    }
    setActiveTab(value);
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
      <Tabs value={activeTab} onValueChange={handleTabChange}>
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
