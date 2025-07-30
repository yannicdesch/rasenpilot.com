import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import { initHttpsEnforcement } from "@/lib/httpsEnforcement";
import Index from "./pages/Index";
import LawnAnalysis from "./pages/LawnAnalysis";
import CarePlan from "./pages/CarePlan";
import Blog from "./pages/Blog";
import BlogOverview from "./pages/BlogOverview";
import BlogPost from "./pages/BlogPost";
import Highscore from "./pages/Highscore";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import TermsOfUse from "./pages/TermsOfUse";
import UeberUns from "./pages/UeberUns";
import Kontakt from "./pages/Kontakt";
import AdminPanel from "./pages/AdminPanel";
import ChatAssistant from "./pages/ChatAssistant";
import WeatherAdvice from "./pages/WeatherAdvice";
import SeasonGuide from "./pages/SeasonGuide";
import Subscription from "./pages/Subscription";

// Local SEO Pages
import Munich from "./pages/local/Munich";
import Berlin from "./pages/local/Berlin";
import Hamburg from "./pages/local/Hamburg";
import Cologne from "./pages/local/Cologne";
import Frankfurt from "./pages/local/Frankfurt";
import Stuttgart from "./pages/local/Stuttgart";
import Dusseldorf from "./pages/local/Dusseldorf";
import Essen from "./pages/local/Essen";
import Dresden from "./pages/local/Dresden";
import Hannover from "./pages/local/Hannover";
import Bremen from "./pages/local/Bremen";
import Nuremberg from "./pages/local/Nuremberg";

const queryClient = new QueryClient();

const App = () => {
  // Initialize HTTPS enforcement on app startup
  useEffect(() => {
    initHttpsEnforcement();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LawnProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/lawn-analysis" element={<LawnAnalysis />} />
            
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-overview" element={<BlogOverview />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/highscore" element={<Highscore />} />
            
            {/* Legal Pages */}
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
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
            
            {/* Additional Features */}
            <Route path="/chat-assistant" element={<ChatAssistant />} />
            <Route path="/weather-advice" element={<WeatherAdvice />} />
            <Route path="/season-guide" element={<SeasonGuide />} />
            <Route path="/subscription" element={<Subscription />} />
            
            {/* Admin Panel */}
            <Route path="/admin-panel" element={<AdminPanel />} />
          </Routes>
        </BrowserRouter>
      </LawnProvider>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
