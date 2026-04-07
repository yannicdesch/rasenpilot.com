import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import { initializeMetaPixel } from './lib/analytics/metaPixel'

// Render immediately
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Initialize Meta Pixel immediately for returning visitors with consent
try {
  initializeMetaPixel();
} catch (e) {
  console.warn('[Meta Pixel] Init error:', e);
}

// Also listen for consent changes (new visitors accepting cookies)
window.addEventListener('cookiePreferencesChanged', () => {
  try {
    initializeMetaPixel();
  } catch (e) {
    console.warn('[Meta Pixel] Re-init error:', e);
  }
});

// Defer other analytics to after first paint
requestIdleCallback(() => {
  import('./lib/analytics').then(({ initializeGA, trackPageView, testSupabaseConnection }) => {
    initializeGA();
    trackPageView(window.location.pathname);

    const originalPushState = history.pushState;
    history.pushState = function() {
      // @ts-ignore
      originalPushState.apply(this, arguments);
      trackPageView(window.location.pathname);
    };
    window.addEventListener('popstate', () => {
      trackPageView(window.location.pathname);
    });

    testSupabaseConnection().then(connected => {
      if (connected) console.log('✅ Supabase connected');
      else console.warn('⚠️ Supabase connection failed');
    }).catch(e => console.error('Supabase test error:', e));
  });
}, { timeout: 3000 });
