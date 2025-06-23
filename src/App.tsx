
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SimplifiedLanding from "./pages/SimplifiedLanding";
import LawnAnalysis from "./pages/LawnAnalysis";
import SimplifiedAuth from "./pages/SimplifiedAuth";
import CarePlan from "./pages/CarePlan";
import Blog from "./pages/Blog";
import BlogOverview from "./pages/BlogOverview";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SimplifiedLanding />} />
          <Route path="/lawn-analysis" element={<LawnAnalysis />} />
          <Route path="/auth" element={<SimplifiedAuth />} />
          <Route path="/care-plan" element={<CarePlan />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog-overview" element={<BlogOverview />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
