
import React, { useState, useEffect } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BlogPostGrid from '@/components/BlogPostGrid';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Search, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BlogOverview = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Helmet>
        <title>Rasen-Blog: Expertentipps für Ihren perfekten Rasen | Rasenpilot</title>
        <meta name="description" content="Entdecken Sie umfassende Expertentipps und Anleitungen für die Rasenpflege. Von Mähen und Düngen bis hin zu Krankheitsbekämpfung - alles für Ihren perfekten Rasen." />
        <meta name="keywords" content="Rasenpflege, Rasen Blog, Rasentipps, Rasendüngung, Rasenmähen, Rasenprobleme, Rasenkrankheiten, Rasenexperte" />
        <link rel="canonical" href="https://rasenpilot.de/blog-overview" />
        <meta property="og:title" content="Rasen-Blog: Expertentipps für Ihren perfekten Rasen | Rasenpilot" />
        <meta property="og:description" content="Entdecken Sie umfassende Expertentipps und Anleitungen für die Rasenpflege. Von Mähen und Düngen bis hin zu Krankheitsbekämpfung - alles für Ihren perfekten Rasen." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rasenpilot.de/blog-overview" />
      </Helmet>
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-green-800 mb-4">Rasen-Blog: Expertentipps & Anleitungen</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Entdecken Sie praxisnahe Anleitungen, saisonale Tipps und Expertenratschläge für einen gesunden, 
            strapazierfähigen und sattgrünen Rasen das ganze Jahr über.
          </p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative md:w-1/2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Blogbeiträge durchsuchen..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="md:w-1/4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="mowing">Rasenmähen</SelectItem>
                <SelectItem value="fertilizing">Rasendüngen</SelectItem>
                <SelectItem value="watering">Bewässerung</SelectItem>
                <SelectItem value="problems">Rasenprobleme</SelectItem>
                <SelectItem value="seasonal">Saisonale Pflege</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="md:w-1/4 flex justify-end">
            <Button 
              onClick={() => navigate('/free-plan')} 
              className="bg-green-600 hover:bg-green-700"
            >
              Pflegeplan erstellen <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <BlogPostGrid searchTerm={searchTerm} categoryFilter={categoryFilter} />
        
        <div className="mt-16 bg-green-50 rounded-lg p-6 border border-green-100">
          <h2 className="text-2xl font-bold text-green-800 mb-4">Erhalten Sie personalisierte Rasenberatung</h2>
          <p className="text-gray-700 mb-4">
            Unsere Rasenpflege-Tools helfen Ihnen, einen maßgeschneiderten Pflegeplan zu erstellen, 
            der perfekt auf Ihren Rasen abgestimmt ist.
          </p>
          <Button 
            onClick={() => navigate('/free-plan')} 
            className="bg-green-600 hover:bg-green-700"
          >
            Kostenlos starten <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogOverview;
