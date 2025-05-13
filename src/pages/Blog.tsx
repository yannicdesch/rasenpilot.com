
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import BlogPostList from '@/components/BlogPostList';

const Blog = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useLawn();
  
  // Redirect to auth page if not logged in
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
                <FileText className="h-8 w-8" />
                Rasen-Blog verwalten
              </h1>
              <p className="text-gray-600 mt-2">
                Erstellen und verwalten Sie SEO-optimierte Blog-Beiträge für bessere Sichtbarkeit
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

          <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-100">
            <h2 className="text-xl font-semibold text-green-800 mb-3">Blog SEO-Tipps</h2>
            <ul className="space-y-2 text-gray-700">
              <li>• Verwenden Sie Haupt-Keywords im Titel und in den ersten Absätzen</li>
              <li>• Erstellen Sie strukturierte Inhalte mit Überschriften (H2, H3)</li>
              <li>• Fügen Sie relevante interne und externe Links ein</li>
              <li>• Verwenden Sie Bilder mit Alt-Text und beschreibenden Dateinamen</li>
              <li>• Schreiben Sie mindestens 300 Wörter pro Blogbeitrag</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Blog;
