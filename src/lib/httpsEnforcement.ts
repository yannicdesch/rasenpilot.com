/**
 * HTTPS Enforcement and Security Utilities
 * Ensures all resources are loaded securely via HTTPS
 */

// Utility to ensure all URLs are HTTPS
export const ensureHttps = (url: string): string => {
  if (!url) return url;
  
  // If it's a relative URL, return as is (will inherit HTTPS from domain)
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return url;
  }
  
  // If it's a data URL or blob URL, return as is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // Convert HTTP to HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  
  // If it doesn't have protocol, assume HTTPS
  if (!url.startsWith('https://') && !url.startsWith('//')) {
    return `https://${url}`;
  }
  
  return url;
};

// Validate that no mixed content is present
export const validateSecureResources = () => {
  if (typeof window === 'undefined') return true;
  
  const protocol = window.location.protocol;
  
  // If we're not on HTTPS in production, warn
  if (protocol !== 'https:' && window.location.hostname !== 'localhost') {
    console.warn('Website should be served over HTTPS in production');
    return false;
  }
  
  return true;
};

// Security headers configuration for deployment
export const getSecurityHeaders = () => ({
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': 
    "default-src 'self' https:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google-analytics.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https:; " +
    "upgrade-insecure-requests;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
});

// HTTPS redirect configuration for .htaccess or nginx
export const getHttpsRedirectConfig = () => ({
  htaccess: `
# Force HTTPS redirect
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Security headers
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
`,
  
  nginx: `
# Force HTTPS redirect
server {
    listen 80;
    server_name rasenpilot.de www.rasenpilot.de;
    return 301 https://$server_name$request_uri;
}

# HTTPS server block with security headers
server {
    listen 443 ssl http2;
    server_name rasenpilot.de www.rasenpilot.de;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # SSL configuration would go here
}
`
});

// Initialize HTTPS enforcement
export const initHttpsEnforcement = () => {
  if (typeof window === 'undefined') return;
  
  // Validate current security
  validateSecureResources();
  
  // Force HTTPS redirect in client-side if needed (fallback)
  if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
    window.location.replace(window.location.href.replace('http:', 'https:'));
  }
};