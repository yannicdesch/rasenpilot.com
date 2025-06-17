
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import JourneyTracker from "@/components/JourneyTracker";
import Landing from "@/pages/Landing";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import CarePlan from "@/pages/CarePlan";
import ChatAssistant from "@/pages/ChatAssistant";
import Subscription from "@/pages/Subscription";
import NotFound from "@/pages/NotFound";
import OnboardingPage from "@/pages/OnboardingPage";
import AnalysisResults from "@/pages/AnalysisResults";
import ProtectedRoute from "@/components/ProtectedRoute";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import Imprint from "@/pages/Imprint";
import Blog from "@/pages/Blog";
import BlogOverview from "@/pages/BlogOverview";
import NewBlogPost from "@/pages/NewBlogPost";
import EditBlogPost from "@/pages/EditBlogPost";
import BlogPost from "@/pages/BlogPost";
import SEOManagement from "@/pages/SEOManagement";
import AdminPanel from "@/pages/AdminPanel";
import ConnectionTestPage from "@/pages/ConnectionTestPage";

function App() {
  return (
    <LawnProvider>
      <Router>
        <JourneyTracker />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/index" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/analysis-results" element={<AnalysisResults />} />
          
          {/* Public Blog Content Routes */}
          <Route path="/blog-overview" element={<BlogOverview />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          
          {/* Protected Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminPanel /></ProtectedRoute>} />
          <Route path="/connection-test" element={<ProtectedRoute requireAdmin><ConnectionTestPage /></ProtectedRoute>} />
          
          {/* Protected Blog Management Routes */}
          <Route path="/blog" element={<ProtectedRoute><Blog /></ProtectedRoute>} />
          <Route path="/blog/new" element={<ProtectedRoute><NewBlogPost /></ProtectedRoute>} />
          <Route path="/blog/edit/:id" element={<ProtectedRoute><EditBlogPost /></ProtectedRoute>} />
          <Route path="/seo-management" element={<ProtectedRoute><SEOManagement /></ProtectedRoute>} />
          
          {/* Legal pages */}
          <Route path="/datenschutz" element={<PrivacyPolicy />} />
          <Route path="/nutzungsbedingungen" element={<TermsOfUse />} />
          <Route path="/impressum" element={<Imprint />} />
          
          {/* Protected Routes - Core member features */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/care-plan" element={<ProtectedRoute><CarePlan /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatAssistant /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><Subscription /></ProtectedRoute>} />
          
          {/* Legacy route */}
          <Route path="/home" element={<Index />} />
          
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
