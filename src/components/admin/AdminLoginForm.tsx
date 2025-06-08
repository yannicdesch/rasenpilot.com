
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { supabase, checkAuthRateLimit } from '@/lib/supabase';
import { validateEmail } from '@/utils/inputValidation';
import { trackFailedLogin, trackSuccessfulLogin, trackAdminAction } from '@/utils/auditLogger';
import { toast } from 'sonner';

interface AdminLoginFormProps {
  onLoginSuccess?: () => void;
}

const AdminLoginForm: React.FC<AdminLoginFormProps> = ({ onLoginSuccess }) => {
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

      // Rate limiting for admin login attempts
      if (!checkAuthRateLimit(`admin_${email}`, 3, 900000)) { // 3 attempts per 15 minutes
        setErrors(['Zu viele Admin-Anmeldeversuche. Bitte warten Sie 15 Minuten.']);
        await trackAdminAction('login_rate_limited', email);
        setIsLoading(false);
        return;
      }

      // Attempt authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailValidation.sanitizedValue!,
        password: password.trim()
      });

      if (error) {
        await trackFailedLogin(email, `Admin login failed: ${error.message}`);
        
        if (error.message.includes('Invalid login credentials')) {
          setErrors(['Ungültige Admin-Anmeldedaten']);
        } else {
          setErrors([error.message]);
        }
        setIsLoading(false);
        return;
      }

      if (data.user) {
        // Verify admin role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        if (profile?.role !== 'admin') {
          await trackAdminAction('login_insufficient_privileges', data.user.email || email);
          await supabase.auth.signOut();
          setErrors(['Keine Administrator-Berechtigung']);
          setIsLoading(false);
          return;
        }

        // Successful admin login
        await trackSuccessfulLogin(data.user.email || email);
        await trackAdminAction('login_successful', data.user.email || email);
        
        // Set admin flag for the session
        localStorage.setItem('admin_login_success', 'true');
        
        toast.success('Admin-Anmeldung erfolgreich!');
        onLoginSuccess?.();
      }

    } catch (error) {
      await trackFailedLogin(email, 'Admin login exception');
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CardContent className="space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="admin-email">Admin E-Mail</Label>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
            placeholder="admin@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">Admin Passwort</Label>
          <div className="relative">
            <Input
              id="admin-password"
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          <Shield className="mr-2 h-4 w-4" />
          {isLoading ? 'Anmeldung läuft...' : 'Als Administrator anmelden'}
        </Button>
      </form>
    </CardContent>
  );
};

export default AdminLoginForm;
