
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { initializeGA, trackPageView } from './lib/analytics'

// Initialize Google Analytics
initializeGA('G-7F24N28JNH');

// Create a client
const queryClient = new QueryClient()

// Track initial page view
trackPageView(window.location.pathname);

// Track navigation changes
const originalPushState = history.pushState;
history.pushState = function() {
  // @ts-ignore - We're calling the original function with the original arguments
  originalPushState.apply(this, arguments);
  trackPageView(window.location.pathname);
};

window.addEventListener('popstate', () => {
  trackPageView(window.location.pathname);
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </QueryClientProvider>
);
