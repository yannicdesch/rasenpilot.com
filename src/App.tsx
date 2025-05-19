
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
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
import AdminPanel from "@/pages/AdminPanel";
import BlogOverview from "@/pages/BlogOverview";
import BlogPost from "@/pages/BlogPost";
import LogoGeneratorPage from "@/pages/LogoGeneratorPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import Imprint from "@/pages/Imprint";
import ConnectionTestPage from "@/pages/ConnectionTestPage";

function App() {
  return (
    <LawnProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<ConnectionTestPage />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/index" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/get-started" element={<FreePlan />} />
          <Route path="/free-plan" element={<FreePlan />} />
          <Route path="/free-care-plan" element={<FreeCarePlan />} />
          <Route path="/free-chat" element={<FreeChat />} />
          <Route path="/free-analysis" element={<FreeLawnAnalysis />} />
          <Route path="/free-weather" element={<FreeWeather />} />
          <Route path="/features" element={<FeaturesBehindRegistration />} />
          <Route path="/blog-overview" element={<BlogOverview />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Database test route */}
          <Route path="/db-test" element={<ConnectionTestPage />} />
          
          {/* Legal pages */}
          <Route path="/datenschutz" element={<PrivacyPolicy />} />
          <Route path="/nutzungsbedingungen" element={<TermsOfUse />} />
          <Route path="/impressum" element={<Imprint />} />
          
          {/* Protected Routes - Fixed to properly check authentication */}
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
          
          {/* Admin route - Now handled differently in ProtectedRoute */}
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          
          {/* Legacy route */}
          <Route path="/home" element={<Index />} />
          
          {/* Add the LogoGenerator route */}
          <Route path="/logo-generator" element={<LogoGeneratorPage />} />
          
          {/* Catch all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <SonnerToaster position="top-right" expand={false} richColors closeButton />
    </LawnProvider>
  );
}

export default App;
