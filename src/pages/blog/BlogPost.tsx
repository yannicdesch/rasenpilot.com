
import React from 'react';
import { useParams } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <div className="min-h-screen bg-gray-50">
      <MainNavigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-green-800 mb-6">Blog Post: {slug}</h1>
        <p className="text-gray-600">Blog post content coming soon.</p>
      </div>
    </div>
  );
};

export default BlogPost;
