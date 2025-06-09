
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
import NotFound from "@/pages/NotFound";
import OnboardingPage from "@/pages/OnboardingPage";
import AnalysisResults from "@/pages/AnalysisResults";
import ProtectedRoute from "@/components/ProtectedRoute";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfUse from "@/pages/TermsOfUse";
import Imprint from "@/pages/Imprint";

function App() {
  return (
    <LawnProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/index" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/analysis-results" element={<AnalysisResults />} />
          
          {/* Legal pages */}
          <Route path="/datenschutz" element={<PrivacyPolicy />} />
          <Route path="/nutzungsbedingungen" element={<TermsOfUse />} />
          <Route path="/impressum" element={<Imprint />} />
          
          {/* Protected Routes - Core member features only */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/care-plan" element={<ProtectedRoute><CarePlan /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><ChatAssistant /></ProtectedRoute>} />
          
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
