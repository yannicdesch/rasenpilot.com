
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Calendar, Share } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';
import { supabase } from '@/lib/supabase';
import RelatedPosts from '@/components/RelatedPosts';
import SEO from '@/components/SEO';

interface BlogPostData {
  id: number;
  title: string;
  slug: string;
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
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        // First try to fetch from Supabase
        const { data: supabasePost, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (supabasePost && !error) {
          // Convert Supabase format to BlogPostData format
          const seoData = supabasePost.seo as any;
          const convertedPost: BlogPostData = {
            id: supabasePost.id,
            title: supabasePost.title,
            slug: supabasePost.slug,
            content: supabasePost.content || '',
            excerpt: supabasePost.excerpt || '',
            date: supabasePost.date,
            author: supabasePost.author,
            category: supabasePost.category,
            readTime: supabasePost.read_time || 5,
            keywords: supabasePost.tags ? supabasePost.tags.split(',').map(tag => tag.trim()) : [],
            metaTitle: seoData?.metaTitle || supabasePost.title,
            metaDescription: seoData?.metaDescription || supabasePost.excerpt || ''
          };
          
          setPost(convertedPost);
          
          // Get related posts from Supabase
          const { data: relatedData } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('category', supabasePost.category)
            .neq('id', supabasePost.id)
            .eq('status', 'published')
            .limit(3);
            
          if (relatedData) {
            const convertedRelated = relatedData.map(relatedPost => {
              const relatedSeoData = relatedPost.seo as any;
              return {
                id: relatedPost.id,
                title: relatedPost.title,
                slug: relatedPost.slug,
                content: relatedPost.content || '',
                excerpt: relatedPost.excerpt || '',
                date: relatedPost.date,
                author: relatedPost.author,
                category: relatedPost.category,
                readTime: relatedPost.read_time || 5,
                keywords: relatedPost.tags ? relatedPost.tags.split(',').map(tag => tag.trim()) : [],
                metaTitle: relatedSeoData?.metaTitle || relatedPost.title,
                metaDescription: relatedSeoData?.metaDescription || relatedPost.excerpt || ''
              };
            });
            setRelatedPosts(convertedRelated);
          }
        } else {
          // Fallback to static data if not found in Supabase
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
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        navigate('/blog-overview');
      }
    };

    fetchPost();
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

  // Transform the content to proper HTML with heading structure and markdown
  const renderContent = () => {
    if (!post.content) return null;
    
    // Split content by paragraphs
    const paragraphs = post.content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      // Check if paragraph is a heading (starts with ###)
      if (paragraph.startsWith('### ')) {
        const heading = paragraph.replace('### ', '');
        return <h3 key={index} className="text-xl font-semibold text-green-700 mt-6 mb-3">{parseInlineMarkdown(heading)}</h3>;
      }
      
      // Check if paragraph is a heading (starts with ##)
      if (paragraph.startsWith('## ')) {
        const heading = paragraph.replace('## ', '');
        return <h2 key={index} className="text-2xl font-bold text-green-800 mt-8 mb-4">{parseInlineMarkdown(heading)}</h2>;
      }
      
      // Check if paragraph is a list item (starts with -)
      if (paragraph.includes('\n- ') || paragraph.startsWith('- ')) {
        const listItems = paragraph.split('\n- ').filter(item => item.trim());
        return (
          <ul key={index} className="mb-4 list-disc list-inside space-y-1">
            {listItems.map((item, listIndex) => (
              <li key={listIndex} className="text-gray-700">
                {parseInlineMarkdown(item.replace(/^- /, '').trim())}
              </li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph
      return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{parseInlineMarkdown(paragraph)}</p>;
    });
  };

  // Helper function to parse inline markdown (bold, italic, links)
  const parseInlineMarkdown = (text: string) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Find bold text (**text**)
      const boldMatch = remaining.match(/\*\*(.*?)\*\*/);
      if (boldMatch) {
        const beforeBold = remaining.substring(0, boldMatch.index);
        if (beforeBold) {
          parts.push(<span key={key++}>{beforeBold}</span>);
        }
        parts.push(<strong key={key++} className="font-semibold text-green-800">{boldMatch[1]}</strong>);
        remaining = remaining.substring(boldMatch.index! + boldMatch[0].length);
        continue;
      }

      // Find italic text (*text*)
      const italicMatch = remaining.match(/\*(.*?)\*/);
      if (italicMatch) {
        const beforeItalic = remaining.substring(0, italicMatch.index);
        if (beforeItalic) {
          parts.push(<span key={key++}>{beforeItalic}</span>);
        }
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch.index! + italicMatch[0].length);
        continue;
      }

      // No more markdown found, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      <SEO 
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
        canonical={`https://www.rasenpilot.com/blog/${post.slug}`}
        keywords={post.keywords.join(',')}
        type="article"
        author={post.author}
        datePublished={new Date(post.date).toISOString()}
        dateModified={new Date(post.date).toISOString()}
        structuredData={{
          type: 'Article',
          data: {
            headline: post.title,
            description: post.excerpt,
            author: {
              "@type": "Person",
              name: post.author
            },
            publisher: {
              "@type": "Organization",
              name: "Rasenpilot",
              logo: {
                "@type": "ImageObject",
                url: "https://rasenpilot.com/logo.png"
              }
            },
            datePublished: new Date(post.date).toISOString(),
            dateModified: new Date(post.date).toISOString(),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://rasenpilot.com/blog/${post.slug}`
            },
            keywords: post.keywords.join(', '),
            articleSection: getCategoryName(post.category),
            inLanguage: "de-DE"
          }
        }}
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
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap gap-3 mb-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {getCategoryName(post.category)}
              </Badge>
              
              <div className="text-sm text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <time dateTime={new Date(post.date).toISOString()}>{post.date}</time>
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
            onClick={() => navigate('/lawn-analysis')} 
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
