import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface BlogPost {
  id: number;
  title: string;
  status: 'published' | 'draft';
  views: number;
  author: string;
  category: string;
  date: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  tags?: string;
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
  lastUpdated: string;
  content?: string;
}

// Sample data as fallback
const sampleBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: 'Die beste Zeit zum Rasenmähen: Morgens oder abends?',
    status: 'published',
    views: 1245,
    author: 'Max Mustermann',
    category: 'Rasenpflege',
    date: '2025-05-10',
  },
  {
    id: 2,
    title: 'Natürliche Düngemittel für einen gesunden und umweltfreundlichen Rasen',
    status: 'published',
    views: 867,
    author: 'Lisa Schmidt',
    category: 'Düngemittel',
    date: '2025-05-05',
  },
  {
    id: 3,
    title: 'Wie bekämpft man Moos im Rasen? Die 5 besten Methoden',
    status: 'published',
    views: 1532,
    author: 'Thomas Weber',
    category: 'Probleme',
    date: '2025-04-28',
  },
  {
    id: 4,
    title: 'Vorbereitung auf den Winter: So schützen Sie Ihren Rasen',
    status: 'draft',
    views: 0,
    author: 'Lisa Schmidt',
    category: 'Saisonale Pflege',
    date: '2025-05-12',
  },
  {
    id: 5,
    title: 'Die richtige Bewässerung in Trockenperioden',
    status: 'draft',
    views: 0,
    author: 'Max Mustermann',
    category: 'Bewässerung',
    date: '2025-05-14',
  }
];

const samplePages: Page[] = [
  {
    id: 1,
    title: 'Startseite',
    path: '/',
    lastUpdated: '2025-05-01',
  },
  {
    id: 2,
    title: 'Über uns',
    path: '/about',
    lastUpdated: '2025-04-20',
  },
  {
    id: 3,
    title: 'Kontakt',
    path: '/contact',
    lastUpdated: '2025-03-15',
  },
  {
    id: 4,
    title: 'Datenschutz',
    path: '/privacy',
    lastUpdated: '2025-01-10',
  },
  {
    id: 5,
    title: 'Impressum',
    path: '/imprint',
    lastUpdated: '2025-01-10',
  }
];

