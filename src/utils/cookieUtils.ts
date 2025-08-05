import { CookiePreferences } from '@/components/CookieConsent';

export const getCookiePreferences = (): CookiePreferences | null => {
  const consent = localStorage.getItem('cookie-consent');
  if (!consent) return null;
  
  const preferences = localStorage.getItem('cookie-preferences');
  if (!preferences) return null;
  
  try {
    return JSON.parse(preferences);
  } catch {
    return null;
  }
};

export const hasConsentFor = (category: keyof CookiePreferences): boolean => {
  const preferences = getCookiePreferences();
  if (!preferences) return false;
  return preferences[category];
};

export const setCookie = (name: string, value: string, days: number = 365) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
};

export const clearNonEssentialCookies = () => {
  const preferences = getCookiePreferences();
  if (!preferences) return;
  
  // Clear analytics cookies if not consented
  if (!preferences.analytics) {
    deleteCookie('_ga');
    deleteCookie('_ga_*');
    deleteCookie('_gid');
    deleteCookie('_gat');
  }
  
  // Clear marketing cookies if not consented
  if (!preferences.marketing) {
    deleteCookie('_fbp');
    deleteCookie('_fbc');
    // Add other marketing cookies as needed
  }
  
  // Clear preference cookies if not consented
  if (!preferences.preferences) {
    deleteCookie('theme');
    deleteCookie('language');
    // Add other preference cookies as needed
  }
};

// Listen for cookie preference changes and clear cookies accordingly
if (typeof window !== 'undefined') {
  window.addEventListener('cookiePreferencesChanged', () => {
    clearNonEssentialCookies();
  });
}