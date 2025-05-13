
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CarePlan from "./pages/CarePlan";
import ChatAssistant from "./pages/ChatAssistant";
import WeatherAdvice from "./pages/WeatherAdvice";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import FeaturesBehindRegistration from "./pages/FeaturesBehindRegistration";
import { LawnProvider } from "./context/LawnContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import FreePlan from "./pages/FreePlan";
import FreeCarePlan from "./pages/FreeCarePlan";
import FreeChat from "./pages/FreeChat";
import FreeWeather from "./pages/FreeWeather";
import FreeLawnAnalysis from "./pages/FreeLawnAnalysis";
import SEOManagement from "./pages/SEOManagement";
import Blog from "./pages/Blog";
import NewBlogPost from "./pages/NewBlogPost";
import EditBlogPost from "./pages/EditBlogPost";

const queryClient = new QueryClient();

const App = () => {
  // Check user's theme preference on app initialization
  useEffect(() => {
    const checkThemePreference = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const theme = data?.session?.user?.user_metadata?.theme;
        
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Check system preference if no user preference is set
          if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
          }
        }
      } catch (error) {
        console.error('Error checking theme preference:', error);
      }
    };
    
    checkThemePreference();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <LawnProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/features" element={<FeaturesBehindRegistration />} />
              
              {/* Kostenlose Routen ohne Registrierung */}
              <Route path="/free-plan" element={<FreePlan />} />
              <Route path="/free-care-plan" element={<FreeCarePlan />} />
              <Route path="/free-chat" element={<FreeChat />} />
              <Route path="/free-weather" element={<FreeWeather />} />
              <Route path="/free-analysis" element={<FreeLawnAnalysis />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} /> 
                <Route path="/care-plan" element={<CarePlan />} />
                <Route path="/chat" element={<ChatAssistant />} />
                <Route path="/weather" element={<WeatherAdvice />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/seo" element={<SEOManagement />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/new" element={<NewBlogPost />} />
                <Route path="/blog/edit/:id" element={<EditBlogPost />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LawnProvider>
    </QueryClientProvider>
  );
};

export default App;
