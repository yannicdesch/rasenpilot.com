
import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";
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
import AdminRoute from "./components/AdminRoute";
import { useEffect } from "react";
import { supabase } from "./lib/supabase";
import FreePlan from "./pages/FreePlan";
import FreeCarePlan from "./pages/FreeCarePlan";
import FreeChat from "./pages/FreeChat";
import FreeWeather from "./pages/FreeWeather";
import FreeLawnAnalysis from "./pages/FreeLawnAnalysis";
import SEOManagement from "./pages/SEOManagement";
import Blog from "./pages/Blog";
import BlogPostView from "./pages/BlogPostView";
import NewBlogPost from "./pages/NewBlogPost";
import EditBlogPost from "./pages/EditBlogPost";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";

// Create the query client once (outside the component)
const queryClient = new QueryClient();

const App = () => {
  // Modified theme initialization to prefer light mode
  useEffect(() => {
    const checkThemePreference = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const theme = data?.session?.user?.user_metadata?.theme;
        
        // Always ensure dark mode is removed by default
        document.documentElement.classList.remove('dark');
        
        // Only apply dark mode if explicitly set in user preferences
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
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
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/post/:id" element={<BlogPostView />} />
              
              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} /> 
                <Route path="/care-plan" element={<CarePlan />} />
                <Route path="/chat" element={<ChatAssistant />} />
                <Route path="/weather" element={<WeatherAdvice />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/seo" element={<SEOManagement />} />
                <Route path="/blog/new" element={<NewBlogPost />} />
                <Route path="/blog/edit/:id" element={<EditBlogPost />} />
                <Route path="/analysis" element={<FreeLawnAnalysis />} /> {/* Redirects to this route when authenticated */}
              </Route>
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ShadcnToaster />
          <Toaster />
        </TooltipProvider>
      </LawnProvider>
    </QueryClientProvider>
  );
};

export default App;
