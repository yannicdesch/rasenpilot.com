
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import CarePlan from "@/pages/CarePlan";
import ChatAssistant from "@/pages/ChatAssistant";
import WeatherAdvice from "@/pages/WeatherAdvice";
import ContentLibrary from "@/pages/ContentLibrary";
import SEOManagement from "@/pages/SEOManagement";
import Blog from "@/pages/Blog";
import EditBlogPost from "@/pages/EditBlogPost";
import NewBlogPost from "@/pages/NewBlogPost";
import SeasonGuide from "@/pages/SeasonGuide";
import NotFound from "@/pages/NotFound";
import FeaturesBehindRegistration from "@/pages/FeaturesBehindRegistration";
import FreePlan from "@/pages/FreePlan";
import FreeCarePlan from "@/pages/FreeCarePlan";
import FreeChat from "@/pages/FreeChat";
import FreeLawnAnalysis from "@/pages/FreeLawnAnalysis";
import FreeWeather from "@/pages/FreeWeather";
import ProtectedRoute from "@/components/ProtectedRoute";

function App() {
  return (
    <LawnProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/index" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/get-started" element={<FreePlan />} />
          <Route path="/free-plan" element={<FreePlan />} />
          <Route path="/free-care-plan" element={<FreeCarePlan />} />
          <Route path="/free-chat" element={<FreeChat />} />
          <Route path="/free-analysis" element={<FreeLawnAnalysis />} />
          <Route path="/free-weather" element={<FreeWeather />} />
          <Route path="/features" element={<FeaturesBehindRegistration />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/care-plan" element={<ProtectedRoute><CarePlan /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatAssistant /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherAdvice /></ProtectedRoute>} />
          <Route path="/content-library" element={<ProtectedRoute><ContentLibrary /></ProtectedRoute>} />
          <Route path="/seo-management" element={<ProtectedRoute><SEOManagement /></ProtectedRoute>} />
          <Route path="/blog/edit/:id" element={<ProtectedRoute><EditBlogPost /></ProtectedRoute>} />
          <Route path="/blog/new" element={<ProtectedRoute><NewBlogPost /></ProtectedRoute>} />
          <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
          <Route path="/season-guide" element={<ProtectedRoute><SeasonGuide /></ProtectedRoute>} />
          
          {/* Legacy route */}
          <Route path="/home" element={<Index />} />

          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </LawnProvider>
  );
}

export default App;
