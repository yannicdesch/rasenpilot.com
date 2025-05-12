
import React from 'react';
import AuthForm from '@/components/AuthForm';
import MainNavigation from '@/components/MainNavigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Auth = () => {
  // Check if we're using default Supabase credentials
  const isDefaultCredentials = 
    import.meta.env.VITE_SUPABASE_URL?.includes('your-supabase-project') || 
    !import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-8 text-green-800">Willkommen bei Rasenpilot</h1>
          
          {isDefaultCredentials ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Konfigurationsproblem</AlertTitle>
              <AlertDescription>
                Die Supabase-Konfiguration wurde nicht gefunden. Bitte stellen Sie sicher, dass Ihre Umgebungsvariablen korrekt eingerichtet sind.
                <div className="mt-4">
                  <Link to="/">
                    <Button variant="outline" className="w-full">
                      Zurück zur Startseite
                    </Button>
                  </Link>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <AuthForm />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
