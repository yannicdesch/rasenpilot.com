
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";

// Pages
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import FreePlan from "./pages/FreePlan";
import FreeCarePlan from "./pages/FreeCarePlan";
import CarePlan from "./pages/CarePlan";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import FreeLawnAnalysis from "./pages/FreeLawnAnalysis";
import FreeChat from "./pages/FreeChat";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatAssistant from "./pages/ChatAssistant";
import WeatherAdvice from "./pages/WeatherAdvice";
import ContentLibrary from "./pages/ContentLibrary";
import SEOManagement from "./pages/SEOManagement";
import EditBlogPost from "./pages/EditBlogPost";
import NewBlogPost from "./pages/NewBlogPost";
import Blog from "./pages/Blog";
import SeasonGuide from "./pages/SeasonGuide";
import Index from "./pages/Index";
import FreeWeather from "./pages/FreeWeather";
import FeaturesBehindRegistration from "./pages/FeaturesBehindRegistration";

// Global styles
import "./App.css";

// Providers
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";

function App() {
  return (
    <LawnProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/free-plan" element={<FreePlan />} />
          <Route path="/free-care-plan" element={<FreeCarePlan />} />
          <Route path="/free-analysis" element={<FreeLawnAnalysis />} />
          <Route path="/free-chat" element={<FreeChat />} />
          <Route path="/free-weather" element={<FreeWeather />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/care-plan" 
            element={
              <ProtectedRoute>
                <CarePlan />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute>
                <ChatAssistant />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/weather" 
            element={
              <ProtectedRoute>
                <WeatherAdvice />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/content-library" 
            element={
              <ProtectedRoute>
                <ContentLibrary />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seo-management" 
            element={
              <ProtectedRoute>
                <SEOManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog/edit/:id" 
            element={
              <ProtectedRoute>
                <EditBlogPost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog/new" 
            element={
              <ProtectedRoute>
                <NewBlogPost />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/blog" 
            element={
              <ProtectedRoute>
                <Blog />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/season-guide" 
            element={
              <ProtectedRoute>
                <SeasonGuide />
              </ProtectedRoute>
            } 
          />
          
          {/* Legacy route */}
          <Route path="/home" element={<Index />} />
          
          {/* Features preview */}
          <Route path="/features" element={<FeaturesBehindRegistration />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster />
    </LawnProvider>
  );
}

export default App;
