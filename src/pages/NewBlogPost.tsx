
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLawn } from '@/context/LawnContext';
import BlogPostEditor from '@/components/BlogPostEditor';

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
