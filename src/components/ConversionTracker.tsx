import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  trackRegistrationStart,
  trackAnalysisStart,
  trackSubscriptionStart,
  trackEmailSignup
} from '@/lib/analytics/trackingHelpers';
import { hasConsentFor } from '@/utils/cookieUtils';

const ConversionTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Only track if analytics consent is given
    if (!hasConsentFor('analytics')) {
      return;
    }
    
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    // Track key conversion entry points
    switch (path) {
      case '/lawn-analysis':
        trackAnalysisStart();
        break;
      case '/subscription':
        trackSubscriptionStart('premium');
        break;
      case '/':
        // Track if user came from specific sources
        const source = searchParams.get('utm_source') || searchParams.get('ref');
        if (source) {
          trackEmailSignup(source);
        }
        break;
    }
    
    // Track registration form views
    if (path.includes('register') || searchParams.has('register')) {
      trackRegistrationStart();
    }
    
  }, [location]);
  
  return null; // This is a tracking component, renders nothing
};

export default ConversionTracker;