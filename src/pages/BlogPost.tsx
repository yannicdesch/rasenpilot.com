
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
  image?: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  // Initialize synchronously from static data so content is in DOM immediately for SEO crawlers
  const getInitialPost = (): BlogPostData | null => {
    if (!slug) return null;
    return blogPosts.find(p => p.slug === slug) || null;
  };
  
  const getInitialRelated = (currentPost: BlogPostData | null): BlogPostData[] => {
    if (!currentPost) return [];
    return blogPosts
      .filter(p => p.category === currentPost.category && p.id !== currentPost.id)
      .slice(0, 3);
  };
  
  const initialPost = getInitialPost();
  const [post, setPost] = useState<BlogPostData | null>(initialPost);
  const [relatedPosts, setRelatedPosts] = useState<BlogPostData[]>(getInitialRelated(initialPost));
  
  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        // Try to fetch from Supabase for latest version
        const { data: supabasePost, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (supabasePost && !error) {
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
        } else if (!post) {
          // No static data and no Supabase data — redirect
          navigate('/blog-overview');
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        if (!post) {
          navigate('/blog-overview');
        }
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

  // Add internal links for key terms
  const addInternalLinks = (text: string): string => {
    return text
      .replace(/(?<!\[)Rasenanalyse(?!\])/g, '[Rasenanalyse](/lawn-analysis)')
      .replace(/(?<!\[)Lawn Score(?!\])/g, '[Lawn Score](/lawn-analysis)')
      .replace(/(?<!\[)kostenlose Analyse(?!\])/g, '[kostenlose Analyse](/lawn-analysis)')
      .replace(/(?<!\[)KI-Analyse(?!\])/g, '[KI-Analyse](/lawn-analysis)');
  };

  // Transform the content to proper HTML with heading structure and markdown
  const renderContent = () => {
    if (!post.content) return null;
    
    // Split content by paragraphs
    const paragraphs = post.content.split('\n\n');
    
    return paragraphs.map((paragraph, index) => {
      const enriched = addInternalLinks(paragraph);
      
      // Check if paragraph is a heading (starts with ###)
      if (enriched.startsWith('### ')) {
        const heading = enriched.replace('### ', '');
        return <h3 key={index} className="text-xl font-semibold text-green-700 mt-6 mb-3">{parseInlineMarkdown(heading)}</h3>;
      }
      
      // Check if paragraph is a heading (starts with ##)
      if (enriched.startsWith('## ')) {
        const heading = enriched.replace('## ', '');
        return <h2 key={index} className="text-2xl font-bold text-green-800 mt-8 mb-4">{parseInlineMarkdown(heading)}</h2>;
      }
      
      // Check if paragraph is a list item (starts with -)
      if (enriched.includes('\n- ') || enriched.startsWith('- ')) {
        const listItems = enriched.split('\n- ').filter(item => item.trim());
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
      return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{parseInlineMarkdown(enriched)}</p>;
    });
  };

  // Enhanced link parser for internal links
  const parseInlineMarkdown = (text: string) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // Find internal links [text](url) or [text](#)
      const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const beforeLink = remaining.substring(0, linkMatch.index);
        if (beforeLink) {
          parts.push(<span key={key++}>{beforeLink}</span>);
        }
        
        const linkText = linkMatch[1];
        let linkUrl = linkMatch[2];
        
        // Fix broken # links by generating proper URLs
        if (linkUrl === '#' || linkUrl === '') {
          linkUrl = generateLinkFromText(linkText);
        }
        
        // Check if it's an internal link
        if (linkUrl.startsWith('/') || linkUrl.startsWith('#')) {
          parts.push(
            <a 
              key={key++} 
              href={linkUrl}
              onClick={(e) => {
                if (linkUrl.startsWith('/blog/')) {
                  e.preventDefault();
                  navigate(linkUrl);
                }
              }}
              className="text-green-600 hover:text-green-800 underline font-medium transition-colors"
            >
              {linkText}
            </a>
          );
        } else {
          // External link
          parts.push(
            <a 
              key={key++} 
              href={linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {linkText}
            </a>
          );
        }
        
        remaining = remaining.substring(linkMatch.index! + linkMatch[0].length);
        continue;
      }
      
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
        parts.push(<em key={key++} className="italic text-gray-700">{italicMatch[1]}</em>);
        remaining = remaining.substring(italicMatch.index! + italicMatch[0].length);
        continue;
      }

      // No more markdown found, add remaining text
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }

    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  // Generate proper URLs from link text
  const generateLinkFromText = (text: string): string => {
    const linkMap: { [key: string]: string } = {
      'rasen richtig kalken': '/blog/moos-im-rasen-bekaempfen-natuerliche-methoden',
      'bodenverdichtung lösen': '/blog/rasen-vertikutieren-leitfaden-hobbygaertner',
      'rasen düngen': '/blog/rasen-duengen-fruehling-zeitpunkt-technik',
      'moos im rasen entfernen': '/blog/moos-im-rasen-bekaempfen-natuerliche-methoden',
      'rasenpflege frühjahr': '/blog/rasenrenovierung-fruehling-anleitung',
      'vertikutieren anleitung': '/blog/rasen-vertikutieren-leitfaden-hobbygaertner',
      'rasenmähen tipps': '/blog/perfekter-maehrhythmus-rasen',
      'unkraut bekämpfen': '/blog/rasenprobleme-diagnostizieren-krankheiten-behandlung',
      'kostenlose rasenanalyse': '/lawn-analysis',
      'bewässerung': '/blog/rasenbewaesserung-hochsommer-hitze',
      'rasendünger': '/blog/beste-rasenduenger-test-organisch-mineralisch',
    };

    // Find matching link by text similarity
    const lowerText = text.toLowerCase();
    for (const [key, url] of Object.entries(linkMap)) {
      if (lowerText.includes(key) || key.includes(lowerText)) {
        return url;
      }
    }
    
    // Default fallback
    return '/blog-overview';
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <SEO 
        title={`${post.title} | Rasenpilot`}
        description={post.metaDescription?.substring(0, 160) || post.excerpt?.substring(0, 160)}
        canonical={`https://www.rasenpilot.com/blog/${post.slug}`}
        keywords={post.keywords.join(',')}
        type="article"
        author={post.author}
        datePublished={new Date(post.date).toISOString()}
        dateModified={new Date(post.date).toISOString()}
        structuredData={{
          type: 'Article',
          data: {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.metaDescription || post.excerpt,
            image: post.image || "https://www.rasenpilot.com/og-image.png",
            author: {
              "@type": "Person",
              name: post.author
            },
            publisher: {
              "@type": "Organization",
              name: "Rasenpilot",
              logo: {
                "@type": "ImageObject",
                url: "https://www.rasenpilot.com/logo.png"
              }
            },
            datePublished: new Date(post.date).toISOString(),
            dateModified: new Date(post.date).toISOString(),
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `https://www.rasenpilot.com/blog/${post.slug}`
            },
            keywords: post.keywords.join(', '),
            articleSection: getCategoryName(post.category),
            inLanguage: "de-DE",
            wordCount: post.content?.split(/\s+/).length || 0
          }
        }}
      />
      
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button 
          variant="outline" 
          onClick={() => navigate('/blog-overview')}
          className="mb-8 flex items-center gap-2 hover:bg-green-50 border-green-200"
        >
          <ArrowLeft className="h-4 w-4" /> Zurück zur Übersicht
        </Button>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Article */}
          <article className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-green-100 overflow-hidden">
              {/* Article Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white">
                <div className="flex flex-wrap gap-3 mb-4">
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                    {getCategoryName(post.category)}
                  </Badge>
                  
                  <div className="text-green-100 flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <time dateTime={new Date(post.date).toISOString()}>
                      {new Date(post.date).toLocaleDateString('de-DE')}
                    </time>
                  </div>
                  
                  <div className="text-green-100 flex items-center gap-1">
                    📖 {post.readTime} Min. Lesezeit
                  </div>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                  {post.title}
                </h1>
                
                <p className="text-green-100 text-lg mt-4 leading-relaxed">
                  {post.excerpt}
                </p>
              </div>
              
              {/* Hero Image */}
              {post.image && (
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-64 md:h-80 object-cover"
                  loading="lazy"
                />
              )}
              
              {/* Article Content */}
              <div className="p-6 md:p-8 lg:p-10">
                <div className="prose prose-lg max-w-none prose-green 
                  prose-headings:text-green-800 
                  prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-8 prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-6 prose-h3:mb-3
                  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                  prose-li:text-gray-700 prose-li:mb-1
                  prose-strong:text-green-800 prose-strong:font-semibold
                  prose-a:text-green-600 prose-a:no-underline hover:prose-a:text-green-800
                  prose-ul:space-y-2 prose-ol:space-y-2">
                  {renderContent()}
                </div>

                {/* CTA Section */}
                <div className="mt-10 p-6 md:p-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="text-center">
                    <p className="text-2xl mb-2">🌱</p>
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      Tipp: Lass deine KI den Zustand deines Rasens analysieren!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Foto hochladen → Sofort wissen was dein Rasen braucht.
                    </p>
                    <Button 
                      onClick={() => navigate('/lawn-analysis')}
                      size="lg"
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      Jetzt kostenlos analysieren
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </div>
                </div>
                
                {/* Keywords Section */}
                <div className="border-t border-green-100 mt-10 pt-8">
                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                    🏷️ Themen in diesem Artikel
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.keywords.map((keyword, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Author & Share Section */}
                <div className="border-t border-green-100 mt-8 pt-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{post.author}</p>
                        <p className="text-sm text-gray-500">Rasenpflege-Experte</p>
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline" className="border-green-200 hover:bg-green-50">
                      <Share className="h-4 w-4 mr-2" /> Artikel teilen
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
          
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* CTA Card */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-3">🎯 Kostenlose Rasenanalyse</h3>
              <p className="text-green-100 mb-4 text-sm">
                Lass deinen Rasen von unserer KI analysieren und erhalte einen personalisierten Pflegeplan.
              </p>
              <Button 
                onClick={() => navigate('/lawn-analysis')} 
                className="w-full bg-white text-green-600 hover:bg-green-50 font-semibold"
              >
                Jetzt kostenlos starten
              </Button>
            </div>
            
            {/* Related Articles Preview */}
            {relatedPosts.length > 0 && (
              <div className="bg-white rounded-xl border border-green-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-4">📚 Verwandte Artikel</h3>
                <div className="space-y-3">
                  {relatedPosts.slice(0, 3).map((relatedPost) => (
                    <a 
                      key={relatedPost.id}
                      href={`/blog/${relatedPost.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/blog/${relatedPost.slug}`);
                      }}
                      className="block p-3 rounded-lg hover:bg-green-50 transition-colors border border-green-100"
                    >
                      <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                        {relatedPost.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {relatedPost.readTime} Min. • {getCategoryName(relatedPost.category)}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
        
        {/* Full Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">
              Das könnte dich auch interessieren
            </h2>
            <RelatedPosts posts={relatedPosts} />
          </section>
        )}
      </div>
    </div>
  );
};

export default BlogPost;
