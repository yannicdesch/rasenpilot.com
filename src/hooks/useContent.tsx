
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  image?: string;
  category: string;
  readTime?: number;
  tags?: string;
  date: string;
  author: string;
  status: 'published' | 'draft';
  views?: number;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Page {
  id: number;
  title: string;
  path: string;
  content?: string;
  lastUpdated: string;
  meta?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const useContent = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching blog posts:', fetchError);
        throw fetchError;
      }

      // Transform data to match BlogPost interface
      const transformedPosts: BlogPost[] = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || undefined,
        content: post.content || undefined,
        image: post.image || '/placeholder.svg',
        category: post.category,
        readTime: post.read_time || 5,
        tags: post.tags || undefined,
        date: post.date,
        author: post.author,
        status: (post.status === 'published' || post.status === 'draft') ? post.status : 'draft',
        views: post.views || 0,
        seo: post.seo ? {
          metaTitle: (post.seo as any)?.metaTitle || '',
          metaDescription: (post.seo as any)?.metaDescription || '',
          keywords: (post.seo as any)?.keywords || ''
        } : undefined,
        createdAt: post.created_at,
        updatedAt: post.updated_at
      }));

      setBlogPosts(transformedPosts);
    } catch (err: any) {
      console.error('Error in fetchBlogPosts:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching pages:', fetchError);
        throw fetchError;
      }

      // Transform data to match Page interface
      const transformedPages: Page[] = (data || []).map(page => ({
        id: page.id,
        title: page.title,
        path: page.path,
        content: page.content || undefined,
        lastUpdated: page.last_updated,
        meta: page.meta ? {
          title: (page.meta as any)?.title || '',
          description: (page.meta as any)?.description || '',
          keywords: (page.meta as any)?.keywords || ''
        } : undefined,
        createdAt: page.created_at,
        updatedAt: page.updated_at
      }));

      setPages(transformedPages);
    } catch (err: any) {
      console.error('Error in fetchPages:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addBlogPost = async (postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'views'>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          title: postData.title,
          slug: postData.slug,
          excerpt: postData.excerpt,
          content: postData.content,
          image: postData.image || '/placeholder.svg',
          category: postData.category,
          read_time: postData.readTime || 5,
          tags: postData.tags,
          date: postData.date,
          author: postData.author,
          status: postData.status,
          views: 0,
          seo: postData.seo
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding blog post:', error);
        throw error;
      }

      const newPost: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content || undefined,
        image: data.image || '/placeholder.svg',
        category: data.category,
        readTime: data.read_time || 5,
        tags: data.tags || undefined,
        date: data.date,
        author: data.author,
        status: (data.status === 'published' || data.status === 'draft') ? data.status : 'draft',
        views: data.views || 0,
        seo: data.seo ? {
          metaTitle: (data.seo as any)?.metaTitle || '',
          metaDescription: (data.seo as any)?.metaDescription || '',
          keywords: (data.seo as any)?.keywords || ''
        } : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setBlogPosts(prev => [newPost, ...prev]);
      toast.success('Blog-Post hinzugefügt!');
      return newPost;
    } catch (err: any) {
      console.error('Error adding blog post:', err);
      toast.error('Fehler beim Hinzufügen des Blog-Posts', {
        description: err.message
      });
      throw err;
    }
  };

  const updateBlogPost = async (id: number, updates: Partial<BlogPost>) => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          title: updates.title,
          slug: updates.slug,
          excerpt: updates.excerpt,
          content: updates.content,
          image: updates.image,
          category: updates.category,
          read_time: updates.readTime,
          tags: updates.tags,
          date: updates.date,
          author: updates.author,
          status: updates.status,
          seo: updates.seo,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        throw error;
      }

      const updatedPost: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content || undefined,
        image: data.image || '/placeholder.svg',
        category: data.category,
        readTime: data.read_time || 5,
        tags: data.tags || undefined,
        date: data.date,
        author: data.author,
        status: (data.status === 'published' || data.status === 'draft') ? data.status : 'draft',
        views: data.views || 0,
        seo: data.seo ? {
          metaTitle: (data.seo as any)?.metaTitle || '',
          metaDescription: (data.seo as any)?.metaDescription || '',
          keywords: (data.seo as any)?.keywords || ''
        } : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setBlogPosts(prev => prev.map(post => post.id === id ? updatedPost : post));
      toast.success('Blog-Post aktualisiert!');
      return updatedPost;
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      toast.error('Fehler beim Aktualisieren des Blog-Posts', {
        description: err.message
      });
      throw err;
    }
  };

  const deleteBlogPost = async (id: number) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting blog post:', error);
        throw error;
      }

      setBlogPosts(prev => prev.filter(post => post.id !== id));
      toast.success('Blog-Post gelöscht!');
    } catch (err: any) {
      console.error('Error deleting blog post:', err);
      toast.error('Fehler beim Löschen des Blog-Posts', {
        description: err.message
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchBlogPosts();
    fetchPages();
  }, []);

  return {
    blogPosts,
    pages,
    isLoading,
    error,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    refetch: () => {
      fetchBlogPosts();
      fetchPages();
    }
  };
};

export default useContent;
