
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider } from 'react-helmet-async'
import { initializeGA, trackPageView, testSupabaseConnection } from './lib/analytics'
import { toast } from 'sonner'

// Initialize Google Analytics
initializeGA('G-7F24N28JNH');

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Test Supabase connection on startup
testSupabaseConnection().then(connected => {
  if (connected) {
    console.log('✅ Supabase connection test successful!');
  } else {
    console.warn('⚠️ Supabase connection test failed');
    toast.warning('Datenbankverbindung konnte nicht hergestellt werden', {
      description: 'Analytics-Funktionen sind möglicherweise eingeschränkt.'
    });
  }
}).catch(error => {
  console.error('Error testing Supabase connection:', error);
  toast.warning('Datenbankverbindung konnte nicht getestet werden', {
    description: 'Ein Netzwerkfehler ist aufgetreten.'
  });
});

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

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </QueryClientProvider>
);
