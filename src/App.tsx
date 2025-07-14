import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LawnProvider } from "@/context/LawnContext";
import SimplifiedLanding from "./pages/SimplifiedLanding";
import LawnAnalysis from "./pages/LawnAnalysis";

import CarePlan from "./pages/CarePlan";
import Blog from "./pages/Blog";
import BlogOverview from "./pages/BlogOverview";
import Highscore from "./pages/Highscore";
import Impressum from "./pages/Impressum";
import Datenschutz from "./pages/Datenschutz";
import AGB from "./pages/AGB";
import UeberUns from "./pages/UeberUns";
import Kontakt from "./pages/Kontakt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LawnProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<SimplifiedLanding />} />
            <Route path="/lawn-analysis" element={<LawnAnalysis />} />
            
            <Route path="/care-plan" element={<CarePlan />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog-overview" element={<BlogOverview />} />
            <Route path="/highscore" element={<Highscore />} />
            
            {/* Legal Pages */}
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/agb" element={<AGB />} />
            
            {/* Company Pages */}
            <Route path="/ueber-uns" element={<UeberUns />} />
            <Route path="/kontakt" element={<Kontakt />} />
          </Routes>
        </BrowserRouter>
      </LawnProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