export const useContent = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Prüfen, ob die blog_posts-Tabelle existiert
      const { error: blogTableError } = await supabase
        .from('blog_posts')
        .select('id')
        .limit(1);
      
      // Prüfen, ob die pages-Tabelle existiert
      const { error: pagesTableError } = await supabase
        .from('pages')
        .select('id')
        .limit(1);
      
      const hasBlogTable = !blogTableError || blogTableError.message.includes('permission');
      const hasPagesTable = !pagesTableError || pagesTableError.message.includes('permission');
      
      // Fetch blog posts if table exists
      if (hasBlogTable) {
        const { data: blogData, error: blogError } = await supabase
          .from('blog_posts')
          .select('*')
          .order('date', { ascending: false });
        
        if (blogError) {
          console.error('Error fetching blog posts:', blogError);
          throw new Error('Failed to fetch blog posts');
        }
        
        if (blogData && blogData.length > 0) {
          setBlogPosts(blogData);
        } else {
          console.log('No blog posts found, using sample data');
          setBlogPosts(sampleBlogPosts);
        }
      } else {
        console.log('Blog posts table does not exist, using sample data');
        setBlogPosts(sampleBlogPosts);
        
        toast.warning('Blog-Tabelle existiert nicht in der Datenbank', {
          description: 'Verwende Beispieldaten. Erstellen Sie die Tabelle "blog_posts" in Supabase.'
        });
      }
      
      // Fetch pages if table exists
      if (hasPagesTable) {
        const { data: pagesData, error: pagesError } = await supabase
          .from('pages')
          .select('*')
          .order('lastUpdated', { ascending: false });
        
        if (pagesError) {
          console.error('Error fetching pages:', pagesError);
          throw new Error('Failed to fetch pages');
        }
        
        if (pagesData && pagesData.length > 0) {
          setPages(pagesData);
        } else {
          console.log('No pages found, using sample data');
          setPages(samplePages);
        }
      } else {
        console.log('Pages table does not exist, using sample data');
        setPages(samplePages);
        
        toast.warning('Seiten-Tabelle existiert nicht in der Datenbank', {
          description: 'Verwende Beispieldaten. Erstellen Sie die Tabelle "pages" in Supabase.'
        });
      }
      
    } catch (err: any) {
      console.error('Error in fetchContent:', err);
      setError(err.message);
      
      // Use sample data as fallback
      setBlogPosts(sampleBlogPosts);
      setPages(samplePages);
      
      toast.error('Fehler beim Laden der Inhalte', {
        description: 'Verwende Beispieldaten als Fallback.'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const createBlogPost = async (post: Omit<BlogPost, 'id' | 'views'>): Promise<number | null> => {
    try {
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'blog_posts');
      
      if (tablesError) {
        console.error('Error checking for blog_posts table:', tablesError);
        throw new Error('Failed to check for blog_posts table');
      }
      
      const hasBlogTable = existingTables && existingTables.length > 0;
      
      if (!hasBlogTable) {
        console.log('Blog posts table does not exist, cannot create post');
        toast.error('Blog-Tabelle existiert nicht in der Datenbank', {
          description: 'Erstellen Sie die Tabelle "blog_posts" in Supabase.'
        });
        return null;
      }
      
      const newPost = {
        ...post,
        views: 0
      };
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([newPost])
        .select();
      
      if (error) {
        console.error('Error creating blog post:', error);
        throw new Error('Failed to create blog post');
      }
      
      const createdPost = data![0];
      
      // Update local state
      setBlogPosts(prev => [createdPost, ...prev]);
      
      toast.success('Blogbeitrag erstellt', {
        description: 'Ihr Blogbeitrag wurde erfolgreich erstellt'
      });
      
      return createdPost.id;
    } catch (err: any) {
      console.error('Error in createBlogPost:', err);
      
      toast.error('Fehler beim Erstellen des Blogbeitrags', {
        description: err.message
      });
      return null;
    }
  };
  
  const updateBlogPost = async (id: number, post: Partial<BlogPost>): Promise<boolean> => {
    try {
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'blog_posts');
      
      if (tablesError) {
        console.error('Error checking for blog_posts table:', tablesError);
        throw new Error('Failed to check for blog_posts table');
      }
      
      const hasBlogTable = existingTables && existingTables.length > 0;
      
      if (!hasBlogTable) {
        // If table doesn't exist, update in local state only
        setBlogPosts(prev => 
          prev.map(p => p.id === id ? { ...p, ...post } : p)
        );
        
        toast.success('Blogbeitrag aktualisiert (lokaler Modus)', {
          description: 'Änderungen wurden lokal gespeichert.'
        });
        
        return true;
      }
      
      const { error } = await supabase
        .from('blog_posts')
        .update(post)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating blog post:', error);
        throw new Error('Failed to update blog post');
      }
      
      // Update local state
      setBlogPosts(prev => 
        prev.map(p => p.id === id ? { ...p, ...post } : p)
      );
      
      toast.success('Blogbeitrag aktualisiert', {
        description: 'Ihre Änderungen wurden erfolgreich gespeichert'
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in updateBlogPost:', err);
      
      toast.error('Fehler beim Aktualisieren des Blogbeitrags', {
        description: err.message
      });
      return false;
    }
  };
  
  const deleteBlogPost = async (id: number): Promise<boolean> => {
    try {
      const { data: existingTables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'blog_posts');
      
      if (tablesError) {
        console.error('Error checking for blog_posts table:', tablesError);
        throw new Error('Failed to check for blog_posts table');
      }
      
      const hasBlogTable = existingTables && existingTables.length > 0;
      
      if (hasBlogTable) {
        const { error } = await supabase
          .from('blog_posts')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Error deleting blog post:', error);
          throw new Error('Failed to delete blog post');
        }
      }
      
      // Update local state regardless of whether table exists
      setBlogPosts(prev => prev.filter(p => p.id !== id));
      
      toast.success('Blogbeitrag gelöscht', {
        description: 'Der Blogbeitrag wurde erfolgreich gelöscht'
      });
      
      return true;
    } catch (err: any) {
      console.error('Error in deleteBlogPost:', err);
      
      toast.error('Fehler beim Löschen des Blogbeitrags', {
        description: err.message
      });
      return false;
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  return {
    blogPosts,
    pages,
    isLoading,
    error,
    refreshContent: fetchContent,
    createBlogPost,
    updateBlogPost,
    deleteBlogPost
  };
};
