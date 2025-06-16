
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { LawnProvider } from '@/context/LawnContext';

import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import LawnAnalysis from '@/pages/LawnAnalysis';
import Features from '@/pages/Features';
import Pricing from '@/pages/Pricing';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Imprint from '@/pages/Imprint';
import FreeLawnAnalysis from '@/pages/FreeLawnAnalysis';
import BlogIndex from '@/pages/blog/BlogIndex';
import BlogPost from '@/pages/blog/BlogPost';

function App() {
  return (
    <LawnProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lawn-analysis" element={<LawnAnalysis />} />
          <Route path="/features" element={<Features />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/free-lawn-analysis" element={<FreeLawnAnalysis />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
        </Routes>
      </BrowserRouter>
    </LawnProvider>
  );
}

export default App;
