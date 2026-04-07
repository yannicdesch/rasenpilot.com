// Meta Pixel Implementation with Cookie Consent
import { hasConsentFor } from '@/utils/cookieUtils';

const META_PIXEL_ID = '13068169146888676';

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
  }
}

let pixelInitialized = false;

// Load the fbevents.js script and set up fbq
const loadPixelScript = (): void => {
  if (window.fbq) return;

  (function(f: any, b: Document, e: string, v: string, n?: any, t?: HTMLScriptElement, s?: Element) {
    if (f.fbq) return;
    n = f.fbq = function() {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s?.parentNode?.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
};

// Initialize Meta Pixel
export const initializeMetaPixel = (): void => {
  try {
    if (!hasConsentFor('marketing')) {
      console.log('[Meta Pixel] Marketing consent not given, skipping initialization');
      return;
    }

    if (pixelInitialized) {
      console.log('[Meta Pixel] Already initialized');
      return;
    }

    loadPixelScript();
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
    pixelInitialized = true;

    console.log('[Meta Pixel] Initialized with ID:', META_PIXEL_ID);
  } catch (error) {
    console.error('[Meta Pixel] Initialization error:', error);
  }
};

// Track PageView event
export const trackMetaPageView = (): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;
  window.fbq('track', 'PageView');
};

// Track ViewContent event
export const trackMetaViewContent = (contentName: string, contentCategory?: string, value?: number, currency: string = 'EUR'): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = { content_name: contentName };
  if (contentCategory) params.content_category = contentCategory;
  if (value !== undefined) {
    params.value = value;
    params.currency = currency;
  }

  window.fbq('track', 'ViewContent', params);
  console.log('[Meta Pixel] ViewContent tracked:', params);
};

// Track InitiateCheckout event
export const trackMetaInitiateCheckout = (value: number, currency: string = 'EUR', contentName?: string): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = { value, currency };
  if (contentName) params.content_name = contentName;

  window.fbq('track', 'InitiateCheckout', params);
  console.log('[Meta Pixel] InitiateCheckout tracked:', params);
};

// Track Purchase event
export const trackMetaPurchase = (value: number, currency: string = 'EUR', contentName?: string, contentIds?: string[]): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = { value, currency };
  if (contentName) params.content_name = contentName;
  if (contentIds) params.content_ids = contentIds;

  window.fbq('track', 'Purchase', params);
  console.log('[Meta Pixel] Purchase tracked:', params);
};

// Track StartTrial event
export const trackMetaStartTrial = (value: number = 0, currency: string = 'EUR', contentName?: string): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = { value, currency };
  if (contentName) params.content_name = contentName;

  window.fbq('track', 'StartTrial', params);
  console.log('[Meta Pixel] StartTrial tracked:', params);
};

// Track Lead event
export const trackMetaLead = (contentName?: string): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = {};
  if (contentName) params.content_name = contentName;

  window.fbq('track', 'Lead', params);
  console.log('[Meta Pixel] Lead tracked:', params);
};

// Track CompleteRegistration event
export const trackMetaCompleteRegistration = (contentName?: string, status?: string): void => {
  if (!hasConsentFor('marketing') || !window.fbq) return;

  const params: Record<string, any> = {};
  if (contentName) params.content_name = contentName;
  if (status) params.status = status;

  window.fbq('track', 'CompleteRegistration', params);
  console.log('[Meta Pixel] CompleteRegistration tracked:', params);
};

// Re-initialize pixel when consent is given
export const onMarketingConsentGiven = (): void => {
  pixelInitialized = false; // Reset so it can re-init
  initializeMetaPixel();
};
