
import React from 'react';
import AuthForm from '@/components/AuthForm';
import MainNavigation from '@/components/MainNavigation';

const Auth = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-green-800">Willkommen bei Rasenpilot</h1>
          <AuthForm />
        </div>
      </div>
    </div>
  );
};

export default Auth;
