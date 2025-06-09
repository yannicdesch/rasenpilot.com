
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { supabase, checkAuthRateLimit } from '@/lib/supabase';
import { validateEmail } from '@/utils/inputValidation';
import { trackFailedLogin, trackSuccessfulLogin } from '@/utils/auditLogger';
import { toast } from 'sonner';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  onForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsLoading(true);

    try {
      // Input validation
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        setErrors(emailValidation.errors);
        setIsLoading(false);
        return;
      }

      if (!password.trim()) {
        setErrors(['Passwort ist erforderlich']);
        setIsLoading(false);
        return;
      }

      // Rate limiting check
      if (!checkAuthRateLimit(email)) {
        setErrors(['Zu viele Anmeldeversuche. Bitte versuchen Sie es später erneut.']);
        setIsLoading(false);
        return;
      }

      console.log('LoginForm: Attempting sign in...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitizedValue!,
        password: password.trim()
      });

      if (error) {
        console.error('LoginForm: Sign in error:', error);
        await trackFailedLogin(email, error.message);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrors(['Ungültige E-Mail-Adresse oder Passwort']);
        } else {
          setErrors([error.message]);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        console.log('LoginForm: Sign in successful');
        await trackSuccessfulLogin(data.user.email || email);
        
        // Call onSuccess immediately without waiting for auth state change
        onSuccess?.();
        
        // The auth state change listener will handle the redirect
      }

    } catch (error) {
      console.error('LoginForm: Unexpected error:', error);
      await trackFailedLogin(email, 'Unexpected error during login');
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail-Adresse</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Passwort</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {onForgotPassword && (
        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={onForgotPassword}
            className="text-sm text-green-600 hover:text-green-800"
          >
            Passwort vergessen?
          </Button>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Anmeldung läuft...' : 'Anmelden'}
      </Button>
    </form>
  );
};

export default LoginForm;
