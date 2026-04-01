import { useEffect, lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { initHttpsEnforcement } from "@/lib/httpsEnforcement";

// Lazy-load non-critical global components
const JourneyTracker = lazy(() => import("@/components/JourneyTracker"));
const ConversionTracker = lazy(() => import("@/components/ConversionTracker"));
const CookieConsent = lazy(() => import('@/components/CookieConsent'));

// All pages lazy-loaded for optimal code splitting
const Index = lazy(() => import("./pages/Index"));
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const LawnAnalysis = lazy(() => import("./pages/LawnAnalysis"));
const AnalysisHistory = lazy(() => import("./pages/AnalysisHistory"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogOverview = lazy(() => import("./pages/BlogOverview"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AnalysisResult = lazy(() => import("./pages/AnalysisResult"));
const Highscore = lazy(() => import("./pages/Highscore"));
const Impressum = lazy(() => import("./pages/Impressum"));
const Datenschutz = lazy(() => import("./pages/Datenschutz"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const AGB = lazy(() => import("./pages/AGB"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const UeberUns = lazy(() => import("./pages/UeberUns"));
const Kontakt = lazy(() => import("./pages/Kontakt"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const WeatherAdvice = lazy(() => import("./pages/WeatherAdvice"));
const SeasonGuide = lazy(() => import("./pages/SeasonGuide"));
const Subscription = lazy(() => import("./pages/Subscription"));
const SubscriptionSuccess = lazy(() => import("./pages/SubscriptionSuccess"));
const Welcome = lazy(() => import("./pages/Welcome"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const PremiumDashboard = lazy(() => import("./pages/PremiumDashboard"));
const CareCalendar = lazy(() => import("./pages/CareCalendar"));
const AccountSettings = lazy(() => import("./pages/AccountSettings"));
const Chat = lazy(() => import("./pages/Chat"));

// Local SEO Pages
const Munich = lazy(() => import("./pages/local/Munich"));
const Berlin = lazy(() => import("./pages/local/Berlin"));
const Hamburg = lazy(() => import("./pages/local/Hamburg"));
const Cologne = lazy(() => import("./pages/local/Cologne"));
const Frankfurt = lazy(() => import("./pages/local/Frankfurt"));
const Stuttgart = lazy(() => import("./pages/local/Stuttgart"));
const Dusseldorf = lazy(() => import("./pages/local/Dusseldorf"));
const Essen = lazy(() => import("./pages/local/Essen"));
const Dresden = lazy(() => import("./pages/local/Dresden"));
const Hannover = lazy(() => import("./pages/local/Hannover"));
const Bremen = lazy(() => import("./pages/local/Bremen"));
const Nuremberg = lazy(() => import("./pages/local/Nuremberg"));
const Leipzig = lazy(() => import("./pages/local/Leipzig"));
const Dortmund = lazy(() => import("./pages/local/Dortmund"));
const Bonn = lazy(() => import("./pages/local/Bonn"));
const RasenpflegeOesterreich = lazy(() => import("./pages/RasenpflegeOesterreich"));
const RasenpflegeSchweiz = lazy(() => import("./pages/RasenpflegeSchweiz"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">Laden...</p>
    </div>
  </div>
);

const App = () => {
  useEffect(() => {
    initHttpsEnforcement();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <LawnProvider>
        <Toaster />
        <BrowserRouter>
          <Suspense fallback={null}>
            <JourneyTracker />
            <ConversionTracker />
            <CookieConsent />
          </Suspense>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lawn-analysis" element={<LawnAnalysis />} />
            <Route path="/analysis-history" element={<AnalysisHistory />} />
            <Route path="/analysis-result/:jobId" element={<AnalysisResult />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-overview" element={<BlogOverview />} />
            <Route path="/ratgeber" element={<BlogOverview />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/highscore" element={<Highscore />} />
            
            {/* Legal Pages */}
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/cookie-policy" element={<CookiePolicy />} />
            <Route path="/agb" element={<AGB />} />
            <Route path="/terms-of-use" element={<TermsOfUse />} />
            <Route path="/nutzungsbedingungen" element={<TermsOfUse />} />
            
            {/* Company Pages */}
            <Route path="/ueber-uns" element={<UeberUns />} />
            <Route path="/kontakt" element={<Kontakt />} />
            
            {/* Local SEO Pages */}
            <Route path="/local/munich" element={<Munich />} />
            <Route path="/local/berlin" element={<Berlin />} />
            <Route path="/local/hamburg" element={<Hamburg />} />
            <Route path="/local/cologne" element={<Cologne />} />
            <Route path="/local/frankfurt" element={<Frankfurt />} />
            <Route path="/local/stuttgart" element={<Stuttgart />} />
            <Route path="/local/dusseldorf" element={<Dusseldorf />} />
            <Route path="/local/essen" element={<Essen />} />
            <Route path="/local/dresden" element={<Dresden />} />
            <Route path="/local/hannover" element={<Hannover />} />
            <Route path="/local/bremen" element={<Bremen />} />
            <Route path="/local/nuremberg" element={<Nuremberg />} />
            <Route path="/local/leipzig" element={<Leipzig />} />
            <Route path="/local/dortmund" element={<Dortmund />} />
            <Route path="/local/bonn" element={<Bonn />} />
            
{/* Redirects */}
            <Route path="/garden-pilot" element={<Navigate to="/lawn-analysis" replace />} />
            <Route path="/rasen-analyse" element={<Navigate to="/lawn-analysis" replace />} />
            <Route path="/rasenanalyse" element={<Navigate to="/lawn-analysis" replace />} />
            <Route path="/lawn-care" element={<Navigate to="/lawn-analysis" replace />} />
            <Route path="/rasen-analysis" element={<Navigate to="/lawn-analysis" replace />} />
            <Route path="/analyse" element={<Navigate to="/lawn-analysis" replace />} />
            
            {/* Country Landing Pages */}
            <Route path="/rasenpflege-oesterreich" element={<RasenpflegeOesterreich />} />
            <Route path="/rasenpflege-schweiz" element={<RasenpflegeSchweiz />} />
            
            <Route path="/weather-advice" element={<WeatherAdvice />} />
            <Route path="/season-guide" element={<SeasonGuide />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription-success" element={<SubscriptionSuccess />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/subscription/manage" element={<SubscriptionManagement />} />
            <Route path="/premium-dashboard" element={<PremiumDashboard />} />
            <Route path="/care-calendar" element={<CareCalendar />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/chat-assistant" element={<Chat />} />
            <Route path="/account-settings" element={<AccountSettings />} />
            
            {/* Admin Panel */}
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/admin-panel" element={<AdminPanel />} />
            
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </BrowserRouter>
        </LawnProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
