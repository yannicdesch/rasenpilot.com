
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
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/chat" element={<ChatAssistant />} />
            <Route path="/weather" element={<WeatherAdvice />} />
            <Route path="/content-library" element={<ContentLibrary />} />
            <Route path="/seo-management" element={<SEOManagement />} />
            <Route path="/blog/edit/:id" element={<EditBlogPost />} />
            <Route path="/blog/new" element={<NewBlogPost />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/season-guide" element={<SeasonGuide />} />
          </Route>
          
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
