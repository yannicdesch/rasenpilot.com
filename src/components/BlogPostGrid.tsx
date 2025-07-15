
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Tag } from 'lucide-react';
import { blogPosts } from '../data/blogPosts';

interface BlogPostGridProps {
  searchTerm: string;
  categoryFilter: string;
}

const BlogPostGrid: React.FC<BlogPostGridProps> = ({ searchTerm, categoryFilter }) => {
  const navigate = useNavigate();
  
  // Filter blog posts based on search term and category
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };
  
  return (
    <div>
      {filteredPosts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Keine Blogbeiträge gefunden. Bitte passen Sie Ihre Suche an.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <div 
              key={post.id} 
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handlePostClick(post.slug)}
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {post.category === 'mowing' ? 'Rasenmähen' : 
                     post.category === 'fertilizing' ? 'Rasendüngen' : 
                     post.category === 'watering' ? 'Bewässerung' : 
                     post.category === 'problems' ? 'Rasenprobleme' : 
                     post.category === 'seasonal' ? 'Saisonale Pflege' : post.category}
                  </Badge>
                  
                  <div className="text-xs text-gray-500 flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {post.date}
                  </div>
                </div>
                
                <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{post.title}</h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">{post.readTime} Min. Lesezeit</div>
                  <div className="text-green-600 flex items-center text-sm font-medium">
                    Weiterlesen <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogPostGrid;
