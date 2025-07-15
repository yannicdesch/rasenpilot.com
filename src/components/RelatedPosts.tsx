
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BlogPost } from '../data/blogPosts';

interface RelatedPostsProps {
  posts: BlogPost[];
}

const RelatedPosts: React.FC<RelatedPostsProps> = ({ posts }) => {
  const navigate = useNavigate();
  
  const handlePostClick = (slug: string) => {
    navigate(`/blog/${slug}`);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handlePostClick(post.slug)}
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{post.title}</h3>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{post.readTime} Min. Lesezeit</span>
              <span className="text-green-600 flex items-center font-medium">
                Lesen <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RelatedPosts;
