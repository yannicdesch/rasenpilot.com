
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '@/components/ContentCard';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

type BlogPost = {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: number;
  tags: string[];
  date: string;
};

// Sample blog posts data - in a real app, this would come from a database
const sampleBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Die beste Zeit zum Rasenmähen: Morgens oder abends?',
    excerpt: 'Erfahren Sie, wann die optimale Tageszeit für das Mähen Ihres Rasens ist und welche Faktoren Sie berücksichtigen sollten.',
    image: '/placeholder.svg',
    category: 'Rasenpflege',
    readTime: 4,
    tags: ['Rasenmähen', 'Pflegetipps', 'Rasengesundheit'],
    date: '2025-05-10'
  },
  {
    id: 2,
    title: 'Natürliche Düngemittel für einen gesunden und umweltfreundlichen Rasen',
    excerpt: 'Entdecken Sie umweltfreundliche Alternativen zu chemischen Düngemitteln, die Ihren Rasen auf natürliche Weise nähren.',
    image: '/placeholder.svg',
    category: 'Düngemittel',
    readTime: 6,
    tags: ['Naturdünger', 'Umweltfreundlich', 'Gesunder Rasen'],
    date: '2025-05-05'
  },
  {
    id: 3,
    title: 'Wie bekämpft man Moos im Rasen? Die 5 besten Methoden',
    excerpt: 'Moos kann ein hartnäckiges Problem sein. Hier sind die effektivsten Methoden, um es zu bekämpfen und einen gesunden Rasen zu fördern.',
    image: '/placeholder.svg',
    category: 'Probleme',
    readTime: 5,
    tags: ['Moosbekämpfung', 'Rasenprobleme', 'Rasenpflege'],
    date: '2025-04-28'
  }
];

const BlogPostList: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you would fetch from an API
    // For now, we'll use our sample data
    setPosts(sampleBlogPosts);

    // Try to load saved blog posts from localStorage
    const savedPosts = localStorage.getItem('blogPosts');
    if (savedPosts) {
      try {
        const parsedPosts = JSON.parse(savedPosts);
        // Combine sample posts with saved posts
        setPosts([...parsedPosts, ...sampleBlogPosts]);
      } catch (e) {
        console.error('Error parsing saved blog posts:', e);
      }
    }
  }, []);

  // Calculate pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleEditPost = (id: number) => {
    navigate(`/blog/edit/${id}`);
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Noch keine Blogbeiträge vorhanden.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentPosts.map((post) => (
          <div key={post.id} onClick={() => handleEditPost(post.id)} className="cursor-pointer">
            <ContentCard
              id={post.id}
              title={post.title}
              excerpt={post.excerpt}
              image={post.image}
              category={post.category}
              readTime={post.readTime}
              tags={post.tags}
            />
          </div>
        ))}
      </div>
      
      {posts.length > postsPerPage && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink 
                  onClick={() => setCurrentPage(index + 1)}
                  isActive={currentPage === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default BlogPostList;
