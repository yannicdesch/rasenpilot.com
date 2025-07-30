import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User, Leaf, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import SEO from '@/components/SEO';
import MainNavigation from '@/components/MainNavigation';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  slug: string;
  read_time: number;
}

const BlogOverview = () => {
  const navigate = useNavigate();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blog posts:', error);
      } else {
        setBlogPosts(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultPosts = [
    {
      id: 1,
      title: "Rasen nachsäen: Die ultimative Anleitung für perfekte Ergebnisse",
      excerpt: "Einen perfekten Rasen nachzusäen zu pflegen erfordert Wissen und Konsequenz. Diese professionellen Tipps helfen Ihnen dabei.",
      author: "Yannic",
      date: "2025-07-15",
      slug: "rasen-nachsaen-ultimate-anleitung",
      read_time: 6
    },
    {
      id: 2,
      title: "Profi-Tipps für Rasenkrankheiten erkennen - So machen Sie es richtig",
      excerpt: "Rasenkrankheiten erkennen ist ein wichtiger Bestandteil jedes schönen Gartens. Hier sind die besten Methoden, um optimale...",
      author: "Lars",
      date: "2025-07-15",
      slug: "rasenkrankheiten-erkennen-profi-tipps",
      read_time: 6
    },
    {
      id: 3,
      title: "Profi Rasenpflege: Die ultimative Anleitung für perfekte Ergebnisse",
      excerpt: "Ein gesunder Profi Rasenpflege ist der Traum vieler Gartenbesitzer. In diesem Blogbeitrag erfahren Sie die wichtigsten...",
      author: "Lars",
      date: "2025-07-15",
      slug: "profi-rasenpflege-ultimative-anleitung",
      read_time: 6
    }
  ];

  const posts = blogPosts.length > 0 ? blogPosts : defaultPosts;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">Rasenpilot</span>
              </div>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Startseite
              </Button>
            </nav>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Blog-Artikel werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Rasenpflege Ratgeber - Expertentipps & Anleitungen | Rasenpilot Blog"
        description="Entdecken Sie umfassende Ratgeber zur Rasenpflege. Von der Rasensaat bis zur Krankheitsbekämpfung - Expertentipps für den perfekten Rasen das ganze Jahr über."
        canonical="/blog-overview"
        keywords="Rasenpflege Ratgeber, Rasen Tipps, Rasenpflege Anleitung, Rasen düngen, Rasen mähen, Rasenkrankheiten, Gartenpflege Blog"
        structuredData={{
          type: "WebSite",
          data: {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Rasenpilot Blog",
            "description": "Expertentipps und Anleitungen für eine perfekte Rasenpflege",
            "url": "https://rasenpilot.com/blog-overview",
            "publisher": {
              "@type": "Organization",
              "name": "Rasenpilot",
              "url": "https://rasenpilot.com"
            }
          }
        }}
      />
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-foreground mb-6">
              Rasenpflege Ratgeber
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Expertentipps und Anleitungen für einen gesünderen, grüneren Rasen
            </p>
          </div>

          {/* Blog Posts List */}
          <div className="space-y-8">
            {posts.map((post, index) => (
              <article 
                key={post.id} 
                className="group border-b border-border pb-8 last:border-b-0 cursor-pointer hover:bg-muted/50 -mx-6 px-6 py-6 rounded-lg transition-all duration-200"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{post.read_time} Min. Lesezeit</span>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-muted-foreground/30">
                    {String(index + 1).padStart(2, '0')}
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-muted-foreground mb-4 line-clamp-3 text-lg leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                  >
                    Artikel lesen
                    <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 text-center bg-card border rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Bereit, Ihren Rasen zu verbessern?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-2xl mx-auto">
              Starten Sie noch heute mit einer kostenlosen KI-Analyse Ihres Rasens und erhalten Sie personalisierte Empfehlungen
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 h-auto"
            >
              Rasen analysieren lassen
              <ArrowRight className="h-5 w-5 ml-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogOverview;
