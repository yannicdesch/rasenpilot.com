
// Security headers and CSP utilities

export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

export const contentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https: blob:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'"
].join('; ');

// Apply security headers (for use in meta tags)
export const getSecurityMetaTags = () => [
  { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
  { httpEquiv: 'X-Frame-Options', content: 'DENY' },
  { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
  { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
  { httpEquiv: 'Content-Security-Policy', content: contentSecurityPolicy }
];

// Session security utilities
export const sessionSecurity = {
  // Check if session is valid and not expired
  isSessionValid: (lastActivity: Date, timeoutMinutes: number = 30): boolean => {
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();
    const timeoutMs = timeoutMinutes * 60 * 1000;
    return timeDiff < timeoutMs;
  },

  // Update last activity timestamp
  updateLastActivity: (): void => {
    localStorage.setItem('lastActivity', new Date().toISOString());
  },

  // Get last activity timestamp
  getLastActivity: (): Date | null => {
    const lastActivity = localStorage.getItem('lastActivity');
    return lastActivity ? new Date(lastActivity) : null;
  },

  // Clear session data
  clearSession: (): void => {
    localStorage.removeItem('lastActivity');
    localStorage.removeItem('admin_login_success');
  }
};
