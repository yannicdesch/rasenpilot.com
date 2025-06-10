
import React, { useEffect, useState } from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BlogPostList from '@/components/BlogPostList';
import AiBlogGenerator from '@/components/AiBlogGenerator';
import { supabase } from '@/lib/supabase';
import type { SEOContentType } from '@/components/SEOContentEditor';
import SEO from '@/components/SEO';

const Blog = () => {
  const navigate = useNavigate();
  const [seoContent, setSeoContent] = useState<SEOContentType | null>(null);
  
  // Load SEO content
  useEffect(() => {
    const savedSeoContent = localStorage.getItem('seoContent');
    if (savedSeoContent) {
      try {
        const parsedContent = JSON.parse(savedSeoContent);
        setSeoContent(parsedContent);
      } catch (e) {
        console.error("Error parsing saved SEO content:", e);
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={seoContent?.title || "Blog-Verwaltung - Rasenpilot Admin"}
        description={seoContent?.description || "Verwalten Sie Ihre Blog-Inhalte und erstellen Sie neue Beiträge"}
        canonical="/blog"
        noindex={true}
      />
      
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Blog-Verwaltung
              </h1>
              <p className="text-gray-600 mt-2">
                Verwalten Sie Ihre Blog-Inhalte und erstellen Sie neue Beiträge
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2"
              >
                Zurück zum Dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => navigate('/blog/new')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                Neuer Blogbeitrag
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <BlogPostList />

          <div className="mt-8 space-y-8">
            <AiBlogGenerator />
            
            <div className="bg-green-50 p-6 rounded-lg border border-green-100">
              <h2 className="text-xl font-semibold text-green-800 mb-3">Blog SEO-Tipps</h2>
              <ul className="space-y-2 text-gray-700">
                <li>• Verwenden Sie Haupt-Keywords im Titel und in den ersten Absätzen</li>
                <li>• Erstellen Sie strukturierte Inhalte mit Überschriften (H2, H3)</li>
                <li>• Fügen Sie relevante interne und externe Links ein</li>
                <li>• Verwenden Sie Bilder mit Alt-Text und beschreibenden Dateinamen</li>
                <li>• Schreiben Sie mindestens 300 Wörter pro Blogbeitrag</li>
                <li>• Optimieren Sie URLs mit sprechenden Slugs</li>
                <li>• Aktualisieren Sie ältere Inhalte regelmäßig</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      
      {/* Hidden SEO content for crawlers */}
      {seoContent && (
        <div className="hidden" aria-hidden="true">
          <div dangerouslySetInnerHTML={{ __html: seoContent.content }} />
        </div>
      )}
    </div>
  );
};

export default Blog;
