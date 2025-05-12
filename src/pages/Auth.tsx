
import React from 'react';
import AuthForm from '@/components/AuthForm';
import MainNavigation from '@/components/MainNavigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';

const Auth = () => {
  // Check if Supabase is configured
  const isSupabaseReady = isSupabaseConfigured();

  return (
    <div className="flex min-h-screen flex-col">
      <MainNavigation />
      <div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-4 text-green-800 dark:text-green-400">Willkommen bei Rasenpilot</h1>
          
          <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg mb-6 flex items-start gap-3">
            <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-green-700 dark:text-green-300">
                Mit Ihrem kostenlosen Konto erhalten Sie Zugriff auf alle <Link to="/features" className="underline font-medium">Premium-Funktionen</Link> wie personalisierte Pflegepläne, Foto-Upload und mehr.
              </p>
            </div>
          </div>
          
          {!isSupabaseReady ? (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Konfigurationsproblem</AlertTitle>
              <AlertDescription>
                Die Supabase-Konfiguration wurde nicht gefunden. Bitte stellen Sie sicher, dass die Umgebungsvariablen VITE_SUPABASE_URL und VITE_SUPABASE_ANON_KEY korrekt eingerichtet sind.
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
