
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import BlogPostEditor from '@/components/BlogPostEditor';
import { Helmet } from 'react-helmet-async';

const NewBlogPost = () => {
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
      <Helmet>
        <title>Neuen Blogbeitrag erstellen - Rasenpilot</title>
        <meta name="description" content="Erstellen Sie SEO-optimierte Inhalte für Ihre Rasenpilot Website" />
        <meta name="robots" content="noindex, nofollow" /> {/* Don't index editor pages */}
        <link rel="canonical" href="https://rasenpilot.de/blog" /> {/* Canonical to blog listing */}
      </Helmet>
      
      <MainNavigation />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-green-800 flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Neuen Blogbeitrag erstellen
            </h1>
            <p className="text-gray-600 mt-2">
              Erstellen Sie SEO-optimierte Inhalte für Ihre Website
            </p>
          </div>

          <BlogPostEditor />
        </div>
      </main>
    </div>
  );
};

export default NewBlogPost;
