
import React from 'react';
import MainNavigation from '@/components/MainNavigation';
import { FileText } from 'lucide-react';
import BlogPostEditor from '@/components/BlogPostEditor';
import { Helmet } from 'react-helmet-async';

const NewBlogPost = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <Helmet>
        <title>Neuen Blogbeitrag erstellen - Rasenpilot Admin</title>
        <meta name="description" content="Erstellen Sie SEO-optimierte Inhalte für Ihre Rasenpilot Website" />
        <meta name="robots" content="noindex, nofollow" />
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
