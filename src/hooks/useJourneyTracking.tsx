
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackPageEntry, 
  trackPageExit, 
  trackUserInteraction,
  trackConversion,
  trackFormAbandonment,
  setupDropOffDetection,
  getSessionId
} from '@/lib/analytics/userJourneyTracking';

// Hook for automatic page tracking
export const useJourneyTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    const pageName = location.pathname;
    
    // Track page entry
    trackPageEntry(pageName, {
      search: location.search,
      hash: location.hash,
      referrer: document.referrer
    });
    
    // Setup drop-off detection on first load
    if (pageName === '/') {
      setupDropOffDetection();
    }
    
    // Cleanup function for page exit
    return () => {
      trackPageExit(pageName);
    };
  }, [location]);
  
  return {
    sessionId: getSessionId(),
    trackInteraction: trackUserInteraction,
    trackConversion,
    trackFormAbandonment
  };
};

// Hook for tracking specific interactions
export const useInteractionTracking = (pageName: string) => {
  const trackClick = (elementName: string, additionalData?: Record<string, any>) => {
    trackUserInteraction('click', elementName, pageName, additionalData);
  };
  
  const trackFormSubmit = (formName: string, additionalData?: Record<string, any>) => {
    trackUserInteraction('form_submit', formName, pageName, additionalData);
  };
  
  const trackButtonClick = (buttonName: string, additionalData?: Record<string, any>) => {
    trackUserInteraction('button_click', buttonName, pageName, additionalData);
  };
  
  const trackLinkClick = (linkName: string, destination: string) => {
    trackUserInteraction('link_click', linkName, pageName, { destination });
  };
  
  return {
    trackClick,
    trackFormSubmit,
    trackButtonClick,
    trackLinkClick
  };
};
