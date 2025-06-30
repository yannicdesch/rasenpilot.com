
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  author: string;
  category: string;
  tags?: string;
  status: 'published' | 'draft';
  views: number;
  readTime: number;
  date: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string;
  };
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
}

const useContent = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlogPosts = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching blog posts:', fetchError);
        throw fetchError;
      }

      // Transform database data to match BlogPost interface
      const transformedPosts: BlogPost[] = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || undefined,
        content: post.content || undefined,
        author: post.author,
        category: post.category,
        tags: post.tags || undefined,
        status: (post.status === 'published' || post.status === 'draft') ? post.status : 'draft',
        views: post.views || 0,
        readTime: post.read_time || 5,
        date: post.date,
        seo: post.seo ? {
          metaTitle: (post.seo as any)?.metaTitle,
          metaDescription: (post.seo as any)?.metaDescription,
          keywords: (post.seo as any)?.keywords
        } : undefined
      }));

      setBlogPosts(transformedPosts);
    } catch (err: any) {
      console.error('Error in fetchBlogPosts:', err);
      setError(err.message);
    }
  };

  const fetchPages = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching pages:', fetchError);
        throw fetchError;
      }

      // Transform database data to match Page interface
      const transformedPages: Page[] = (data || []).map(page => ({
        id: page.id,
        title: page.title,
        path: page.path,
        content: page.content || undefined,
        lastUpdated: page.last_updated,
        meta: page.meta ? {
          title: (page.meta as any)?.title,
          description: (page.meta as any)?.description,
          keywords: (page.meta as any)?.keywords
        } : undefined
      }));

      setPages(transformedPages);
    } catch (err: any) {
      console.error('Error in fetchPages:', err);
      setError(err.message);
    }
  };

  const checkTablesExist = async () => {
    try {
      // Try to query both tables to see if they exist
      const { error: blogError } = await supabase.from('blog_posts').select('count(*)', { count: 'exact' }).limit(1);
      const { error: pagesError } = await supabase.from('pages').select('count(*)', { count: 'exact' }).limit(1);
      
      return !blogError && !pagesError;
    } catch (err) {
      console.error('Error checking tables:', err);
      return false;
    }
  };

  const createBlogPost = async (postData: Omit<BlogPost, 'id' | 'views' | 'readTime'>) => {
    try {
      // Ensure required fields are present
      const dataToInsert = {
        title: postData.title,
        slug: postData.slug || postData.title.toLowerCase().replace(/\s+/g, '-'),
        author: postData.author,
        category: postData.category,
        status: postData.status,
        date: postData.date,
        excerpt: postData.excerpt,
        content: postData.content,
        tags: postData.tags,
        seo: postData.seo || {},
        views: 0,
        read_time: 5
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating blog post:', error);
        throw error;
      }

      // Transform and add to local state
      const newPost: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content || undefined,
        author: data.author,
        category: data.category,
        tags: data.tags || undefined,
        status: (data.status === 'published' || data.status === 'draft') ? data.status : 'draft',
        views: data.views || 0,
        readTime: data.read_time || 5,
        date: data.date,
        seo: data.seo ? {
          metaTitle: (data.seo as any)?.metaTitle,
          metaDescription: (data.seo as any)?.metaDescription,
          keywords: (data.seo as any)?.keywords
        } : undefined
      };

      setBlogPosts(prev => [newPost, ...prev]);
      toast.success('Blog-Post erstellt!');
      return newPost;
    } catch (err: any) {
      console.error('Error creating blog post:', err);
      toast.error('Fehler beim Erstellen des Blog-Posts', {
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
          author: updates.author,
          category: updates.category,
          tags: updates.tags,
          status: updates.status,
          seo: updates.seo || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating blog post:', error);
        throw error;
      }

      // Transform and update local state
      const updatedPost: BlogPost = {
        id: data.id,
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || undefined,
        content: data.content || undefined,
        author: data.author,
        category: data.category,
        tags: data.tags || undefined,
        status: (data.status === 'published' || data.status === 'draft') ? data.status : 'draft',
        views: data.views || 0,
        readTime: data.read_time || 5,
        date: data.date,
        seo: data.seo ? {
          metaTitle: (data.seo as any)?.metaTitle,
          metaDescription: (data.seo as any)?.metaDescription,
          keywords: (data.seo as any)?.keywords
        } : undefined
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

  const createPage = async (pageData: Omit<Page, 'id' | 'lastUpdated'>) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .insert([{
          title: pageData.title,
          path: pageData.path,
          content: pageData.content,
          meta: pageData.meta || {}
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating page:', error);
        throw error;
      }

      const newPage: Page = {
        id: data.id,
        title: data.title,
        path: data.path,
        content: data.content || undefined,
        lastUpdated: data.last_updated,
        meta: data.meta ? {
          title: (data.meta as any)?.title,
          description: (data.meta as any)?.description,
          keywords: (data.meta as any)?.keywords
        } : undefined
      };

      setPages(prev => [newPage, ...prev]);
      toast.success('Seite erstellt!');
      return newPage;
    } catch (err: any) {
      console.error('Error creating page:', err);
      toast.error('Fehler beim Erstellen der Seite', {
        description: err.message
      });
      throw err;
    }
  };

  const updatePage = async (id: number, updates: Partial<Page>) => {
    try {
      const { data, error } = await supabase
        .from('pages')
        .update({
          title: updates.title,
          path: updates.path,
          content: updates.content,
          meta: updates.meta || {},
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating page:', error);
        throw error;
      }

      const updatedPage: Page = {
        id: data.id,
        title: data.title,
        path: data.path,
        content: data.content || undefined,
        lastUpdated: data.last_updated,
        meta: data.meta ? {
          title: (data.meta as any)?.title,
          description: (data.meta as any)?.description,
          keywords: (data.meta as any)?.keywords
        } : undefined
      };

      setPages(prev => prev.map(page => page.id === id ? updatedPage : page));
      toast.success('Seite aktualisiert!');
      return updatedPage;
    } catch (err: any) {
      console.error('Error updating page:', err);
      toast.error('Fehler beim Aktualisieren der Seite', {
        description: err.message
      });
      throw err;
    }
  };

  const deletePage = async (id: number) => {
    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting page:', error);
        throw error;
      }

      setPages(prev => prev.filter(page => page.id !== id));
      toast.success('Seite gelöscht!');
    } catch (err: any) {
      console.error('Error deleting page:', err);
      toast.error('Fehler beim Löschen der Seite', {
        description: err.message
      });
      throw err;
    }
  };

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const tablesExist = await checkTablesExist();
        if (tablesExist) {
          await Promise.all([fetchBlogPosts(), fetchPages()]);
        } else {
          console.log('Content tables do not exist yet');
        }
      } catch (err: any) {
        console.error('Error loading content:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  return {
    blogPosts,
    pages,
    isLoading,
    error,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost,
    createPage,
    updatePage,
    deletePage,
    refetch: () => Promise.all([fetchBlogPosts(), fetchPages()])
  };
};

export default useContent;
