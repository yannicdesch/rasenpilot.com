import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar, Tag, Share } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import RelatedPosts from '@/components/RelatedPosts';
import SEO from '@/components/SEO';

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
  image: string;
  content: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  readTime: number;
  keywords: string[];
  metaTitle: string;
  metaDescription: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPostData | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>([]);
  
  useEffect(() => {
    if (!slug) return;
    
    const foundPost = blogPosts.find(p => p.slug === slug);
    
    if (foundPost) {
      setPost(foundPost);
      
      // Get related posts (same category, excluding current post)
      const related = blogPosts
        .filter(p => p.category === foundPost.category && p.id !== foundPost.id)
        .slice(0, 3);
      
      setRelatedPosts(related);
    } else {
      navigate('/blog-overview');
    }
  }, [slug, navigate]);
  
  if (!post) {
    return <div className="min-h-screen flex items-center justify-center">Lade Blogbeitrag...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/blog-overview')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </Button>
        
        <article className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <img 
            src={post.image} 
            alt={post.title} 
            className="w-full h-72 object-cover"
          />
          
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {post.category === 'mowing' ? 'Rasenmähen' : 
                 post.category === 'fertilizing' ? 'Rasendüngen' : 
                 post.category === 'watering' ? 'Bewässerung' : 
                 post.category === 'problems' ? 'Rasenprobleme' : 
                 post.category === 'seasonal' ? 'Saisonale Pflege' : post.category}
              </Badge>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {post.date}
              </div>
              
              <div className="text-sm text-gray-500">
                {post.readTime} Min. Lesezeit
              </div>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
            
            <p className="text-gray-600 text-lg italic mb-6">
              {post.excerpt}
            </p>
            
            <div className="prose max-w-none">
              {post.content.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4">{paragraph}</p>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-6">
              <div className="flex flex-wrap gap-2">
                <span className="text-gray-700 font-medium mr-2">Tags:</span>
                {post.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="bg-gray-100">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-700 font-medium">Autor: {post.author}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Share className="h-4 w-4 mr-1" /> Teilen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </article>
        
        {relatedPosts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-green-800 mb-6">Das könnte Sie auch interessieren</h2>
            <RelatedPosts posts={relatedPosts} />
          </div>
        )}
        
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

export default BlogPost;
