// Import the singleton instance to avoid multiple clients
import { supabase } from '@/integrations/supabase/client';
import { auditLogger, trackSecurityViolation } from '@/utils/auditLogger';

// Re-export the singleton instance
export { supabase };

// Check if Supabase is properly configured
export const isSupabaseConfigured = (): boolean => {
  const supabaseUrl = "https://ugaxwcslhoppflrbuwxv.supabase.co";
  const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnYXh3Y3NsaG9wcGZscmJ1d3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcwNDM5NjAsImV4cCI6MjA2MjYxOTk2MH0.KyogGsaBrpu4_3j3AJ9k7J7DlwLDtUbWb2wAhnVBbGQ";
  return !!(supabaseUrl && supabaseAnonKey);
};

// Enhanced admin role validation with security logging
export const validateAdminRole = async (): Promise<boolean> => {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      await auditLogger.security('admin_validation_auth_error', { error: authError.message });
      return false;
    }

    if (!user) {
      await auditLogger.security('admin_validation_no_user');
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError) {
      await auditLogger.security('admin_validation_profile_error', { 
        userId: user.id, 
        error: profileError.message 
      });
      return false;
    }

    const isAdmin = profile?.role === 'admin';
    
    if (isAdmin) {
      await auditLogger.security('admin_validation_success', { userId: user.id });
    } else {
      await auditLogger.security('admin_validation_insufficient_role', { 
        userId: user.id, 
        actualRole: profile?.role 
      });
    }

    return isAdmin;
  } catch (error) {
    await auditLogger.security('admin_validation_exception', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
};

// Enhanced security event logging
export const logSecurityEvent = async (action: string, details?: Record<string, any>) => {
  try {
    await auditLogger.security(action, details);
  } catch (error) {
    // Fallback logging if audit logger fails
    console.error('Security event logging failed:', error);
  }
};

// Rate limiting for authentication attempts
const authRateLimiter = new Map<string, { attempts: number; lastAttempt: number }>();

export const checkAuthRateLimit = (identifier: string, maxAttempts = 5, windowMs = 300000): boolean => {
  const now = Date.now();
  const userAttempts = authRateLimiter.get(identifier);

  if (!userAttempts) {
    authRateLimiter.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - userAttempts.lastAttempt > windowMs) {
    authRateLimiter.set(identifier, { attempts: 1, lastAttempt: now });
    return true;
  }

  // Check if rate limit exceeded
  if (userAttempts.attempts >= maxAttempts) {
    trackSecurityViolation('auth_rate_limit_exceeded', { identifier, attempts: userAttempts.attempts });
    return false;
  }

  // Increment attempts
  authRateLimiter.set(identifier, { 
    attempts: userAttempts.attempts + 1, 
    lastAttempt: now 
  });

  return true;
};

// Secure session management
export const validateSession = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error || !session) {
      return false;
    }

    // Check session expiration
    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    
    if (now >= expiresAt) {
      await logSecurityEvent('session_expired', { userId: session.user.id });
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (error) {
    await logSecurityEvent('session_validation_error', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return false;
  }
};
