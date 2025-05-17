
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar, Share } from 'lucide-react';
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
  
  // Format the category name for display
  const getCategoryName = (category: string) => {
    switch(category) {
      case 'mowing': return 'Rasenmähen';
      case 'fertilizing': return 'Rasendüngen';
      case 'watering': return 'Bewässerung';
      case 'problems': return 'Rasenprobleme';
      case 'seasonal': return 'Saisonale Pflege';
      case 'Rasenneuanlage': return 'Rasenneuanlage';
      case 'Rasenplanung': return 'Rasenplanung';
      case 'Rasenrenovierung': return 'Rasenrenovierung';
      case 'Rasenpflege': return 'Rasenpflege';
      default: return category;
    }
  };

  // Transform the content to proper HTML with heading structure
  const renderContent = () => {
    if (!post.content) return null;
    
    // Split content by paragraphs
    const paragraphs = post.content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a heading (starts with ###)
      if (paragraph.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-semibold text-green-700 mt-6 mb-3">{paragraph.replace('### ', '')}</h3>;
      }
      
      // Check if paragraph is a heading (starts with ##)
      if (paragraph.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-bold text-green-800 mt-8 mb-4">{paragraph.replace('## ', '')}</h2>;
      }
      
      // Regular paragraph
      return <p key={index} className="mb-4">{paragraph}</p>;
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        canonical={`/blog/${post.slug}`}
        keywords={post.keywords.join(',')}
        ogImage={post.image}
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
                {getCategoryName(post.category)}
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
              {renderContent()}
            </div>
            
            <div className="border-t border-gray-200 mt-8 pt-6">
              <h2 className="text-lg font-medium text-green-800 mb-2">Themen in diesem Artikel</h2>
              <div className="flex flex-wrap gap-2">
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
          <section aria-labelledby="related-posts-heading" className="mt-12">
            <h2 id="related-posts-heading" className="text-2xl font-bold text-green-800 mb-6">Das könnte Sie auch interessieren</h2>
            <RelatedPosts posts={relatedPosts} />
          </section>
        )}
        
        <section aria-labelledby="cta-heading" className="mt-16 bg-green-50 rounded-lg p-6 border border-green-100">
          <h2 id="cta-heading" className="text-2xl font-bold text-green-800 mb-4">Erhalten Sie personalisierte Rasenberatung</h2>
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
        </section>
      </div>
    </div>
  );
};

export default BlogPost;
