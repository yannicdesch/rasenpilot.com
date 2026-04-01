import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'

// Render immediately — defer non-critical init
createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Defer analytics & connection tests to after first paint
requestIdleCallback(() => {
  import('./lib/analytics').then(({ initializeGA, trackPageView, testSupabaseConnection }) => {
    initializeGA();
    trackPageView(window.location.pathname);

    // Track navigation changes
    const originalPushState = history.pushState;
    history.pushState = function() {
      // @ts-ignore
      originalPushState.apply(this, arguments);
      trackPageView(window.location.pathname);
    };
    window.addEventListener('popstate', () => {
      trackPageView(window.location.pathname);
    });

    // Test connection silently
    testSupabaseConnection().then(connected => {
      if (connected) console.log('✅ Supabase connected');
      else console.warn('⚠️ Supabase connection failed');
    }).catch(e => console.error('Supabase test error:', e));
  });

  import('./lib/analytics/metaPixel').then(({ initializeMetaPixel }) => {
    initializeMetaPixel();
  });
}, { timeout: 3000 });
