import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  image?: string;
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
        const posts = data || [];
        setBlogPosts(posts);
        setLoading(false);
        
        // Generate images in background without blocking UI
        posts.forEach(async (post) => {
          if ((!post.image || post.image === '/placeholder.svg') && post.title && post.slug) {
            console.log('Generating image for post:', post.title);
            try {
              await supabase.functions.invoke('generate-blog-image', {
                body: { title: post.title, slug: post.slug }
              });
            } catch (err) {
              console.error('Error generating image for post:', post.slug, err);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
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
      read_time: 6,
      image: undefined
    },
    {
      id: 2,
      title: "Profi-Tipps für Rasenkrankheiten erkennen - So machen Sie es richtig",
      excerpt: "Rasenkrankheiten erkennen ist ein wichtiger Bestandteil jedes schönen Gartens. Hier sind die besten Methoden, um optimale...",
      author: "Lars",
      date: "2025-07-15",
      slug: "rasenkrankheiten-erkennen-profi-tipps",
      read_time: 6,
      image: undefined
    },
    {
      id: 3,
      title: "Profi Rasenpflege: Die ultimative Anleitung für perfekte Ergebnisse",
      excerpt: "Ein gesunder Profi Rasenpflege ist der Traum vieler Gartenbesitzer. In diesem Blogbeitrag erfahren Sie die wichtigsten...",
      author: "Lars",
      date: "2025-07-15",
      slug: "profi-rasenpflege-ultimative-anleitung",
      read_time: 6,
      image: undefined
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
    <div className="min-h-screen bg-gradient-to-b from-green-50/30 via-white to-green-50/30">
      <SEO 
        title="Rasenpflege Ratgeber - Expertentipps & Anleitungen | Rasenpilot Blog"
        description="Entdecken Sie umfassende Ratgeber zur Rasenpflege. Von der Rasensaat bis zur Krankheitsbekämpfung - Expertentipps für den perfekten Rasen das ganze Jahr über."
        canonical="https://www.rasenpilot.com/blog-overview"
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
      
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMC00YzUuNTIzIDAgMTAgNC40NzcgMTAgMTBzLTQuNDc3IDEwLTEwIDEwLTEwLTQuNDc3LTEwLTEwIDQuNDc3LTEwIDEwLTEweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-white/20">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-medium">Expertenwissen</span>
            </div>
            <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Rasenpflege<br />Ratgeber
            </h1>
            <p className="text-xl md:text-2xl text-green-50 max-w-2xl mx-auto leading-relaxed font-light">
              Entdecken Sie professionelle Tipps und bewährte Methoden für einen gesunden, grünen Traumrasen
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Featured Post */}
          {posts.length > 0 && (
            <article 
              className="group relative mb-16 overflow-hidden rounded-2xl bg-white shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer"
              onClick={() => navigate(`/blog/${posts[0].slug}`)}
            >
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-80 md:h-auto bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center overflow-hidden">
                  {posts[0].image ? (
                    <img 
                      src={posts[0].image} 
                      alt={posts[0].title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-white/20 text-9xl font-bold">01</div>
                  )}
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 border-0">
                      Neu
                    </Badge>
                  </div>
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{posts[0].author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(posts[0].date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <span>{posts[0].read_time} Min.</span>
                  </div>
                  <h2 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors">
                    {posts[0].title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    {posts[0].excerpt}
                  </p>
                  <Button 
                    variant="default" 
                    size="lg"
                    className="w-fit"
                  >
                    Artikel lesen
                    <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </article>
          )}

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.slice(1).map((post, index) => (
              <article 
                key={post.id} 
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/blog/${post.slug}`)}
              >
                <div className="relative h-48 bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center overflow-hidden">
                  {post.image ? (
                    <img 
                      src={post.image} 
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMC00YzUuNTIzIDAgMTAgNC40NzcgMTAgMTBzLTQuNDc3IDEwLTEwIDEwLTEwLTQuNDc3LTEwLTEwIDQuNDc3LTEwIDEwLTEweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMSIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
                      <div className="relative text-white/20 text-7xl font-bold group-hover:scale-110 transition-transform">
                        {String(index + 2).padStart(2, '0')}
                      </div>
                    </>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(post.date).toLocaleDateString('de-DE')}</span>
                    </div>
                    <span>•</span>
                    <span>{post.read_time} Min.</span>
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center text-primary font-medium text-sm group-hover:gap-2 transition-all">
                    Weiterlesen
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 text-white p-12 md:p-16 shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnptMC00YzUuNTIzIDAgMTAgNC40NzcgMTAgMTBzLTQuNDc3IDEwLTEwIDEwLTEwLTQuNDc3LTEwLTEwIDQuNDc3LTEwIDEwLTEweiIgZmlsbD0iI2ZmZiIgZmlsbC1vcGFjaXR5PSIuMDUiLz48L2c+PC9zdmc+')] opacity-20"></div>
            <div className="relative text-center max-w-3xl mx-auto">
              <h2 className="font-playfair text-4xl md:text-5xl font-bold mb-6">
                Bereit für Ihren Traumrasen?
              </h2>
              <p className="text-green-50 mb-8 text-lg md:text-xl leading-relaxed">
                Starten Sie noch heute mit einer kostenlosen KI-gestützten Rasenanalyse und erhalten Sie einen personalisierten Pflegeplan
              </p>
              <Button 
                onClick={() => navigate('/lawn-analysis')}
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50 text-lg px-10 py-7 h-auto shadow-xl hover:shadow-2xl transition-all"
              >
                Kostenlose Analyse starten
                <ArrowRight className="h-5 w-5 ml-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogOverview;
