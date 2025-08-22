
// Google Analytics setup
import { supabase } from '@/lib/supabase';

interface WindowWithGA extends Window {
  dataLayer: any[];
  gtag: (...args: any[]) => void;
}

declare const window: WindowWithGA;

// Initialize Google Analytics
export const initializeGA = async (measurementId?: string): Promise<void> => {
  let gaId = measurementId;
  
  // Fetch GA ID from site settings if not provided
  if (!gaId) {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('google_analytics_id')
        .single();
      gaId = data?.google_analytics_id || 'G-7F24N28JNH';
    } catch (error) {
      console.warn('Could not fetch GA ID from settings, using default');
      gaId = 'G-7F24N28JNH';
    }
  }

  // Add Google Analytics script to the document
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
  
  // Initialize the data layer and gtag function
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  // Initial configuration
  window.gtag('js', new Date());
  window.gtag('config', gaId, {
    page_title: document.title,
    page_location: window.location.href
  });
  
  console.log('✅ Google Analytics initialized with ID:', gaId);
};

// Track conversion events to Google Analytics
export const trackGAConversion = (eventName: string, parameters: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'conversion',
      ...parameters
    });
  }
};

// Track custom events to Google Analytics
export const trackGAEvent = (action: string, category: string = 'engagement', label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};
