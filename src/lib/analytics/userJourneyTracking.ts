
import { trackEvent } from './tracking';
import { auditLogger } from '@/utils/auditLogger';

// User journey tracking utilities
export interface JourneyEvent {
  eventType: 'page_enter' | 'page_exit' | 'interaction' | 'conversion' | 'drop_off';
  page: string;
  timestamp: string;
  sessionId: string;
  userId?: string;
  data?: Record<string, any>;
}

// Generate session ID for tracking user sessions
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('rasenpilot_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem('rasenpilot_session_id', sessionId);
  }
  return sessionId;
};

// Track page entry
export const trackPageEntry = async (pageName: string, additionalData?: Record<string, any>) => {
  const sessionId = getSessionId();
  
  await trackEvent('user_journey', 'page_enter', pageName, undefined);
  
  // Store in session for drop-off detection
  const pageEntryTime = Date.now();
  sessionStorage.setItem(`page_entry_${pageName}`, pageEntryTime.toString());
  sessionStorage.setItem('current_page', pageName);
  
  console.log(`📍 User entered page: ${pageName}`, { sessionId, additionalData });
};

// Track page exit and calculate time spent
export const trackPageExit = async (pageName: string, nextPage?: string) => {
  const sessionId = getSessionId();
  const entryTimeStr = sessionStorage.getItem(`page_entry_${pageName}`);
  
  if (entryTimeStr) {
    const entryTime = parseInt(entryTimeStr);
    const timeSpent = Date.now() - entryTime;
    
    await trackEvent('user_journey', 'page_exit', pageName, timeSpent);
    
    console.log(`📤 User exited page: ${pageName}`, { 
      sessionId, 
      timeSpent: `${Math.round(timeSpent / 1000)}s`,
      nextPage 
    });
    
    // Clean up
    sessionStorage.removeItem(`page_entry_${pageName}`);
  }
};

// Track user interactions (clicks, form submissions, etc.)
export const trackUserInteraction = async (
  interactionType: string, 
  element: string, 
  page: string,
  additionalData?: Record<string, any>
) => {
  const sessionId = getSessionId();
  
  await trackEvent('user_interaction', interactionType, `${page}:${element}`, undefined);
  
  console.log(`🖱️ User interaction: ${interactionType} on ${element}`, { 
    page, 
    sessionId, 
    additionalData 
  });
};

// Track conversion events
export const trackConversion = async (
  conversionType: string, 
  page: string, 
  value?: number,
  additionalData?: Record<string, any>
) => {
  const sessionId = getSessionId();
  
  await trackEvent('conversion', conversionType, page, value);
  await auditLogger.userAction('conversion', { conversionType, page, value, ...additionalData });
  
  console.log(`🎯 Conversion: ${conversionType} on ${page}`, { 
    sessionId, 
    value, 
    additionalData 
  });
};

// Track potential drop-off points
export const trackDropOffRisk = async (page: string, reason: string) => {
  const sessionId = getSessionId();
  
  await trackEvent('drop_off_risk', reason, page, undefined);
  
  console.log(`⚠️ Drop-off risk detected: ${reason} on ${page}`, { sessionId });
};

// Track form abandonments
export const trackFormAbandonment = async (
  formName: string, 
  page: string, 
  fieldsCompleted: number,
  totalFields: number
) => {
  const sessionId = getSessionId();
  const completionRate = Math.round((fieldsCompleted / totalFields) * 100);
  
  await trackEvent('form_abandonment', formName, page, completionRate);
  
  console.log(`📝 Form abandoned: ${formName} on ${page}`, { 
    sessionId, 
    completionRate: `${completionRate}%`,
    fieldsCompleted,
    totalFields
  });
};

// Detect and track session timeout/abandonment
export const setupDropOffDetection = () => {
  let inactivityTimer: NodeJS.Timeout;
  const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  
  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
      const currentPage = sessionStorage.getItem('current_page');
      if (currentPage) {
        trackDropOffRisk(currentPage, 'inactivity_timeout');
      }
    }, INACTIVITY_TIMEOUT);
  };
  
  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
  });
  
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    const currentPage = sessionStorage.getItem('current_page');
    if (document.hidden && currentPage) {
      trackDropOffRisk(currentPage, 'tab_hidden');
    }
  });
  
  // Track page unload
  window.addEventListener('beforeunload', () => {
    const currentPage = sessionStorage.getItem('current_page');
    if (currentPage) {
      trackPageExit(currentPage);
    }
  });
  
  resetInactivityTimer();
};
