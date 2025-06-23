
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainNavigation from '@/components/MainNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
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
        .order('date', { ascending: false })
        .limit(6);

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
      title: "When to Fertilize Your Lawn in Spring",
      excerpt: "Learn the optimal timing for spring fertilization to get your lawn ready for the growing season.",
      image: "/placeholder.svg",
      author: "Lawn Expert",
      date: "2024-03-15",
      slug: "spring-fertilization-timing",
      read_time: 5
    },
    {
      id: 2,
      title: "Identifying Common Lawn Diseases",
      excerpt: "Spot the signs of common lawn diseases early and learn how to treat them effectively.",
      image: "/placeholder.svg",
      author: "Plant Pathologist",
      date: "2024-03-10",
      slug: "common-lawn-diseases",
      read_time: 7
    },
    {
      id: 3,
      title: "The Complete Guide to Overseeding",
      excerpt: "Transform thin, patchy grass into a thick, lush lawn with our comprehensive overseeding guide.",
      image: "/placeholder.svg",
      author: "Turf Specialist",
      date: "2024-03-05",
      slug: "overseeding-guide",
      read_time: 10
    }
  ];

  const posts = blogPosts.length > 0 ? blogPosts : defaultPosts;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <MainNavigation />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading blog posts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <MainNavigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              Lawn Care Blog
            </h1>
            <p className="text-xl text-gray-600">
              Expert tips and guides for a healthier, greener lawn
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow">
                <div className="aspect-video bg-gray-200 rounded-t-lg overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {post.read_time} min read
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-green-600 hover:text-green-700"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center bg-green-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-green-800 mb-4">
              Ready to Improve Your Lawn?
            </h2>
            <p className="text-gray-600 mb-6">
              Start with a free AI analysis of your lawn today
            </p>
            <Button 
              onClick={() => navigate('/lawn-analysis')}
              className="bg-green-600 hover:bg-green-700"
            >
              Analyze Your Lawn
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogOverview;
